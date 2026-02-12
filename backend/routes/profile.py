from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import profiles_collection

router = APIRouter()

# Pydantic model for validation
class ProfileModel(BaseModel):
    name: str
    email: EmailStr
    age: int  # optional, depends on your use-case

@router.post("/profile")
async def create_profile(profile: ProfileModel):
    # Check if profile exists
    existing_profile = await profiles_collection.find_one({"email": profile.email})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")

    # Insert into MongoDB
    await profiles_collection.insert_one(profile.dict())

    return {"message": "Profile created successfully"}
