from fastapi import APIRouter, HTTPException
from database import profiles_collection
from schemas.profile_schema import ProfileSchema

router = APIRouter()

@router.post("/profile")
async def create_profile(profile: ProfileSchema):
    # Check if profile exists
    existing_profile = await profiles_collection.find_one({"email": profile.email})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")

    # Insert into MongoDB
    await profiles_collection.insert_one(profile.dict())

    return {"message": "Profile created successfully"}
