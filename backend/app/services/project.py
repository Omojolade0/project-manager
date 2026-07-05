import uuid
from datetime import datetime, timezone
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from fastapi import HTTPException
from sqlmodel import Session, select
from sqlalchemy import func


def get_all_projects(user_id: uuid.UUID, page: int, limit: int, session: Session) -> dict:
    total = session.exec(
        select(func.count()).select_from(Project).where(Project.user_id == user_id)
    ).one()
    results = session.exec(
        select(Project)
        .where(Project.user_id == user_id)
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()
    return {
        "items": results,
        "total": total,
        "page": page,
        "limit": limit,
        "has_more": (page * limit) < total,
    }
def get_project_by_id(project_id: uuid.UUID , user_id: uuid.UUID,  session: Session) -> Project:
  result = session.exec(select(Project).where((Project.id == project_id) & (Project.user_id == user_id))).first()
  if not result:
    raise HTTPException(status_code=404, detail="Project not found")
  return result

def create_project(data: ProjectCreate, user_id: uuid.UUID,  session:Session) -> Project:
  project = Project(name=data.name, description=data.description, status=data.status, user_id=user_id)
  session.add(project)
  session.commit()
  session.refresh(project)
  return project

def update_project(project_id: uuid.UUID, data:ProjectUpdate, user_id: uuid.UUID, session: Session) -> Project:
  updater = get_project_by_id(project_id, user_id, session)
  if data.name is not None:
    updater.name = data.name
  if data.description is not None:
    updater.description = data.description
  if data.status is not None:
    updater.status = data.status
  updater.updated_at = datetime.now(timezone.utc)
  session.add(updater)
  session.commit()
  session.refresh(updater)
  return updater

def delete_project(project_id: uuid.UUID , user_id: uuid.UUID,  session: Session) -> None:
  deleter = get_project_by_id(project_id, user_id, session)
  session.delete(deleter)
  session.commit()
    