from pydantic import BaseModel
from typing import List

class MatchRequest(BaseModel):
    user_id: int
    skills: List[str]
    location: str