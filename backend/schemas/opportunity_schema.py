from pydantic import BaseModel, Field
from typing import Optional, List

class OpportunityCreate(BaseModel):
    title: str
    description: str
    owner_email: str = Field(..., description="Email of the user who created the opportunity")
    location: Optional[str] = None
    duration: Optional[str] = None
    skills: Optional[List[str]] = None
    status: Optional[str] = "open"


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    skills: Optional[List[str]] = None
    status: Optional[str] = None


class OpportunityResponse(BaseModel):
    id: str
    title: str
    description: str
    owner_email: str
    location: Optional[str] = None
    duration: Optional[str] = None
    skills: Optional[List[str]] = None
    status: Optional[str] = None