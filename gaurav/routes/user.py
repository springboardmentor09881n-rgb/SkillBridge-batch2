from fastapi import APIRouter, HTTPException
from database import users_collection

router = APIRouter()


@router.post("/register")
async def register_user(user: dict):

    existing_user = await users_collection.find_one({"email": user.get("email")})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    await users_collection.insert_one(user)

    return {
        "message": "User registered successfully",
        "role": user.get("role")
    }
