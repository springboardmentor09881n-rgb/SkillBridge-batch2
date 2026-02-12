from fastapi import APIRouter, HTTPException
from database import profile_collection

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

@router.post("/")
def create_profile(email: str, full_name: str, phone: str, skills: str):

    existing_profile = profile_collection.find_one({"email": email})

    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")

    profile_collection.insert_one({
        "email": email,
        "full_name": full_name,
        "phone": phone,
        "skills": skills.split(",")
    })

    return {"message": "Profile created successfully"}
