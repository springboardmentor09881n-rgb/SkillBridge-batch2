from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OpportunityBase(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    duration: str
    location: str
    status: str = "Open"  # "Open" | "Closed"

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None

class OpportunityDB(OpportunityBase):
    id: str = Field(alias="_id")
    ngo_id: str
    created_at: datetime
