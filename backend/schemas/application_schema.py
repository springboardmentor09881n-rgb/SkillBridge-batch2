from pydantic import BaseModel
from typing import Optional

class ApplicationCreate(BaseModel):
    user_id: int
    opportunity_id: int
    message: Optional[str] = None

class ApplicationResponse(BaseModel):
    application_id: int
    user_id: int
    opportunity_id: int
    status: str