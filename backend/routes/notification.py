from fastapi import APIRouter, Depends, HTTPException
from database import notifications_collection
from auth.dependencies import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.get("/unread-count")
async def get_unread_count(user: dict = Depends(get_current_user)):
    """Get count of unread notifications for current user."""
    pipeline = [
        {"$match": {"role": user["role"]}},
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
        {"role": user["role"]},
        {"$addToSet": {"read_by": user["user_id"]}}
    )
    return {"message": "All notifications marked as read"}


@router.get("/")
async def get_notifications(user: dict = Depends(get_current_user)):
    """Get all notifications for the current user (newest first)."""
    cursor = notifications_collection.find(
        {"role": user["role"]}
    ).sort("created_at", -1)
    notifications = await cursor.to_list(length=50)
    for n in notifications:
        n["_id"] = str(n["_id"])
        n["is_read"] = user["user_id"] in n.get("read_by", [])
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
