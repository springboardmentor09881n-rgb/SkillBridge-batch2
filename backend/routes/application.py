from fastapi import APIRouter, Depends, HTTPException
from database import applications_collection, opportunities_collection, notifications_collection, users_collection
from schemas.application import ApplicationCreate, ApplicationStatusUpdate
from auth.dependencies import get_current_user
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter()


def _serialize_date(dt):
    if dt and hasattr(dt, "isoformat"):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")
    return dt


# VOLUNTEER: Submit application
@router.post("/")
async def apply_to_opportunity(application: ApplicationCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "Volunteer":
        raise HTTPException(status_code=403, detail="Only volunteers can apply")

    # Verify opportunity exists and is open
    try:
        opp = await opportunities_collection.find_one({"_id": ObjectId(application.opportunity_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid opportunity ID")

    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    if opp.get("status") != "Open":
        raise HTTPException(status_code=400, detail="This opportunity is no longer accepting applications")

    # Check for duplicate application
    existing = await applications_collection.find_one({
        "volunteer_id": user["user_id"],
        "opportunity_id": application.opportunity_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied to this opportunity")

    # Look up volunteer name from users collection
    vol_user = await users_collection.find_one({"email": user["user_id"]})
    volunteer_name = (vol_user.get("name") or vol_user.get("full_name") or vol_user.get("username", "Volunteer")) if vol_user else "Volunteer"

    new_app = {
        "volunteer_id": user["user_id"],
        "volunteer_name": volunteer_name,
        "opportunity_id": application.opportunity_id,
        "ngo_id": opp["ngo_id"],
        "message": application.message or "",
        "status": "pending",
        "applied_at": datetime.now(timezone.utc)
    }

    result = await applications_collection.insert_one(new_app)

    # Notify the NGO
    await notifications_collection.insert_one({
        "type": "new_application",
        "message": f"New application for: {opp.get('title', 'an opportunity')}",
        "opportunity_id": application.opportunity_id,
        "user_id": opp["ngo_id"],
        "role": "NGO",
        "read_by": [],
        "created_at": datetime.now(timezone.utc)
    })

    return {"message": "Application submitted successfully", "application_id": str(result.inserted_id)}


def _get_ngo_name(ngo: dict, fallback: str = "NGO"):
    return (
        ngo.get("organization_name")
        or ngo.get("name")
        or ngo.get("full_name")
        or ngo.get("username")
        or fallback
    )


# VOLUNTEER: Get my applications
@router.get("/volunteer")
async def get_volunteer_applications(user: dict = Depends(get_current_user)):
    if user["role"] != "Volunteer":
        raise HTTPException(status_code=403, detail="Only volunteers can access this")

    cursor = applications_collection.find({"volunteer_id": user["user_id"]}).sort("applied_at", -1)
    apps = await cursor.to_list(length=100)

    for app in apps:
        app["_id"] = str(app["_id"])
        app["applied_at"] = _serialize_date(app.get("applied_at"))
        # Enrich with opportunity and NGO details
        try:
            opp = await opportunities_collection.find_one({"_id": ObjectId(app["opportunity_id"])})
            if opp:
                app["opportunity_title"] = opp.get("title", "Opportunity")
                app["opportunity_skills"] = opp.get("required_skills", [])
                
                # Fetch NGO name
                ngo_user = await users_collection.find_one({"email": opp["ngo_id"]})
                app["ngo_name"] = _get_ngo_name(ngo_user, opp["ngo_id"]) if ngo_user else opp["ngo_id"]
            else:
                app["opportunity_title"] = "Deleted Opportunity"
                app["opportunity_skills"] = []
                app["ngo_name"] = "SkillBridge Partner"
        except Exception:
            app["opportunity_title"] = "Opportunity"
            app["opportunity_skills"] = []
            app["ngo_name"] = "SkillBridge Partner"

    return apps


# VOLUNTEER: Get application stats
@router.get("/volunteer/stats")
async def get_volunteer_stats(user: dict = Depends(get_current_user)):
    if user["role"] != "Volunteer":
        raise HTTPException(status_code=403, detail="Only volunteers can access this")

    vid = user["user_id"]
    total = await applications_collection.count_documents({"volunteer_id": vid})
    accepted = await applications_collection.count_documents({"volunteer_id": vid, "status": "accepted"})
    pending = await applications_collection.count_documents({"volunteer_id": vid, "status": "pending"})

    return {"applications": total, "accepted": accepted, "pending": pending}


# NGO: Get application stats
@router.get("/ngo/stats")
async def get_ngo_stats(user: dict = Depends(get_current_user)):
    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can access this")

    ngo_id = user["user_id"]
    total = await applications_collection.count_documents({"ngo_id": ngo_id})
    accepted = await applications_collection.count_documents({"ngo_id": ngo_id, "status": "accepted"})
    pending = await applications_collection.count_documents({"ngo_id": ngo_id, "status": "pending"})

    return {"applications": total, "accepted": accepted, "pending": pending}


# NGO: Get applications for my opportunities
@router.get("/ngo")
async def get_ngo_applications(user: dict = Depends(get_current_user)):
    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can access this")

    cursor = applications_collection.find({"ngo_id": user["user_id"]}).sort("applied_at", -1)
    apps = await cursor.to_list(length=100)

    for app in apps:
        app["_id"] = str(app["_id"])
        # Enrich with volunteer name from users collection (always fetch latest)
        vol_user = await users_collection.find_one({"email": app["volunteer_id"]})
        if vol_user:
            app["volunteer_name"] = vol_user.get("name") or vol_user.get("full_name") or vol_user.get("username", "Volunteer")
        # Enrich with opportunity title
        try:
            opp = await opportunities_collection.find_one({"_id": ObjectId(app["opportunity_id"])})
            app["opportunity_title"] = opp.get("title", "Opportunity") if opp else "Deleted Opportunity"
            app["opportunity_skills"] = opp.get("required_skills", []) if opp else []
        except Exception:
            app["opportunity_title"] = "Opportunity"
            app["opportunity_skills"] = []

    return apps


# NGO: Accept or reject an application
@router.put("/{application_id}/status")
async def update_application_status(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    user: dict = Depends(get_current_user)
):
    if user["role"] != "NGO":
        raise HTTPException(status_code=403, detail="Only NGOs can update application status")

    if status_update.status not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'accepted' or 'rejected'")

    try:
        obj_id = ObjectId(application_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")

    app = await applications_collection.find_one({"_id": obj_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app["ngo_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="You can only manage applications for your own opportunities")

    await applications_collection.update_one(
        {"_id": obj_id},
        {"$set": {"status": status_update.status}}
    )

    # Notify the volunteer
    opp = await opportunities_collection.find_one({"_id": ObjectId(app["opportunity_id"])})
    opp_title = opp.get("title", "an opportunity") if opp else "an opportunity"

    status_message = f"Your application for '{opp_title}' was {status_update.status}"
    if status_update.status == "accepted":
        status_message += ". You can now start a chat with the NGO."

    await notifications_collection.insert_one({
        "type": "application_status",
        "message": status_message,
        "opportunity_id": app["opportunity_id"],
        "user_id": app["volunteer_id"],
        "role": "Volunteer",
        "read_by": [],
        "created_at": datetime.utcnow()
    })

    return {"message": f"Application {status_update.status} successfully"}
