
import uuid
from app.schemas.intelligence import GenerateTaskRequest, GenerateTaskResponse
from app.core.dependencies import get_current_user, get_session
from app.core.limiter import get_user_id_or_ip, limiter
from app.models.user import User
from app.services import intelligence as service
from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

router = APIRouter(prefix="/projects/{project_id}/intelligence", tags=["Intelligence"])

@router.post("/generate-tasks", response_model=GenerateTaskResponse)
@limiter.limit("10/hour", key_func=get_user_id_or_ip)
def generate_tasks(
    request: Request,
    project_id: uuid.UUID,
    data: GenerateTaskRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return service.get_ai_generated_tasks(project_id, data, current_user.id, session)