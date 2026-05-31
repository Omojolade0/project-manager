from datetime import datetime
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from fastapi import HTTPException
from sqlmodel import Session, select


def get_all_projects (user_id: int, session:Session) -> list[Project]:
  results = session.exec(select(Project).where(Project.user_id == user_id)).all()
  return results 

def get_project_by_id(project_id: int , user_id:int,  session: Session) -> Project:
  result = session.exec(select(Project).where((Project.id == project_id) & (Project.user_id == user_id))).first()
  if not result:
    raise HTTPException(status_code=404, detail="Project not found")
  return result

def create_project(data: ProjectCreate, user_id: int,  session:Session) -> Project:
  project = Project(name=data.name, description=data.description, status=data.status, user_id=user_id)
  session.add(project)
  session.commit()
  session.refresh(project)
  return project

def update_project(project_id: int, data:ProjectUpdate, user_id: int, session: Session) -> Project:
  updater = get_project_by_id(project_id, user_id, session)
  if data.name is not None:
    updater.name = data.name
  if data.description is not None:
    updater.description = data.description
  if data.status is not None:
    updater.status = data.status
  updater.updated_at = datetime.utcnow()
  session.add(updater)
  session.commit()
  session.refresh(updater)
  return updater

def delete_project(project_id: int , user_id:int,  session: Session) -> None:
  deleter = get_project_by_id(project_id, user_id, session)
  session.delete(deleter)
  session.commit()
    
 