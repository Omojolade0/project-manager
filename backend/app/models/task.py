from sqlmodel import SQLModel, Field
from enum import Enum
from typing import Optional
from pydantic import BaseModel


class Status_todo(str, Enum):
    Todo = "Todo"
    Inprogress = "Inprogress"
    Done = "Done"


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id", ondelete="CASCADE")
    title: str
    description: str
    status: Status_todo = Field(default=Status_todo.Todo)  # ← Added default


class TaskCreate(BaseModel):
    title: str
    description: str
    status: Optional[Status_todo] = Field(default=Status_todo.Todo)

# best pratice to change the sql model to pydantic models by changing it to be base model 

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Status_todo] = None