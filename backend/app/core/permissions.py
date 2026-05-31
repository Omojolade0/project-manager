from fastapi import HTTPException
from app.models.project import Project
from sqlmodel import Session, select 

def verify_project_ownership(project_id:int, user_id:int, session: Session) -> None:
  checkerProject = session.exec(select(Project).where(Project.id == project_id)).first()
  if not checkerProject or checkerProject.user_id != user_id:
    raise HTTPException(status_code=404, detail="Project not found")
