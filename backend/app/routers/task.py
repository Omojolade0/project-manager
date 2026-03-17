from fastapi import APIRouter, Depends
from app.models.task import Task, TaskCreate, TaskUpdate
from app.crud import task as crud 
from sqlmodel import Session
from app.routers.utils import get_session
from app.auth.dependencies import get_current_user
from app.models.user import User


router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["Task"] )

@router.get("")
def get_project_tasks(project_id: int, session: Session = Depends(get_session),
                      current_user: User = Depends(get_current_user)):
  return crud.get_all_project_tasks(project_id, user_id = current_user.id, session =session)

@router.post("")
def create_task(project_id: int, data: TaskCreate, 
                current_user: User = Depends(get_current_user),
                session: Session = Depends(get_session)):
  return crud.create_task(project_id, data, user_id = current_user.id, session = session)

@router.get("/{task_id}")
def get_task(project_id: int, task_id: int,
             current_user: User = Depends(get_current_user),
             session: Session = Depends(get_session)):
  return crud.get_task_by_id(project_id, task_id, user_id = current_user.id, session=session)

@router.put("/{task_id}")
def update_task(project_id: int, task_id: int, data: TaskUpdate,
                 current_user: User = Depends(get_current_user),
                 session:Session = Depends(get_session)):
    return crud.update_task(project_id, task_id, data,user_id = current_user.id, session=session)

@router.delete("/{task_id}")
def delete_task(project_id: int, task_id: int,
                 current_user: User = Depends(get_current_user),
                 session: Session = Depends(get_session)):
    crud.delete_task(project_id, task_id, user_id = current_user.id, session=session)
    return {"message": "Task deleted"}


