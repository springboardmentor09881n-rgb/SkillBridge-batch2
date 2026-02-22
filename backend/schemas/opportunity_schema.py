from pydantic import BaseModel, Field
from typing import Optional


class OpportunityCreate(BaseModel):
    title: str
    description: str
    owner_email: str = Field(..., description="Email of the user who created the opportunity")
    location: Optional[str] = None
    skills_required: Optional[list[str]] = None


class OpportunityResponse(OpportunityCreate):
    id: str
