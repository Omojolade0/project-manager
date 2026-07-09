import uuid
from app.models.project import Project
from app.models.task import Task
from sqlmodel import Session, select


def search(user_id: uuid.UUID, text: str, session: Session, limit: int = 3) -> dict:
  projects = session.exec(
    select(Project)
    .where(Project.user_id == user_id)
    .where(Project.name.ilike(f"%{text}%"))
    .limit(limit)
  ).all()

  tasks = session.exec(
    select(Task)
    .join(Project, Task.project_id == Project.id)
    .where(Project.user_id == user_id)
    .where(Task.title.ilike(f"%{text}%"))
    .limit(limit)
  ).all()

  return {
    "projects": projects,
    "tasks": tasks,
  }