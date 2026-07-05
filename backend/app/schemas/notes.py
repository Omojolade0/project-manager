import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class NoteCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)
    is_pinned: bool = Field(default=False)

class NoteUpdate(BaseModel):
    content: Optional[str] = Field(default=None, min_length=1, max_length=5000)
    is_pinned: Optional[bool] = None

class NotePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    content: str
    is_pinned: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


class NotePage(BaseModel):
    items: list[NotePublic]
    total: int
    page: int
    limit: int
    has_more: bool