from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    VOLUNTEER = "Volunteer"
    NGO = "NGO / Organization"

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: UserRole
    location: Optional[str] = None
    organization_name: Optional[str] = None
    organization_description: Optional[str] = None
    website_url: Optional[str] = None

class UserResponse(BaseModel):
    username: str
    email: EmailStr
    role: UserRole
    message: str
    access_token: Optional[str] = None
    token_type: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: UserRole