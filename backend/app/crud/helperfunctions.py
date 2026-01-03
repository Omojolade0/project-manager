from fastapi import HTTPException
from app.models.project import Project
from sqlmodel import Session, Relationship, select 

def project_checker(project_id:int, session: Session):
  checkerProject = session.exec(select(Project).where(Project.id == project_id)).first()
  if not checkerProject:
    raise HTTPException(status_code=404, detail="Project not found")
