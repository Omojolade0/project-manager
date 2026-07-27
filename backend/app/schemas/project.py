import uuid
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from app.models.project import ProjectStatus
from datetime import datetime


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[ProjectStatus] = None


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: ProjectStatus = Field(default=ProjectStatus.Active)


class ProjectPinnedTask(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str


class ProjectPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    created_at: datetime
    description: Optional[str] = None
    status: ProjectStatus
    updated_at: Optional[datetime] = None
    task_count: int = 0
    completed_count: int = 0
    one_pinned_task: Optional[ProjectPinnedTask] = None


class ProjectPage(BaseModel):
    items: list[ProjectPublic]
    total: int
    page: int
    limit: int
    has_more: bool


class ProjectStats(BaseModel):
    overdue_tasks: int
    due_this_week_tasks: int
    active_projects: int
    completed_projects: int