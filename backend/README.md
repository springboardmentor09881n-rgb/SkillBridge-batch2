# SkillBridge – A Platform to Connect Volunteers with NGOs

## New Opportunity Features

The project now includes an **Opportunity** resource with full CRUD support and ownership validation.

### Endpoints (`/api/opportunities` prefix)

- `POST /` : create a new opportunity
- `GET /` : list all opportunities
- `GET /ngo` : list NGO's own opportunities
- `PUT /{id}` : update an opportunity (owner must match)
- `DELETE /{id}` : delete (owner must match)

Ownership is checked using JWT authentication. Only the original creator (NGO) can modify or delete an opportunity.

### Testing

A new test suite was added under `tests/test_opportunity.py` demonstrating:

1. Creation and retrieval of opportunities
2. Ownership enforcement on update/delete operations

To run the tests, install the test dependencies and execute `pytest` from the `backend` directory.
