# SkillBridge-batch2

## New Opportunity Features

The project now includes an **Opportunity** resource with full CRUD support and ownership validation.

### Endpoints (`/api/opportunities` prefix)

- `POST /` : create a new opportunity
- `GET /` : list all opportunities
- `GET /{id}` : retrieve single opportunity by ID
- `PUT /{id}` : update an opportunity (owner must match)
- `DELETE /{id}?owner_email=...` : delete (owner must match)

Ownership is checked using the `owner_email` field in the request payload or query parameter. Only the original creator can modify or delete an opportunity.

### Testing

A new test suite was added under `tests/test_opportunity.py` demonstrating:

1. Creation and retrieval of opportunities
2. Ownership enforcement on update/delete operations

To run the tests, install the test dependencies and execute `pytest` from the `backend` directory.
