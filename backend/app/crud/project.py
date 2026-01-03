from app.models.project import Project, ProjectCreate, ProjectUpdate
from fastapi import HTTPException
from sqlmodel import Session, Relationship, select


def get_all_projects (user_id: int, session:Session):
  results = session.exec(select(Project).where(Project.user_id == user_id)).all()
  return results 

def get_project_by_id(project_id: int , user_id:int,  session: Session):
  result = session.exec(select(Project).where((Project.id == project_id) & (Project.user_id == user_id))).first()
  if not result:
    raise HTTPException(status_code=404, detail="Project not found")
  return result

def create_project(data: ProjectCreate, user_id: int,  session:Session):
  project = Project(name=data.name, description=data.description, status=data.status, user_id=user_id)
  session.add(project)
  session.commit()
  session.refresh(project)
  return project

def update_project(project_id: int, data:ProjectUpdate, user_id: int, session: Session):
  updater = session.exec(select(Project).where((Project.id == project_id) & (Project.user_id == user_id))).first()
  if not updater:
    raise HTTPException(status_code=404, detail="Project not found")
  if data.name:
    updater.name = data.name
  if data.description:
    updater.description = data.description
  if data.status:
    updater.status = data.status
  session.add(updater)
  session.commit()
  session.refresh(updater)
  return updater

def delete_project(project_id: int , user_id:int,  session: Session):
  deleter = session.exec(select(Project).where((Project.id == project_id) & (Project.user_id == user_id))).first()
  if not deleter:
    raise HTTPException(status_code=404, detail="Project not found")
  if deleter:
    session.delete(deleter)
    session.commit()
    
