from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from database import profiles_collection, users_collection
from schemas.profile_schema import ProfileSchema, VolunteerProfileUpdate, NGOProfileUpdate
from auth.dependencies import get_current_user
import os, uuid, aiofiles

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

router = APIRouter()

@router.post("/")
async def create_profile(profile: ProfileSchema):
    # Check if profile exists
    existing_profile = await profiles_collection.find_one({"email": profile.email})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")

    await profiles_collection.insert_one(profile.dict())

    return {"message": "Profile created successfully"}

@router.put("/volunteer")
async def update_volunteer_profile(profile_update: VolunteerProfileUpdate, user: dict = Depends(get_current_user)):
    if user["role"] != "Volunteer":
        raise HTTPException(status_code=403, detail="Only volunteers can update this profile")
    
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


@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image files (JPEG, PNG, GIF, WEBP) are allowed")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)

    # Remove old photo file if exists
    user_doc = await users_collection.find_one({"email": user["user_id"]})
    if user_doc and user_doc.get("photo_url"):
        old_file = os.path.join(os.path.dirname(UPLOAD_DIR), user_doc["photo_url"].lstrip("/"))
        if os.path.exists(old_file):
            os.remove(old_file)

    photo_url = f"/uploads/{filename}"
    await users_collection.update_one(
        {"email": user["user_id"]},
        {"$set": {"photo_url": photo_url}}
    )

    return {"photo_url": photo_url}
