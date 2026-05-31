
from app.schemas.intelligence import GenerateTaskRequest, GenerateTaskResponse
from app.core.dependencies import get_current_user, get_session
from app.models.user import User
from app.services import intelligence as service
from fastapi import APIRouter, Depends
from sqlmodel import Session

router = APIRouter(prefix="/projects/{project_id}/intelligence", tags=["Intelligence"])

@router.post("/generate-tasks", response_model=GenerateTaskResponse)
def generate_tasks(
    project_id: int,
    request: GenerateTaskRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return service.get_ai_generated_tasks(project_id, request, current_user.id, session)