from fastapi import APIRouter, HTTPException
from database import user_collection

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/")
def create_user(email: str, role: str):

    existing_user = user_collection.find_one({"email": email})

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user_collection.insert_one({
        "email": email,
        "role": role
    })

    return {"message": "User created successfully"}
