from fastapi import APIRouter, HTTPException
from database import users_collection
from schemas.user_schema import UserRegister, UserResponse,UserLogin,Token
import bcrypt

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register_user(user: UserRegister):
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password before saving
    user_data = user.dict()
    hashed_password = bcrypt.hashpw(user_data["password"].encode("utf-8"), bcrypt.gensalt())
    user_data["password"] = hashed_password.decode("utf-8")
    
    await users_collection.insert_one(user_data)

    return {
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "message": "User registered successfully"
    }
from auth.jwt_handler import signJWT

@router.post('/login',response_model=UserResponse)
async def login_user(user:UserLogin):
    existing_user=await users_collection.find_one({"email":user.email})
    if not existing_user:
        raise HTTPException(status_code=400,detail="user not found")
    if not bcrypt.checkpw(user.password.encode("utf-8"), existing_user['password'].encode("utf-8")):
        raise HTTPException(status_code=400,detail="invalid password")
    if existing_user['role'] != user.role:
        raise HTTPException(status_code=400,detail=f"You are registered as {existing_user['role']}, not {user.role}")
    
    token_resp = signJWT(existing_user['email'], existing_user['role'])
    
    return {
        "username":existing_user['username'],
        "email":existing_user['email'],
        "role":existing_user['role'],
        "message":"user logged in successfully",
        "access_token": token_resp["access_token"],
        "token_type": "bearer"
    }