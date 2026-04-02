from fastapi import APIRouter, Depends, HTTPException
from database import notifications_collection
from auth.dependencies import get_current_user
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter()


def _serialize_date(dt):
    if dt and hasattr(dt, "isoformat"):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")
    return dt


@router.get("/unread-count")
async def get_unread_count(user: dict = Depends(get_current_user)):
    """Get count of unread notifications for current user."""
    pipeline = [
        {"$match": {"user_id": user["user_id"]}},
        {"$match": {"read_by": {"$nin": [user["user_id"]]}}},
        {"$count": "count"}
    ]
    result = await notifications_collection.aggregate(pipeline).to_list(length=1)
    count = result[0]["count"] if result else 0
    return {"count": count}


@router.put("/read-all")
async def mark_all_as_read(user: dict = Depends(get_current_user)):
    """Mark all notifications as read for current user."""
    await notifications_collection.update_many(
        {"user_id": user["user_id"]},
        {"$addToSet": {"read_by": user["user_id"]}}
    )
    return {"message": "All notifications marked as read"}


@router.get("/")
async def get_notifications(user: dict = Depends(get_current_user)):
    """Get all notifications for the current user (newest first)."""
    cursor = notifications_collection.find(
        {"user_id": user["user_id"]}
    ).sort("created_at", -1)
    notifications = await cursor.to_list(length=50)
    for n in notifications:
        n["_id"] = str(n["_id"])
        n["is_read"] = user["user_id"] in n.get("read_by", [])
        n["created_at"] = _serialize_date(n.get("created_at"))
    return notifications


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, user: dict = Depends(get_current_user)):
    """Mark a single notification as read for current user."""
    try:
        obj_id = ObjectId(notification_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")

    await notifications_collection.update_one(
        {"_id": obj_id},
        {"$addToSet": {"read_by": user["user_id"]}}
    )
    return {"message": "Marked as read"}
