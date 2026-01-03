from sqlmodel import SQLModel, Field
from enum import Enum
from typing import Optional


class Status(str, Enum):
    Active = "Active"
    Completed = "Completed"
    Inactive = "Inactive"


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    status: Status = Field(default=Status.Active)
    user_id: int = Field(foreign_key="user.id")


class ProjectUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Status] = None


class ProjectCreate(SQLModel):
    name: str
    description: str
    status: Optional[Status] = Field(default=Status.Active)