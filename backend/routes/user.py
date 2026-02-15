from fastapi import APIRouter, HTTPException
from database import users_collection
from schemas.user_schema import UserRegister, UserResponse,UserLogin,Token

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register_user(user: UserRegister):
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # In a real app, hash the password here before saving
    user_data = user.dict()
    
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
    if existing_user['password']!=user.password:
        raise HTTPException(status_code=400,detail="invalid password")
    
    token_resp = signJWT(existing_user['email'], existing_user['role'])
    
    return {
        "username":existing_user['username'],
        "email":existing_user['email'],
        "role":existing_user['role'],
        "message":"user logged in successfully",
        "access_token": token_resp["access_token"],
        "token_type": "bearer"
    }