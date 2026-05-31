from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class NoteCreate(BaseModel):
    content: str
    is_pinned: bool = Field(default=False)

class NoteUpdate(BaseModel):
    content: Optional[str] = None
    is_pinned: Optional[bool] = None

class NotePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    content: str
    is_pinned: bool
    created_at: datetime
    updated_at: Optional[datetime] = None