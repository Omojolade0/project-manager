from sqlmodel import SQLModel, Field
from enum import Enum
from typing import Optional
from datetime import datetime


class ProjectStatus(str, Enum):
    Active = "Active"
    Completed = "Completed"
    Inactive = "Inactive"


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    status: ProjectStatus = Field(default=ProjectStatus.Active)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


