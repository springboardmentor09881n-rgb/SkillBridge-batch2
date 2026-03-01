from pydantic import BaseModel, EmailStr
from typing import Optional

class ProfileSchema(BaseModel):
    name: str
    email: EmailStr
    age: Optional[int] = None
    bio: Optional[str] = None
    skills: Optional[list[str]] = None

class VolunteerProfileUpdate(BaseModel):
    name: Optional[str] = None
    skills: Optional[list[str]] = None
    location: Optional[str] = None
    bio: Optional[str] = None

class NGOProfileUpdate(BaseModel):
    organization_name: Optional[str] = None
    organization_description: Optional[str] = None
    website_url: Optional[str] = None
