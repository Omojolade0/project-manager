from app.models.task import Task
from app.models.project import Project
from sqlmodel import Session, Relationship, select 
from fastapi import HTTPException
from app.crud.helperfunctions import project_checker


def get_all_project_tasks(project_id:int, user_id:int, session: Session):
  project_checker(project_id, user_id, session)
  results = session.exec(select(Task).where(Task.project_id == project_id)).all()
  return results

def create_task(project_id:int, data, user_id:int, session:Session):
  project_checker(project_id, user_id, session)
  task = Task(title=data.title, description=data.description, status=data.status, project_id=project_id)
  session.add(task)
  session.commit()
  session.refresh(task)
  return task

def get_task_by_id(project_id: int, task_id:int, user_id:int, session: Session):
  project_checker(project_id, user_id, session)
  result = session.exec(select(Task).where((Task.project_id == project_id) & (Task.id == task_id ))).first()
  if not result:
    raise HTTPException(status_code=404, detail="Task not found")
  return result


def update_task(project_id: int, task_id, data, user_id:int, session: Session):
  project_checker(project_id, user_id, session)
  updater = session.exec(select(Task).where((Task.project_id == project_id) & (Task.id == task_id ))).first()
  if not updater:
    raise HTTPException(status_code=404, detail="Task not found")
  if data.title is not None:
    updater.title = data.title
  if data.description is not None:
    updater.description = data.description
  if data.status is not None:
    updater.status = data.status
  session.add(updater)
  session.commit()
  session.refresh(updater)
  return updater
  

def delete_task(project_id: int, task_id:int, user_id:int, session: Session):
  project_checker(project_id, user_id, session=session)
  deleter = session.exec(select(Task).where((Task.project_id == project_id) & (Task.id == task_id ))).first()
  if not deleter:
    raise HTTPException(status_code=404, detail="Task not found")
  session.delete(deleter)
  session.commit()
    
