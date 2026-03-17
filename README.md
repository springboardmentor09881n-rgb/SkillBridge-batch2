# SkillBridge

SkillBridge is a full-stack web platform that connects NGOs with volunteers.

- NGOs can create and manage opportunities
- Volunteers can discover opportunities and apply
- NGOs can review applications and accept/reject volunteers
- Both roles receive in-app notifications for key events

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Lucide icons

### Backend
- FastAPI
- MongoDB (Motor/PyMongo)
- JWT-based auth

## Project Structure

```text
SkillBridge-batch2/
|-- backend/
|   |-- main.py
|   |-- routes/
|   |-- schemas/
|   |-- requirements.txt
|-- skillbridge_frontend/
|   |-- src/
|   |-- package.json
|-- README.md
```

## Milestone Coverage

### Milestone 1: Foundation and Authentication

- Role-based authentication (Volunteer and NGO)
- JWT login/session flow
- Basic dashboard structure for both roles
- Core profile data setup and retrieval

### Milestone 2: Profile and Dashboard Experience

- Volunteer profile edit (name, bio, location, skills)
- NGO profile edit (organization name, description, website)
- Profile photo upload and remove flow
- Dashboard cards and summary data for both roles
- Header, sidebar, and navigation consistency improvements

### Milestone 3: Opportunities, Applications, and Notifications

- Opportunity CRUD (create, list, update, delete with owner checks)
- Search and filtering (skills, location, duration, status, keyword)
- Application system:
  - Apply with message
  - Duplicate-apply prevention
  - NGO accept/reject flow
  - Volunteer and NGO application stats
- Notifications:
  - User-targeted notifications via `user_id`
  - Broadcast notifications for all volunteers on new opportunity and status change
  - Correct notification click routing to relevant pages
- Safe cascade delete on opportunity removal:
  - Delete related applications
  - Notify affected volunteers
  - Clean stale opportunity notifications

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- MongoDB running locally on `mongodb://localhost:27017`

## Local Setup

### 1) Clone

```bash
git clone https://github.com/springboardmentor09881n-rgb/SkillBridge-batch2.git
cd SkillBridge-batch2
```

### 2) Backend Setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Backend runs at: `http://127.0.0.1:8000`

### 3) Frontend Setup

Open a new terminal:

```bash
cd skillbridge_frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## API Overview

Base URL: `http://127.0.0.1:8000`

- Auth/User: `/api/user`
- Profile: `/api/profile`
- Opportunities: `/api/opportunities`
- Dashboard: `/api/dashboard`
- Applications: `/api/applications`
- Notifications: `/api/notifications`

Interactive API docs:
- Swagger UI: `http://127.0.0.1:8000/docs`

## Core Flows

### NGO
1. Register/login
2. Create and manage opportunities
3. Review applications
4. Accept/reject applications
5. Monitor dashboard stats

### Volunteer
1. Register/login
2. Browse opportunities with filters
3. Apply to opportunities
4. Track application status
5. Receive status and opportunity notifications

## Notes

- CORS is enabled for local frontend hosts in backend config.
- Uploaded profile images are served from `/uploads`.
- If backend route changes are not picked up on Windows, clear `__pycache__` and restart the backend.

## Team Workflow

```bash
git pull origin main
```

Then run backend and frontend as above.

## License

This repository is for academic/project use.
