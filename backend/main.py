from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
from routes.user import router as user_router
from routes.profile import router as profile_router
from routes.opportunity import router as opportunity_router
from routes.dashboard import router as dashboard_router
from routes.notification import router as notification_router
from routes.application import router as application_router
import os
import json

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

# ================== STATIC FILES ==================
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# ================== WEBSOCKET MANAGER ==================
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"User connected. Total users: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"User disconnected. Total users: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# ================== WEBSOCKET ROUTE ==================
@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()

            # Send structured JSON message with notification
            message_data = {
                "type": "message",
                "content": data,
                "notification": "New message received 🔔"
            }

            await manager.broadcast(json.dumps(message_data))

    except WebSocketDisconnect:
        manager.disconnect(websocket)

        # Notify all users when someone disconnects
        disconnect_msg = {
            "type": "system",
            "content": "A user left the chat ❌"
        }

        await manager.broadcast(json.dumps(disconnect_msg))

# ================== ROOT ==================
@app.get("/", tags=["Root"])
async def root():
    return {"message": "Backend Running with WebSocket 🚀"}