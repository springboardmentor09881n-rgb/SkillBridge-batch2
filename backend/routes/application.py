from fastapi import APIRouter, HTTPException
from schemas.application_schema import ApplicationCreate

router = APIRouter()

applications = []

@router.post("/apply")
def apply_opportunity(application: ApplicationCreate):

    # check duplicate application
    for app in applications:
        if app["user_id"] == application.user_id and app["opportunity_id"] == application.opportunity_id:
            raise HTTPException(status_code=400, detail="Already applied")

    new_application = {
        "user_id": application.user_id,
        "opportunity_id": application.opportunity_id,
        "message": application.message,
        "status": "PENDING"
    }

    applications.append(new_application)

    return {
        "message": "Application submitted successfully",
        "data": new_application
    }