from pydantic import BaseModel, Field


class ChatMessageCreate(BaseModel):
    receiver_id: str = Field(min_length=1)
    content: str = Field(min_length=1)
