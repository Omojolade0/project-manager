import uuid
from typing import Literal, Optional
from fastapi import APIRouter, Depends
from app.schemas.task import TaskCreate, TaskUpdate, TaskPublic, TaskPage, TaskReorderRequest, AllTasksPage
from app.services import task as service
from sqlmodel import Session
from app.core.dependencies import get_session, get_current_user
from app.models.user import User


router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["Task"] )

all_tasks_router = APIRouter(prefix="/tasks", tags=["Task"])


@all_tasks_router.get("", response_model=AllTasksPage)
def get_all_tasks(sort: Optional[Literal["deadline", "created", "updated", "status"]] = None,
                   page: int = 1, limit: int = 10,
                   current_user: User = Depends(get_current_user),
                   session: Session = Depends(get_session)):
  return service.get_all_user_tasks(user_id=current_user.id, sort=sort, page=page, limit=limit, session=session)

@router.get("", response_model=TaskPage)
def get_project_tasks(project_id: uuid.UUID,
                      current_user: User = Depends(get_current_user),
                      page: int = 1, limit: int = 10,
                      session: Session = Depends(get_session)):
  return service.get_all_project_tasks(project_id, page=page, limit=limit, user_id = current_user.id, session =session)

@router.post("", response_model=TaskPublic)
def create_task(project_id: uuid.UUID, data: TaskCreate,
                current_user: User = Depends(get_current_user),
                session: Session = Depends(get_session)):
  return service.create_task(project_id, data, user_id = current_user.id, session = session)

@router.patch("/reorder")
def reorder_tasks(project_id: uuid.UUID, data: TaskReorderRequest,
                   current_user: User = Depends(get_current_user),
                   session: Session = Depends(get_session)):
  return service.reorder_tasks(project_id, data.columns, user_id = current_user.id, session = session)

@router.get("/{task_id}", response_model=TaskPublic)
def get_task(project_id: uuid.UUID, task_id: uuid.UUID,
             current_user: User = Depends(get_current_user),
             session: Session = Depends(get_session)):
  return service.get_task_by_id(project_id, task_id, user_id = current_user.id, session=session)

@router.put("/{task_id}", response_model=TaskPublic)
def update_task(project_id: uuid.UUID, task_id: uuid.UUID, data: TaskUpdate,
                 current_user: User = Depends(get_current_user),
                 session:Session = Depends(get_session)):
    return service.update_task(project_id, task_id, data,user_id = current_user.id, session=session)

@router.delete("/{task_id}", status_code=204)
def delete_task(project_id: uuid.UUID, task_id: uuid.UUID,
                 current_user: User = Depends(get_current_user),
                 session: Session = Depends(get_session)):
    service.delete_task(project_id, task_id, user_id = current_user.id, session=session)
  


