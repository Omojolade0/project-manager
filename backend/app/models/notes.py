from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Note(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id", ondelete="CASCADE")
    content: str
    is_pinned: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None