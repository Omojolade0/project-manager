import uuid
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

class Note(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID = Field(foreign_key="project.id", ondelete="CASCADE", index=True)
    content: str
    is_pinned: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None