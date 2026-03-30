from copy import deepcopy
from datetime import datetime
from types import SimpleNamespace

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient

from auth.dependencies import get_current_user
from main import app
from routes import message as message_routes
from routes import opportunity as opportunity_routes


def _matches(document, query):
    if not query:
        return True

    for key, value in query.items():
        if key == "$or":
            if not any(_matches(document, item) for item in value):
                return False
            continue

        current = document.get(key)
        if isinstance(value, dict):
            for op, expected in value.items():
                if op == "$ne" and current == expected:
                    return False
                if op == "$in" and current not in expected:
                    return False
                if op == "$nin" and current in expected:
                    return False
            continue

        if current != value:
            return False

    return True


def _apply_projection(document, projection):
    if not projection:
        return deepcopy(document)

    included = {key for key, enabled in projection.items() if enabled}
    if not included:
        return deepcopy(document)

    projected = {}
    if "_id" in document and projection.get("_id", 1):
        projected["_id"] = document["_id"]
    for key in included:
        if key in document:
            projected[key] = document[key]
    return deepcopy(projected)


def _sort_documents(documents, field, direction):
    reverse = direction == -1
    return sorted(
        documents,
        key=lambda item: item.get(field) if item.get(field) is not None else datetime.min,
        reverse=reverse,
    )


class FakeCursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, field, direction):
        self.documents = _sort_documents(self.documents, field, direction)
        return self

    async def to_list(self, length=None):
        if length is None:
            return deepcopy(self.documents)
        return deepcopy(self.documents[:length])


class FakeCollection:
    def __init__(self, documents=None):
        self.documents = [deepcopy(doc) for doc in (documents or [])]

    def find(self, query=None, projection=None):
        matched = [
            _apply_projection(doc, projection)
            for doc in self.documents
            if _matches(doc, query or {})
        ]
        return FakeCursor(matched)

    async def find_one(self, query=None, projection=None, sort=None):
        matched = [
            _apply_projection(doc, projection)
            for doc in self.documents
            if _matches(doc, query or {})
        ]
        if sort:
            for field, direction in reversed(sort):
                matched = _sort_documents(matched, field, direction)
        return matched[0] if matched else None

    async def insert_one(self, document):
        stored = deepcopy(document)
        stored.setdefault("_id", ObjectId())
        self.documents.append(stored)
        return SimpleNamespace(inserted_id=stored["_id"])

    async def insert_many(self, documents):
        inserted_ids = []
        for document in documents:
            result = await self.insert_one(document)
            inserted_ids.append(result.inserted_id)
        return SimpleNamespace(inserted_ids=inserted_ids)

    async def count_documents(self, query=None, limit=None):
        count = 0
        for document in self.documents:
            if _matches(document, query or {}):
                count += 1
                if limit and count >= limit:
                    break
        return count

    async def update_many(self, query, update):
        modified = 0
        for document in self.documents:
            if _matches(document, query):
                for field, value in update.get("$set", {}).items():
                    document[field] = value
                modified += 1
        return SimpleNamespace(modified_count=modified)

    async def update_one(self, query, update):
        modified = 0
        for document in self.documents:
            if _matches(document, query):
                for field, value in update.get("$set", {}).items():
                    document[field] = value
                modified = 1
                break
        return SimpleNamespace(modified_count=modified)


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def patch_matching_collections(monkeypatch):
    users = FakeCollection([
        {
            "_id": ObjectId(),
            "email": "volunteer@example.com",
            "role": "Volunteer",
            "skills": ["Python", "Design", "Public Speaking"],
            "location": "Mumbai",
            "name": "Volunteer",
        },
        {
            "_id": ObjectId(),
            "email": "ngo-alpha@example.com",
            "role": "NGO",
            "organization_name": "Alpha NGO",
        },
        {
            "_id": ObjectId(),
            "email": "ngo-beta@example.com",
            "role": "NGO",
            "organization_name": "Beta NGO",
        },
    ])
    opportunities = FakeCollection([
        {
            "_id": ObjectId(),
            "title": "Full Stack Mentor",
            "description": "Mentor students",
            "required_skills": ["Python", "Design"],
            "duration": "3 months",
            "location": "Mumbai",
            "status": "Open",
            "ngo_id": "ngo-alpha@example.com",
            "created_at": datetime(2026, 1, 5),
        },
        {
            "_id": ObjectId(),
            "title": "Design Volunteer",
            "description": "Design assets",
            "required_skills": ["Design"],
            "duration": "6 weeks",
            "location": "Delhi",
            "status": "Open",
            "ngo_id": "ngo-beta@example.com",
            "created_at": datetime(2026, 1, 6),
        },
        {
            "_id": ObjectId(),
            "title": "Community Host",
            "description": "Coordinate events",
            "required_skills": ["Facilitation"],
            "duration": "2 months",
            "location": "Mumbai",
            "status": "Open",
            "ngo_id": "ngo-beta@example.com",
            "created_at": datetime(2026, 1, 7),
        },
    ])
    notifications = FakeCollection()

    monkeypatch.setattr(opportunity_routes, "users_collection", users)
    monkeypatch.setattr(opportunity_routes, "opportunities_collection", opportunities)
    monkeypatch.setattr(opportunity_routes, "notifications_collection", notifications)
    monkeypatch.setattr(opportunity_routes, "applications_collection", FakeCollection())

    return {
        "users": users,
        "opportunities": opportunities,
        "notifications": notifications,
    }


@pytest.fixture
def patch_message_collections(monkeypatch):
    users = FakeCollection([
        {"_id": ObjectId(), "email": "volunteer@example.com", "role": "Volunteer", "name": "Volunteer"},
        {"_id": ObjectId(), "email": "ngo@example.com", "role": "NGO", "organization_name": "Helping Hands"},
    ])
    applications = FakeCollection([
        {
            "_id": ObjectId(),
            "volunteer_id": "volunteer@example.com",
            "ngo_id": "ngo@example.com",
            "status": "accepted",
        }
    ])
    messages = FakeCollection()
    notifications = FakeCollection()

    monkeypatch.setattr(message_routes, "users_collection", users)
    monkeypatch.setattr(message_routes, "applications_collection", applications)
    monkeypatch.setattr(message_routes, "messages_collection", messages)
    monkeypatch.setattr(message_routes, "notifications_collection", notifications)
    monkeypatch.setattr(
        message_routes,
        "decodeJWT",
        lambda token: {"user_id": token, "role": "Volunteer" if "volunteer" in token else "NGO"},
    )
    message_routes.manager.active_connections.clear()

    return {
        "users": users,
        "applications": applications,
        "messages": messages,
        "notifications": notifications,
    }


def test_match_endpoint_sorts_by_skill_and_location(client, patch_matching_collections):
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "volunteer@example.com",
        "role": "Volunteer",
    }

    response = client.get("/api/opportunities/match")

    assert response.status_code == 200
    data = response.json()
    assert [item["title"] for item in data[:3]] == [
        "Full Stack Mentor",
        "Design Volunteer",
        "Community Host",
    ]
    assert data[0]["match_meta"]["relevance_score"] == 25
    assert data[0]["ngo_name"] == "Alpha NGO"
    assert patch_matching_collections["notifications"].documents[0]["type"] == "match_suggestion"


def test_match_endpoint_blocks_non_volunteers(client, patch_matching_collections):
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "ngo-alpha@example.com",
        "role": "NGO",
    }

    response = client.get("/api/opportunities/match")

    assert response.status_code == 403
    assert response.json()["detail"] == "Only volunteers can access this endpoint"


def test_websocket_chat_sends_receives_and_stores_messages(client, patch_message_collections):
    with client.websocket_connect("/ws/chat/volunteer@example.com?token=volunteer@example.com") as volunteer_ws:
        with client.websocket_connect("/ws/chat/ngo@example.com?token=ngo@example.com") as ngo_ws:
            volunteer_ws.send_json({
                "receiver_id": "ngo@example.com",
                "content": "Hello from the volunteer",
            })

            sender_payload = volunteer_ws.receive_json()
            receiver_payload = ngo_ws.receive_json()

    assert sender_payload["type"] == "message"
    assert receiver_payload["content"] == "Hello from the volunteer"
    assert len(patch_message_collections["messages"].documents) == 1
    assert patch_message_collections["messages"].documents[0]["receiver_id"] == "ngo@example.com"
    assert patch_message_collections["notifications"].documents[0]["type"] == "message"


def test_websocket_rejects_empty_message(client, patch_message_collections):
    with client.websocket_connect("/ws/chat/volunteer@example.com?token=volunteer@example.com") as volunteer_ws:
        volunteer_ws.send_json({
            "receiver_id": "ngo@example.com",
            "content": "   ",
        })

        payload = volunteer_ws.receive_json()

    assert payload["type"] == "error"
    assert payload["detail"] == "Message content cannot be empty"
    assert patch_message_collections["messages"].documents == []


def test_mark_conversation_as_read_updates_unread_messages(client, patch_message_collections):
    patch_message_collections["messages"].documents.append(
        {
            "_id": ObjectId(),
            "sender_id": "ngo@example.com",
            "receiver_id": "volunteer@example.com",
            "content": "Please confirm availability",
            "timestamp": datetime.utcnow(),
            "is_read": False,
        }
    )
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "volunteer@example.com",
        "role": "Volunteer",
    }

    response = client.put("/api/messages/read/ngo@example.com")

    assert response.status_code == 200
    assert patch_message_collections["messages"].documents[0]["is_read"] is True
