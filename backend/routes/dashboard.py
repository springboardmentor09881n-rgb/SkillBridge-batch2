from fastapi import APIRouter, Depends, HTTPException
from database import users_collection, opportunities_collection
from auth.dependencies import get_current_user

router = APIRouter()

@router.get("/volunteer")
async def get_volunteer_dashboard(user: dict = Depends(get_current_user)):
    if user["role"] != "Volunteer":
        raise HTTPException(status_code=403, detail="Only volunteers can view this dashboard")
        
    volunteer_data = await users_collection.find_one({"email": user["user_id"]})
    
    if not volunteer_data:
        raise HTTPException(status_code=404, detail="Volunteer not found")
        
    # Handle skills being stored as a string (from registration) or an array
    skills = volunteer_data.get("skills", [])
    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(",") if s.strip()]
    elif not isinstance(skills, list):
        skills = []

    return {
        "name": volunteer_data.get("name", volunteer_data.get("full_name", volunteer_data.get("username", ""))),
        "email": volunteer_data.get("email"),
        "skills": skills,
        "bio": volunteer_data.get("bio", ""),
        "location": volunteer_data.get("location", ""),
        "photo_url": volunteer_data.get("photo_url", "")
    }

@router.get("/ngo")
async def get_ngo_dashboard(user: dict = Depends(get_current_user)):
    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can view this dashboard")
        
    ngo_data = await users_collection.find_one({"email": user["user_id"]})
    
    if not ngo_data:
        raise HTTPException(status_code=404, detail="NGO not found")
        
    total_posted = await opportunities_collection.count_documents({"ngo_id": user["user_id"]})
    active_posted = await opportunities_collection.count_documents({
        "ngo_id": user["user_id"],
        "status": "Open"
    })
    
    return {
        "organization_name": ngo_data.get("organization_name", ngo_data.get("username", "")),
        "email": ngo_data.get("email"),
        "organization_description": ngo_data.get("organization_description", ""),
        "website_url": ngo_data.get("website_url", ""),
        "total_opportunities_posted": total_posted,
        "active_opportunities": active_posted,
        "photo_url": ngo_data.get("photo_url", "")
    }
