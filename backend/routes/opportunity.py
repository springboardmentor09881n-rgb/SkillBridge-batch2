from fastapi import APIRouter, Depends, HTTPException
from database import opportunities_collection, notifications_collection
from schemas.opportunity import OpportunityCreate, OpportunityUpdate
from auth.dependencies import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()


# CREATE OPPORTUNITY
@router.post("/")
async def create_opportunity(opportunity: OpportunityCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can create opportunities")

    new_opportunity = opportunity.dict()
    new_opportunity["ngo_id"] = user["user_id"]
    new_opportunity["created_at"] = datetime.utcnow()

    result = await opportunities_collection.insert_one(new_opportunity)

    created_opp = await opportunities_collection.find_one({"_id": result.inserted_id})
    created_opp["_id"] = str(created_opp["_id"])

    # Notification for volunteers
    await notifications_collection.insert_one({
        "type": "new_opportunity",
        "message": f"New Opportunity: {opportunity.title}",
        "opportunity_id": str(result.inserted_id),
        "ngo_id": user["user_id"],
        "role": "Volunteer",
        "read_by": [],
        "created_at": datetime.utcnow()
    })

    return {"message": "Opportunity created successfully", "opportunity": created_opp}


# GET NGO OPPORTUNITIES
@router.get("/ngo")
async def get_ngo_opportunities(user: dict = Depends(get_current_user)):
    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can access this endpoint")

    cursor = opportunities_collection.find({"ngo_id": user["user_id"]})
    opportunities = await cursor.to_list(length=100)

    for opp in opportunities:
        opp["_id"] = str(opp["_id"])

    return opportunities


# GET ALL OPPORTUNITIES (WITH FILTER + SEARCH)
@router.get("/")
async def get_all_opportunities(
    skill: str = None,
    location: str = None,
    duration: str = None,
    search: str = None
):

    query = {}

    # Filtering logic
    if skill:
        query["skills"] = {"$regex": skill, "$options": "i"}

    if location:
        query["location"] = {"$regex": location, "$options": "i"}

    if duration:
        query["duration"] = {"$regex": duration, "$options": "i"}

    # Search functionality
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]

    cursor = opportunities_collection.find(query)
    opportunities = await cursor.to_list(length=100)

    for opp in opportunities:
        opp["_id"] = str(opp["_id"])

    return opportunities


# GET OPPORTUNITY BY ID
@router.get("/{opportunity_id}")
async def get_opportunity_by_id(opportunity_id: str):

    try:
        obj_id = ObjectId(opportunity_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Opportunity ID")

    opp = await opportunities_collection.find_one({"_id": obj_id})

    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    opp["_id"] = str(opp["_id"])

    return opp


# UPDATE OPPORTUNITY
@router.put("/{opportunity_id}")
async def update_opportunity(
    opportunity_id: str,
    opportunity_update: OpportunityUpdate,
    user: dict = Depends(get_current_user)
):

    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can update opportunities")

    try:
        obj_id = ObjectId(opportunity_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Opportunity ID")

    existing_opp = await opportunities_collection.find_one({"_id": obj_id})

    if not existing_opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if existing_opp["ngo_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="You can only update your own opportunities")

    update_data = {k: v for k, v in opportunity_update.dict().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    await opportunities_collection.update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )

    # Notify volunteers if status changed
    if "status" in update_data and update_data["status"] != existing_opp.get("status"):

        new_status = update_data["status"]
        title = existing_opp.get("title", "an opportunity")

        await notifications_collection.insert_one({
            "type": "status_change",
            "message": f"Opportunity {new_status}: {title}",
            "opportunity_id": opportunity_id,
            "ngo_id": user["user_id"],
            "role": "Volunteer",
            "read_by": [],
            "created_at": datetime.utcnow()
        })

    return {"message": "Opportunity updated successfully"}


# DELETE OPPORTUNITY
@router.delete("/{opportunity_id}")
async def delete_opportunity(opportunity_id: str, user: dict = Depends(get_current_user)):

    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can delete opportunities")

    try:
        obj_id = ObjectId(opportunity_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Opportunity ID")

    existing_opp = await opportunities_collection.find_one({"_id": obj_id})

    if not existing_opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if existing_opp["ngo_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own opportunities")

    await opportunities_collection.delete_one({"_id": obj_id})

    return {"message": "Opportunity deleted successfully"}