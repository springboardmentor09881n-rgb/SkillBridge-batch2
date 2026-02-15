from pydantic import BaseModel, EmailStr
from typing import Optional

class ProfileSchema(BaseModel):
    name: str
    email: EmailStr
    age: Optional[int] = None
    bio: Optional[str] = None
    skills: Optional[list[str]] = None
