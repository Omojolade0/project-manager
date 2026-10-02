import uuid
from fastapi import HTTPException
from app.models.project import Project
from sqlmodel import Session, select

def verify_project_ownership(project_id: uuid.UUID, user_id: uuid.UUID, session: Session) -> None:
  checker_project = session.exec(select(Project).where(Project.id == project_id)).first()
  if not checker_project or checker_project.user_id != user_id:
    raise HTTPException(status_code=404, detail="Project not found")
