from sqlmodel import SQLModel, Field
from typing import Optional


class Note(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    content: str


class NoteCreate(SQLModel):
    content: str