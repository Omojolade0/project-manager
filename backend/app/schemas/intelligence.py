from pydantic import BaseModel

class TaskSuggestion(BaseModel):
    title: str
    description: str
    
class GenerateTaskRequest(BaseModel):
    project_name: str
    project_description: str

class GenerateTaskResponse(BaseModel):
    tasks: list[TaskSuggestion]

