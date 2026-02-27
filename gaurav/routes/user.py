from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Literal
from database import users_collection

router = APIRouter()

class UserModel(BaseModel):
    email: EmailStr
    password: str
    role: Literal["volunteer", "ngo"]  

@router.post("/register")
async def register_user(user: UserModel):


    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    await users_collection.insert_one(user.dict())

    return {
        "message": "User registered successfully",
        "email": user.email,
        "role": user.role
    }