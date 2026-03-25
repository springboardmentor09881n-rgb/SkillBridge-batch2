from pydantic import BaseModel
from typing import Optional


class ApplicationCreate(BaseModel):
    opportunity_id: str
    message: Optional[str] = ""


class ApplicationStatusUpdate(BaseModel):
    status: str  # "accepted" | "rejected"
