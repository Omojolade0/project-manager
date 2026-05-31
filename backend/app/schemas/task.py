
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.task import TaskStatus, Priority
from datetime import datetime 


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = Field(default=TaskStatus.Todo)  
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    is_pinned: bool = Field(default=False)
   

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    is_pinned: Optional[bool] = None

class TaskPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    assigned_to: Optional[int] = None
    is_pinned: bool
    updated_at: Optional[datetime] = None