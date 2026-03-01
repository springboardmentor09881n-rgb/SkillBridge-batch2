from fastapi import APIRouter, Depends, HTTPException
from database import opportunities_collection
from schemas.opportunity import OpportunityCreate, OpportunityUpdate, OpportunityDB
from auth.dependencies import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_opportunity(opportunity: OpportunityCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can create opportunities")
    
    new_opportunity = opportunity.dict()
    new_opportunity["ngo_id"] = user["user_id"] # Use email as ngo_id, or what the user id is stored as
    new_opportunity["created_at"] = datetime.utcnow()
    
    result = await opportunities_collection.insert_one(new_opportunity)
    
    # Return the inserted document with _id converted to str
    created_opp = await opportunities_collection.find_one({"_id": result.inserted_id})
    created_opp["_id"] = str(created_opp["_id"])
    
    return {"message": "Opportunity created successfully", "opportunity": created_opp}

@router.get("/ngo")
async def get_ngo_opportunities(user: dict = Depends(get_current_user)):
    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can access this endpoint")
    
    cursor = opportunities_collection.find({"ngo_id": user["user_id"]})
    opportunities = await cursor.to_list(length=100)
    for opp in opportunities:
        opp["_id"] = str(opp["_id"])
        
    return opportunities

@router.get("/")
async def get_all_opportunities():
    # Will be used later for browsing
    cursor = opportunities_collection.find({"status": "Open"})
    opportunities = await cursor.to_list(length=100)
    for opp in opportunities:
        opp["_id"] = str(opp["_id"])
        
    return opportunities

@router.put("/{opportunity_id}")
async def update_opportunity(opportunity_id: str, opportunity_update: OpportunityUpdate, user: dict = Depends(get_current_user)):
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

    return {"message": "Opportunity updated successfully"}

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
