import pytest
import asyncio
from fastapi.testclient import TestClient

from main import app
from database import opportunities_collection

client = TestClient(app)

@pytest.fixture(autouse=True)
def cleanup_db():
    # clear opportunities before and after each test using the event loop
    loop = asyncio.get_event_loop()
    loop.run_until_complete(opportunities_collection.delete_many({}))
    yield
    loop.run_until_complete(opportunities_collection.delete_many({}))


def test_create_and_retrieve_opportunity():
    payload = {
        "title": "Test Role",
        "description": "Help needed",
        "owner_email": "owner@example.com",
        "location": "Remote",
        "skills_required": ["python"]
    }
    # create
    resp = client.post("/api/opportunities/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "id" in data
    assert data["title"] == payload["title"]

    op_id = data["id"]
    # fetch list
    list_resp = client.get("/api/opportunities/")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    # get by id
    get_resp = client.get(f"/api/opportunities/{op_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == op_id


def test_update_and_ownership_checks():
    payload = {
        "title": "Original",
        "description": "Desc",
        "owner_email": "owner@example.com",
    }
    resp = client.post("/api/opportunities/", json=payload)
    op_id = resp.json()["id"]

    # attempt update with wrong owner
    wrong = payload.copy()
    wrong["title"] = "Hacked"
    wrong["owner_email"] = "other@example.com"
    update_resp = client.put(f"/api/opportunities/{op_id}", json=wrong)
    assert update_resp.status_code == 403

    # update with correct owner
    good = payload.copy()
    good["title"] = "Updated"
    good["owner_email"] = "owner@example.com"
    ok_resp = client.put(f"/api/opportunities/{op_id}", json=good)
    assert ok_resp.status_code == 200
    assert ok_resp.json()["title"] == "Updated"


def test_delete_and_ownership_checks():
    payload = {
        "title": "ToDelete",
        "description": "Desc",
        "owner_email": "owner@example.com",
    }
    resp = client.post("/api/opportunities/", json=payload)
    op_id = resp.json()["id"]

    # wrong owner delete
    del_resp = client.delete(f"/api/opportunities/{op_id}?owner_email=other@example.com")
    assert del_resp.status_code == 403

    # correct owner delete
    ok_resp = client.delete(f"/api/opportunities/{op_id}?owner_email=owner@example.com")
    assert ok_resp.status_code == 200
    assert ok_resp.json()["message"]

    # ensure gone
    missing = client.get(f"/api/opportunities/{op_id}")
    assert missing.status_code == 404
