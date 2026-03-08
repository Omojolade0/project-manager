from fastapi import HTTPException
from app.models.project import Project
from sqlmodel import Session, Relationship, select 

def project_checker(project_id:int, user_id:int, session: Session):
  checkerProject = session.exec(select(Project).where(Project.id == project_id)).first()
  if not checkerProject or checkerProject.user_id != user_id:
    raise HTTPException(status_code=404, detail="Project not found")
