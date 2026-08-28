import uuid
from sqlmodel import SQLModel, Field
from enum import Enum
from typing import Optional
from datetime import datetime, timezone


class TaskStatus(str, Enum):
    Todo = "Todo"
    Inprogress = "Inprogress"
    Done = "Done"

class Priority(str, Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"

class Task(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID = Field(foreign_key="project.id", ondelete="CASCADE", index=True)
    title: str
    description: Optional[str] = None
    status: TaskStatus = Field(default=TaskStatus.Todo, index=True)  # ← Added default
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = Field(default=None, index=True)
    is_pinned: bool = Field(default=False, index=True)
    assigned_to: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id", ondelete="SET NULL")
    position: int = Field(default=0)
    deleted_at: Optional[datetime] = None



