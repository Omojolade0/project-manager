import uuid
from app.models.project import Project
from app.models.task import Task
from sqlmodel import Session, select
from sqlalchemy import func

PREVIEW_LIMIT = 5


def _matching_projects(user_id: uuid.UUID, text: str):
  return (
    select(Project)
    .where(Project.user_id == user_id)
    .where(Project.name.ilike(f"%{text}%"))
  )


def _matching_tasks(user_id: uuid.UUID, text: str):
  return (
    select(Task, Project.name)
    .join(Project, Task.project_id == Project.id)
    .where(Project.user_id == user_id)
    .where(Task.title.ilike(f"%{text}%"))
  )


def search(user_id: uuid.UUID, text: str, session: Session, limit: int = 3) -> dict:
  projects = session.exec(_matching_projects(user_id, text).limit(limit)).all()
  task_rows = session.exec(_matching_tasks(user_id, text).limit(limit)).all()

  return {
    "projects": projects,
    "tasks": [task for task, _project_name in task_rows],
  }


def _paginate(stmt, page: int, limit: int, session: Session) -> dict:
  total = session.exec(select(func.count()).select_from(stmt.subquery())).one()
  items = session.exec(stmt.offset((page - 1) * limit).limit(limit)).all()
  return {
    "items": items,
    "total": total,
    "page": page,
    "limit": limit,
    "has_more": (page * limit) < total,
  }


def search_projects(user_id: uuid.UUID, text: str, page: int, limit: int, session: Session) -> dict:
  return _paginate(_matching_projects(user_id, text), page, limit, session)


def search_tasks(user_id: uuid.UUID, text: str, page: int, limit: int, session: Session) -> dict:
  result = _paginate(_matching_tasks(user_id, text), page, limit, session)
  result["items"] = [
    {
      "id": task.id,
      "title": task.title,
      "project_id": task.project_id,
      "project_name": project_name,
    }
    for task, project_name in result["items"]
  ]
  return result


def search_full(user_id: uuid.UUID, text: str, type: str, page: int, limit: int, session: Session) -> dict:
  result = {"projects": None, "tasks": None}

  if type in ("all", "projects"):
    p_page, p_limit = (1, PREVIEW_LIMIT) if type == "all" else (page, limit)
    result["projects"] = search_projects(user_id, text, p_page, p_limit, session)

  if type in ("all", "tasks"):
    t_page, t_limit = (1, PREVIEW_LIMIT) if type == "all" else (page, limit)
    result["tasks"] = search_tasks(user_id, text, t_page, t_limit, session)

  return result