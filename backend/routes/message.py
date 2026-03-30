from datetime import datetime
from typing import Dict, List, Set

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from pydantic import ValidationError

from auth.dependencies import get_current_user
from auth.jwt_handler import decodeJWT
from database import applications_collection, messages_collection, notifications_collection, users_collection
from schemas.message import ChatMessageCreate

router = APIRouter()


async def _user_exists(user_id: str) -> bool:
    return await users_collection.count_documents({"email": user_id}, limit=1) > 0


async def _is_chat_allowed(user_a: str, user_b: str) -> bool:
    query = {
        "status": "accepted",
        "$or": [
            {"volunteer_id": user_a, "ngo_id": user_b},
            {"volunteer_id": user_b, "ngo_id": user_a},
        ],
    }
    return await applications_collection.count_documents(query, limit=1) > 0


def _serialize_message(doc: dict) -> dict:
    timestamp = doc.get("timestamp")
    if hasattr(timestamp, "isoformat"):
        timestamp = timestamp.isoformat()
    return {
        "_id": str(doc["_id"]),
        "sender_id": doc["sender_id"],
        "receiver_id": doc["receiver_id"],
        "content": doc["content"],
        "timestamp": timestamp,
    }


async def _mark_messages_as_read(receiver_id: str, sender_id: str) -> None:
    await messages_collection.update_many(
        {"sender_id": sender_id, "receiver_id": receiver_id, "is_read": False},
        {"$set": {"is_read": True}},
    )


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(user_id, set()).add(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id not in self.active_connections:
            return
        self.active_connections[user_id].discard(websocket)
        if not self.active_connections[user_id]:
            self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: str, payload: dict):
        sockets = list(self.active_connections.get(user_id, set()))
        disconnected = []
        for socket in sockets:
            try:
                await socket.send_json(payload)
            except Exception:
                disconnected.append(socket)
        for socket in disconnected:
            self.disconnect(user_id, socket)


manager = ConnectionManager()


@router.get("/conversations")
async def get_conversations(user: dict = Depends(get_current_user)):
    me = user["user_id"]

    accepted_apps = await applications_collection.find(
        {
            "status": "accepted",
            "$or": [{"volunteer_id": me}, {"ngo_id": me}],
        },
        {"volunteer_id": 1, "ngo_id": 1},
    ).to_list(length=500)

    peer_ids = set()
    for app in accepted_apps:
        if app.get("volunteer_id") == me:
            peer_ids.add(app.get("ngo_id"))
        elif app.get("ngo_id") == me:
            peer_ids.add(app.get("volunteer_id"))

    # Keep previously active chats visible too.
    message_peers = await messages_collection.aggregate(
        [
            {"$match": {"$or": [{"sender_id": me}, {"receiver_id": me}]}},
            {
                "$project": {
                    "peer": {
                        "$cond": [{"$eq": ["$sender_id", me]}, "$receiver_id", "$sender_id"]
                    }
                }
            },
            {"$group": {"_id": "$peer"}},
        ]
    ).to_list(length=500)
    for item in message_peers:
        peer_ids.add(item["_id"])

    peer_ids.discard(None)
    if not peer_ids:
        return []

    users = await users_collection.find(
        {"email": {"$in": list(peer_ids)}},
        {
            "email": 1,
            "name": 1,
            "full_name": 1,
            "username": 1,
            "organization_name": 1,
            "role": 1,
            "photo_url": 1,
        },
    ).to_list(length=len(peer_ids))
    user_map = {u["email"]: u for u in users}

    result = []
    for peer_id in peer_ids:
        peer = user_map.get(peer_id)
        if not peer:
            continue

        last_message = await messages_collection.find_one(
            {
                "$or": [
                    {"sender_id": me, "receiver_id": peer_id},
                    {"sender_id": peer_id, "receiver_id": me},
                ]
            },
            sort=[("timestamp", -1)],
        )

        unread_count = await messages_collection.count_documents(
            {"sender_id": peer_id, "receiver_id": me, "is_read": False}
        )

        result.append(
            {
                "user_id": peer_id,
                "role": peer.get("role"),
                "display_name": peer.get("organization_name")
                or peer.get("name")
                or peer.get("full_name")
                or peer.get("username")
                or peer_id,
                "photo_url": peer.get("photo_url", ""),
                "last_message": last_message.get("content") if last_message else "",
                "last_message_at": last_message.get("timestamp") if last_message else None,
                "unread_count": unread_count,
                "chat_enabled": await _is_chat_allowed(me, peer_id),
            }
        )

    result.sort(
        key=lambda item: item["last_message_at"] or datetime.min,
        reverse=True,
    )
    return result


@router.get("/history/{other_user_id}")
async def get_conversation_history(
    other_user_id: str,
    limit: int = 100,
    user: dict = Depends(get_current_user),
):
    me = user["user_id"]
    other = other_user_id.strip()

    if not other:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if not await _user_exists(other):
        raise HTTPException(status_code=404, detail="User not found")
    if not await _is_chat_allowed(me, other):
        raise HTTPException(status_code=403, detail="Chat is only available for accepted applications")

    messages = await messages_collection.find(
        {
            "$or": [
                {"sender_id": me, "receiver_id": other},
                {"sender_id": other, "receiver_id": me},
            ]
        }
    ).sort("timestamp", 1).to_list(length=max(1, min(limit, 500)))

    # Mark incoming messages as read once loaded.
    await _mark_messages_as_read(me, other)

    return [_serialize_message(doc) for doc in messages]


@router.put("/read/{other_user_id}")
async def mark_conversation_as_read(
    other_user_id: str,
    user: dict = Depends(get_current_user),
):
    me = user["user_id"]
    other = other_user_id.strip()

    if not other:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if not await _user_exists(other):
        raise HTTPException(status_code=404, detail="User not found")
    if not await _is_chat_allowed(me, other):
        raise HTTPException(status_code=403, detail="Chat is only available for accepted applications")

    await _mark_messages_as_read(me, other)
    return {"message": "Conversation marked as read"}


async def websocket_chat_handler(websocket: WebSocket, user_id: str):
    token = websocket.query_params.get("token")
    payload = decodeJWT(token) if token else None

    if not payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    if payload.get("user_id") != user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    if not await _user_exists(user_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            try:
                incoming = ChatMessageCreate(**data)
            except ValidationError:
                await websocket.send_json({"type": "error", "detail": "Invalid message payload"})
                continue

            receiver_id = incoming.receiver_id.strip()
            content = incoming.content.strip()

            if not receiver_id:
                await websocket.send_json({"type": "error", "detail": "Receiver ID is required"})
                continue
            if not content:
                await websocket.send_json({"type": "error", "detail": "Message content cannot be empty"})
                continue
            if not await _user_exists(receiver_id):
                await websocket.send_json({"type": "error", "detail": "Receiver not found"})
                continue
            if not await _is_chat_allowed(user_id, receiver_id):
                await websocket.send_json(
                    {
                        "type": "error",
                        "detail": "Chat is only available for accepted applications",
                    }
                )
                continue

            new_message = {
                "sender_id": user_id,
                "receiver_id": receiver_id,
                "content": content,
                "timestamp": datetime.utcnow(),
                "is_read": False,
            }
            result = await messages_collection.insert_one(new_message)
            stored = await messages_collection.find_one({"_id": result.inserted_id})
            payload = {"type": "message", **_serialize_message(stored)}

            await manager.send_to_user(user_id, payload)
            await manager.send_to_user(receiver_id, payload)

            await notifications_collection.insert_one(
                {
                    "type": "message",
                    "message": "You received a new message",
                    "user_id": receiver_id,
                    "role": None,
                    "read_by": [],
                    "created_at": datetime.utcnow(),
                }
            )
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception:
        manager.disconnect(user_id, websocket)
        try:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        except Exception:
            pass
