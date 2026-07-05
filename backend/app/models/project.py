import uuid
from sqlmodel import SQLModel, Field
from enum import Enum
from typing import Optional
from datetime import datetime, timezone


class ProjectStatus(str, Enum):
    Active = "Active"
    Completed = "Completed"
    Inactive = "Inactive"


class Project(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    status: ProjectStatus = Field(default=ProjectStatus.Active)
    user_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    owner_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")


