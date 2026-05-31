from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from app.models.project import ProjectStatus 
from datetime import datetime


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: ProjectStatus = Field(default=ProjectStatus.Active)


class ProjectPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    name: str
    created_at: datetime
    description: Optional[str] = None
    status: ProjectStatus
    updated_at: Optional[datetime] = None

   