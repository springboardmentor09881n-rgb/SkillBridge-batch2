from fastapi import APIRouter, HTTPException
from bson import ObjectId

from database import opportunities_collection
from schemas.opportunity_schema import OpportunityCreate, OpportunityResponse

router = APIRouter()


@router.post("/", response_model=OpportunityResponse)
async def create_opportunity(op: OpportunityCreate):
    # insert and return with id
    doc = op.dict()
    result = await opportunities_collection.insert_one(doc)
    return OpportunityResponse(id=str(result.inserted_id), **doc)


@router.get("/", response_model=list[OpportunityResponse])
async def list_opportunities():
    items = []
    cursor = opportunities_collection.find({})
    async for doc in cursor:
        items.append(OpportunityResponse(id=str(doc["_id"]), **{k: v for k, v in doc.items() if k != "_id"}))
    return items


@router.get("/{op_id}", response_model=OpportunityResponse)
async def get_opportunity(op_id: str):
    if not ObjectId.is_valid(op_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    doc = await opportunities_collection.find_one({"_id": ObjectId(op_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return OpportunityResponse(id=str(doc["_id"]), **{k: v for k, v in doc.items() if k != "_id"})


@router.put("/{op_id}", response_model=OpportunityResponse)
async def update_opportunity(op_id: str, op: OpportunityCreate):
    if not ObjectId.is_valid(op_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    existing = await opportunities_collection.find_one({"_id": ObjectId(op_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    # ownership check
    if existing.get("owner_email") != op.owner_email:
        raise HTTPException(status_code=403, detail="Not allowed to modify this opportunity")
    await opportunities_collection.update_one({"_id": ObjectId(op_id)}, {"$set": op.dict()})
    return OpportunityResponse(id=op_id, **op.dict())


@router.delete("/{op_id}")
async def delete_opportunity(op_id: str, owner_email: str):
    if not ObjectId.is_valid(op_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    existing = await opportunities_collection.find_one({"_id": ObjectId(op_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    if existing.get("owner_email") != owner_email:
        raise HTTPException(status_code=403, detail="Not allowed to delete this opportunity")
    await opportunities_collection.delete_one({"_id": ObjectId(op_id)})
    return {"message": "Opportunity deleted successfully"}