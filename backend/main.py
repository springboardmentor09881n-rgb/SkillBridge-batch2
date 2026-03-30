from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.user import router as user_router
from routes.profile import router as profile_router
from routes.opportunity import router as opportunity_router
from routes.dashboard import router as dashboard_router
from routes.notification import router as notification_router
from routes.application import router as application_router
from routes.match import router as match_router
from routes.message import router as message_router, websocket_chat_handler
import os

app = FastAPI(title="SkillBridge Backend")

# ================== CORS ==================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== ROUTERS ==================
app.include_router(user_router, prefix="/api/user", tags=["User"])
app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])
app.include_router(opportunity_router, prefix="/api/opportunities", tags=["Opportunity"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(notification_router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(application_router, prefix="/api/applications", tags=["Applications"])
app.include_router(match_router, prefix="/match", tags=["Match"])
app.include_router(message_router, prefix="/api/messages", tags=["Messages"])

# ================== STATIC FILES ==================
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    await websocket_chat_handler(websocket, user_id)


# ================== ROOT ==================
@app.get("/", tags=["Root"])
async def root():
    return {"message": "Backend running"}
