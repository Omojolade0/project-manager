
import uuid
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.task import TaskStatus, Priority
from datetime import datetime


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: TaskStatus = Field(default=TaskStatus.Todo)
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[uuid.UUID] = None
    is_pinned: bool = Field(default=False)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[uuid.UUID] = None
    is_pinned: Optional[bool] = None
    position: Optional[int] = None

class TaskPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    assigned_to: Optional[uuid.UUID] = None
    is_pinned: bool
    position: int
    updated_at: Optional[datetime] = None


class TaskPage(BaseModel):
    items: list[TaskPublic]
    total: int
    page: int
    limit: int
    has_more: bool


class TaskProjectSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str


class TaskWithProject(TaskPublic):
    project: TaskProjectSummary


class AllTasksPage(BaseModel):
    items: list[TaskWithProject]
    total: int
    page: int
    limit: int
    has_more: bool


class ReorderColumn(BaseModel):
    status: TaskStatus
    task_ids: list[uuid.UUID]


class TaskReorderRequest(BaseModel):
    columns: list[ReorderColumn]