import uuid
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class SearchRequest(BaseModel):
    text: str = Field(min_length=1, max_length=200)


class SearchResultProject(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str


class SearchResultTask(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    project_id: uuid.UUID


class SearchResponse(BaseModel):
    projects: Optional[list[SearchResultProject]] = None
    tasks: Optional[list[SearchResultTask]] = None