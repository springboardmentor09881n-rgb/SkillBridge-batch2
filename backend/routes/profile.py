from fastapi import APIRouter, Depends, HTTPException
from database import profiles_collection, users_collection
from schemas.profile_schema import ProfileSchema, VolunteerProfileUpdate, NGOProfileUpdate
from auth.dependencies import get_current_user

router = APIRouter()

@router.post("/")
async def create_profile(profile: ProfileSchema):
    # Check if profile exists
    existing_profile = await profiles_collection.find_one({"email": profile.email})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")

    # Insert into MongoDB
    await profiles_collection.insert_one(profile.dict())

    return {"message": "Profile created successfully"}

@router.put("/volunteer")
async def update_volunteer_profile(profile_update: VolunteerProfileUpdate, user: dict = Depends(get_current_user)):
    if user["role"] != "Volunteer":
        raise HTTPException(status_code=403, detail="Only volunteers can update this profile")
    
    # Update the user collection (since name, location, etc. are partly in users_collection for auth schema, or profiles_collection)
    # The requirement says "store to users database" but doesn't strictly say if profile is in users or profiles.
    # Let's update `users_collection` as it acts as our main user table here.
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await users_collection.update_one(
        {"email": user["user_id"]},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    return {"message": "Volunteer profile updated successfully"}


@router.put("/ngo")
async def update_ngo_profile(profile_update: NGOProfileUpdate, user: dict = Depends(get_current_user)):
    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can update this profile")
    
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await users_collection.update_one(
        {"email": user["user_id"]},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="NGO not found")

    return {"message": "NGO profile updated successfully"}
