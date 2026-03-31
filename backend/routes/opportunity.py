from fastapi import APIRouter, Depends, HTTPException
from database import opportunities_collection, notifications_collection, users_collection, applications_collection
from schemas.opportunity import OpportunityCreate, OpportunityUpdate
from auth.dependencies import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()


def _normalize_list(value):
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    if isinstance(value, str):
        return [v.strip() for v in value.split(",") if v.strip()]
    return []


def _norm(text: str) -> str:
    return (text or "").strip().lower()


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

    # Notification for all volunteers
    volunteers = await users_collection.find({"role": "Volunteer"}, {"email": 1}).to_list(None)
    if volunteers:
        notifs = [{
            "type": "new_opportunity",
            "message": f"New Opportunity: {opportunity.title}",
            "opportunity_id": str(result.inserted_id),
            "ngo_id": user["user_id"],
            "user_id": v["email"],
            "role": "Volunteer",
            "read_by": [],
            "created_at": datetime.utcnow()
        } for v in volunteers]
        await notifications_collection.insert_many(notifs)

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


# VOLUNTEER: GET MATCHED OPPORTUNITIES
@router.get("/match")
async def get_matched_opportunities(user: dict = Depends(get_current_user)):
    if user["role"] != "Volunteer":
        raise HTTPException(status_code=403, detail="Only volunteers can access this endpoint")

    volunteer = await users_collection.find_one({"email": user["user_id"]})
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    volunteer_skills = {_norm(s) for s in _normalize_list(volunteer.get("skills", []))}
    volunteer_location = _norm(volunteer.get("location", ""))

    open_opportunities = await opportunities_collection.find({"status": {"$ne": "Closed"}}).to_list(length=500)
    ngo_ids = {opp.get("ngo_id") for opp in open_opportunities if opp.get("ngo_id")}
    ngo_users = await users_collection.find(
        {"email": {"$in": list(ngo_ids)}},
        {"email": 1, "organization_name": 1, "name": 1, "full_name": 1, "username": 1},
    ).to_list(length=len(ngo_ids) or 1)
    ngo_map = {ngo["email"]: ngo for ngo in ngo_users}
    scored = []
    match_notifications = []

    for opp in open_opportunities:
        required_skills = _normalize_list(opp.get("required_skills", []))
        required_skills_norm = {_norm(s) for s in required_skills}
        skill_matches = sorted(required_skills_norm.intersection(volunteer_skills))
        location_match = bool(volunteer_location) and _norm(opp.get("location", "")) == volunteer_location
        has_skill_match = len(skill_matches) > 0
        relevance_score = (len(skill_matches) * 10) + (5 if location_match else 0)
        ngo = ngo_map.get(opp.get("ngo_id"), {})

        opp["_id"] = str(opp["_id"])
        opp["ngo_name"] = (
            ngo.get("organization_name")
            or ngo.get("name")
            or ngo.get("full_name")
            or ngo.get("username")
            or opp.get("ngo_id")
            or "NGO"
        )
        opp["match_meta"] = {
            "skill_matches": skill_matches,
            "has_skill_match": has_skill_match,
            "location_match": location_match,
            "relevance_score": relevance_score,
        }
        if relevance_score > 0:
            scored.append(opp)

        if has_skill_match:
            match_notifications.append(
                {
                    "type": "match_suggestion",
                    "message": f"New match found: {opp.get('title', 'Opportunity')}",
                    "opportunity_id": opp["_id"],
                    "user_id": user["user_id"],
                    "role": "Volunteer",
                    "read_by": [],
                    "created_at": datetime.utcnow(),
                }
            )

    scored.sort(
        key=lambda item: (
            item["match_meta"]["has_skill_match"],
            item["match_meta"]["location_match"],
            item["match_meta"]["relevance_score"],
            item.get("created_at", datetime.min),
        ),
        reverse=True,
    )

    # Upsert-like insert: add only unseen match notifications for this user/opportunity.
    for notif in match_notifications[:5]:
        exists = await notifications_collection.count_documents(
            {
                "type": "match_suggestion",
                "user_id": user["user_id"],
                "opportunity_id": notif["opportunity_id"],
            },
            limit=1,
        )
        if not exists:
            await notifications_collection.insert_one(notif)

    return scored


# NGO: GET MATCHED VOLUNTEERS
@router.get("/match-volunteers")
async def get_matched_volunteers(user: dict = Depends(get_current_user)):
    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can access this endpoint")

    # 1. Get NGO's open opportunities
    ngo_opps = await opportunities_collection.find({
        "ngo_id": user["user_id"],
        "status": {"$ne": "Closed"}
    }).to_list(length=100)

    if not ngo_opps:
        return []

    # 2. Get all volunteers
    volunteers = await users_collection.find({"role": "Volunteer"}).to_list(length=1000)

    scored_volunteers = []
    
    for vol in volunteers:
        vol_skills = {_norm(s) for s in _normalize_list(vol.get("skills", []))}
        vol_location = _norm(vol.get("location", ""))
        
        matches_found = []
        max_score = 0
        has_any_match = False
        
        for opp in ngo_opps:
            req_skills = {_norm(s) for s in _normalize_list(opp.get("required_skills", []))}
            skill_matches = sorted(req_skills.intersection(vol_skills))
            loc_match = bool(vol_location) and _norm(opp.get("location", "")) == vol_location
            
            score = (len(skill_matches) * 10) + (5 if loc_match else 0)
            
            if score > 0:
                has_any_match = True
                matches_found.append({
                    "opportunity_title": opp.get("title"),
                    "skill_matches": skill_matches,
                    "location_match": loc_match,
                    "score": score
                })
                if score > max_score:
                    max_score = score
        
        if has_any_match:
            scored_volunteers.append({
                "user_id": vol.get("email"),
                "name": vol.get("full_name") or vol.get("name") or vol.get("username") or "Volunteer",
                "email": vol.get("email"),
                "skills": vol.get("skills"),
                "location": vol.get("location"),
                "max_score": max_score,
                "matches": matches_found[:3],
                "match_meta": {
                    "has_skill_match": any(m["skill_matches"] for m in matches_found),
                    "location_match": any(m["location_match"] for m in matches_found),
                    "skill_matches": list(set().union(*(m["skill_matches"] for m in matches_found)))
                }
            })

    # Sort by max score
    scored_volunteers.sort(key=lambda x: x["max_score"], reverse=True)
    return scored_volunteers[:10]


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

        volunteers = await users_collection.find({"role": "Volunteer"}, {"email": 1}).to_list(None)
        if volunteers:
            notifs = [{
                "type": "status_change",
                "message": f"Opportunity {new_status}: {title}",
                "opportunity_id": opportunity_id,
                "ngo_id": user["user_id"],
                "user_id": v["email"],
                "role": "Volunteer",
                "read_by": [],
                "created_at": datetime.utcnow()
            } for v in volunteers]
            await notifications_collection.insert_many(notifs)

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

    title = existing_opp.get("title", "an opportunity")

    # Find volunteers who applied, then remove their applications
    applied = await applications_collection.find(
        {"opportunity_id": opportunity_id}, {"volunteer_id": 1}
    ).to_list(None)
    volunteer_ids = list({a["volunteer_id"] for a in applied})

    await applications_collection.delete_many({"opportunity_id": opportunity_id})

    # Notify affected volunteers
    if volunteer_ids:
        notifs = [{
            "type": "opportunity_deleted",
            "message": f"Opportunity removed: {title}",
            "opportunity_id": opportunity_id,
            "user_id": vid,
            "role": "Volunteer",
            "read_by": [],
            "created_at": datetime.utcnow()
        } for vid in volunteer_ids]
        await notifications_collection.insert_many(notifs)

    # Clean up old notifications referencing this opportunity
    await notifications_collection.delete_many({"opportunity_id": opportunity_id, "type": {"$ne": "opportunity_deleted"}})

    await opportunities_collection.delete_one({"_id": obj_id})

    return {"message": "Opportunity deleted successfully"}
