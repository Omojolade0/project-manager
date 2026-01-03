from sqlmodel import SQLModel, Field
from enum import Enum
from typing import Optional


class Status_todo(str, Enum):
    Todo = "Todo"
    Inprogress = "Inprogress"
    Done = "Done"


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    title: str
    description: str
    status: Status_todo = Field(default=Status_todo.Todo)  # ← Added default


class TaskCreate(SQLModel):
    title: str
    description: str
    status: Optional[Status_todo] = Field(default=Status_todo.Todo)


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Status_todo] = None