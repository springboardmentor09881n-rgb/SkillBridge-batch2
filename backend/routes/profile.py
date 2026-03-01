from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import profiles_collection, users_collection

router = APIRouter()

class ProfileModel(BaseModel):
    name: str
    email: EmailStr
    age: int


class ProfileUpdateModel(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None

@router.post("/profile")
async def create_profile(profile: ProfileModel):

    current_user = await users_collection.find_one({"email": profile.email})
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user["role"] not in ["volunteer", "ngo"]:
        raise HTTPException(status_code=403, detail="Invalid role")

    existing_profile = await profiles_collection.find_one({"email": profile.email})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")

    await profiles_collection.insert_one(profile.dict())

    return {"message": "Profile created successfully"}

@router.put("/profile/{email}")
async def update_profile(email: str, profile: ProfileUpdateModel):
    current_user = await users_collection.find_one({"email": email})
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user["role"] not in ["volunteer", "ngo"]:
        raise HTTPException(status_code=403, detail="Invalid role")

    existing_profile = await profiles_collection.find_one({"email": email})
    if not existing_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    update_data = {
        key: value
        for key, value in profile.dict().items()
        if value is not None
    }

    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")
    await profiles_collection.update_one(
        {"email": email},
        {"$set": update_data}
    )

    return {"message": "Profile updated successfully"}