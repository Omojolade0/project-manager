from sqlmodel import SQLModel, Field
from enum import Enum
from typing import Optional
from datetime import datetime


class TaskStatus(str, Enum):
    Todo = "Todo"
    Inprogress = "Inprogress"
    Done = "Done"

class Priority(str, Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id", ondelete="CASCADE")
    title: str
    description: Optional[str] = None
    status: TaskStatus = Field(default=TaskStatus.Todo)  # ← Added default
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    is_pinned: bool = Field(default=False)
    assigned_to: Optional[int] = Field(default=None, foreign_key="user.id")



