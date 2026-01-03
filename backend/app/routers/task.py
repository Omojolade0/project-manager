from fastapi import APIRouter, Depends
from app.models.task import Task, TaskCreate, TaskUpdate
from app.crud import task as crud 
from sqlmodel import Session
from app.routers.utils import get_session


router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["Task"] )

@router.get("/")
def get_project_tasks(project_id: int, session: Session = Depends(get_session)):
  return crud.get_all_project_tasks(project_id, session)

@router.post("/")
def create_task(project_id: int, data: TaskCreate, session: Session = Depends(get_session)):
  return crud.create_task(project_id, data, session)

@router.get("/{task_id}")
def get_task(project_id: int, task_id: int,  session: Session = Depends(get_session)):
  return crud.get_task_by_id(project_id, task_id, session)

@router.put("/{task_id}")
def update_task(project_id: int, task_id: int, data: TaskUpdate, session:Session = Depends(get_session)):
    return crud.update_task(project_id, task_id, data, session)

@router.delete("/{task_id}")
def delete_task(project_id: int, task_id: int, session: Session = (Depends(get_session))):
    crud.delete_task(project_id, task_id, session)
    return {"message": "Task deleted"}


