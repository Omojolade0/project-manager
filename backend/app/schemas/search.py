import uuid
from typing import Literal, Optional
from pydantic import BaseModel, Field, ConfigDict


# Search Dropdown 
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



# Search Full Page 

SearchType = Literal["all", "projects", "tasks"]


class SearchFullRequest(BaseModel):
    q: str = Field(min_length=1, max_length=200)
    type: SearchType = Field(default="all")
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)


class SearchResultTaskWithProject(SearchResultTask):
    project_name: str


class ProjectSearchPage(BaseModel):
    items: list[SearchResultProject]
    total: int
    page: int
    limit: int
    has_more: bool


class TaskSearchPage(BaseModel):
    items: list[SearchResultTaskWithProject]
    total: int
    page: int
    limit: int
    has_more: bool


class SearchFullResponse(BaseModel):
    projects: Optional[ProjectSearchPage] = None
    tasks: Optional[TaskSearchPage] = None