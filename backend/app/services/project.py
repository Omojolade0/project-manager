import uuid
from typing import Optional
from datetime import datetime, timezone, timedelta
from app.models.project import Project, ProjectStatus
from app.models.task import Task, TaskStatus
from app.models.notes import Note
from app.schemas.project import ProjectCreate, ProjectUpdate
from fastapi import HTTPException
from sqlmodel import Session, select
from sqlalchemy import func, case


def _greatest_ignoring_nulls(a, b):
    """Two-value GREATEST that ignores NULLs like Postgres's does (only NULL
    if both inputs are NULL), unlike SQLite's multi-arg max() which returns
    NULL if *any* input is NULL."""
    return case(
        (a.is_(None), b),
        (b.is_(None), a),
        (a >= b, a),
        else_=b,
    )


def _project_recency(session: Session):
    """Most recent activity on a project: its own updated_at, or whichever of
    its tasks/notes was touched most recently — computed at read time via
    correlated subqueries, not a stored column."""
    task_max = (
        select(func.max(Task.updated_at))
        .where(Task.project_id == Project.id)
        .correlate(Project)
        .scalar_subquery()
    )
    note_max = (
        select(func.max(Note.updated_at))
        .where(Note.project_id == Project.id)
        .correlate(Project)
        .scalar_subquery()
    )
    if session.bind.dialect.name == "postgresql":
        return func.greatest(Project.updated_at, task_max, note_max)
    # SQLite (used by the test suite) has no GREATEST(); reproduce Postgres's
    # NULL-skipping semantics with nested CASEs instead of SQLite's multi-arg
    # max(), which would return NULL whenever any single input is NULL —
    # i.e. for almost every project, breaking the sort rather than just
    # renaming it.
    return _greatest_ignoring_nulls(
        _greatest_ignoring_nulls(Project.updated_at, task_max), note_max
    )


def _project_status_tier():
    return case(
        (Project.status == ProjectStatus.Active, 0),
        (Project.status == ProjectStatus.Completed, 1),
        (Project.status == ProjectStatus.Inactive, 2),
        else_=3,
    )


def _project_sort_columns(sort: Optional[str], session: Session):
    if sort == "created":
        return [Project.created_at.desc()]
    if sort == "alphabetical":
        return [func.lower(Project.name).asc()]
    # "updated" and default: most recently active first
    return [_project_recency(session).desc().nulls_last()]


def _project_card_extras(project_ids: list[uuid.UUID], session: Session) -> dict:
    if not project_ids:
        return {}

    count_rows = session.exec(
        select(
            Task.project_id,
            func.count().label("task_count"),
            func.sum(case((Task.status == TaskStatus.Done, 1), else_=0)).label("completed_count"),
        )
        .where(Task.project_id.in_(project_ids))
        .group_by(Task.project_id)
    ).all()
    counts_by_project = {
        row.project_id: {
            "task_count": row.task_count,
            "completed_count": int(row.completed_count or 0),
        }
        for row in count_rows
    }

    pinned_tasks = session.exec(
        select(Task)
        .where(Task.project_id.in_(project_ids))
        .where(Task.is_pinned == True)
        .order_by(Task.project_id, Task.position, Task.id)
    ).all()
    pinned_by_project = {}
    for task in pinned_tasks:
        pinned_by_project.setdefault(task.project_id, task)

    extras = {}
    for pid in project_ids:
        counts = counts_by_project.get(pid, {"task_count": 0, "completed_count": 0})
        pinned = pinned_by_project.get(pid)
        extras[pid] = {
            "task_count": counts["task_count"],
            "completed_count": counts["completed_count"],
            "one_pinned_task": {"id": pinned.id, "title": pinned.title} if pinned else None,
        }
    return extras


def _with_card_extras(project: Project, session: Session) -> dict:
    extras = _project_card_extras([project.id], session)
    return {
        **project.model_dump(),
        **extras.get(project.id, {"task_count": 0, "completed_count": 0, "one_pinned_task": None}),
    }


def get_all_projects(user_id: uuid.UUID, page: int, limit: int, session: Session,
                      status: Optional[str] = None, sort: Optional[str] = None) -> dict:
    filters = [Project.user_id == user_id]
    if status:
        filters.append(Project.status == status)

    total = session.exec(
        select(func.count()).select_from(Project).where(*filters)
    ).one()

    order_by = [_project_status_tier(), *_project_sort_columns(sort, session), Project.id]

    results = session.exec(
        select(Project)
        .where(*filters)
        .order_by(*order_by)
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()

    extras = _project_card_extras([p.id for p in results], session)
    items = [
        {
            **p.model_dump(),
            **extras.get(p.id, {"task_count": 0, "completed_count": 0, "one_pinned_task": None}),
        }
        for p in results
    ]

    return {
        "items": items,
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

def get_project_by_id_public(project_id: uuid.UUID, user_id: uuid.UUID, session: Session) -> dict:
  project = get_project_by_id(project_id, user_id, session)
  return _with_card_extras(project, session)

def create_project(data: ProjectCreate, user_id: uuid.UUID,  session:Session) -> dict:
  project = Project(name=data.name, description=data.description, status=data.status, user_id=user_id)
  session.add(project)
  session.commit()
  session.refresh(project)
  return _with_card_extras(project, session)

def update_project(project_id: uuid.UUID, data:ProjectUpdate, user_id: uuid.UUID, session: Session) -> dict:
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
  return _with_card_extras(updater, session)

def delete_project(project_id: uuid.UUID , user_id: uuid.UUID,  session: Session) -> None:
  deleter = get_project_by_id(project_id, user_id, session)
  session.delete(deleter)
  session.commit()

def get_project_stats(user_id: uuid.UUID, session: Session) -> dict:
  now = datetime.now(timezone.utc)
  week_from_now = now + timedelta(days=7)

  overdue_tasks = session.exec(
    select(func.count())
    .select_from(Task)
    .join(Project, Task.project_id == Project.id)
    .where(Project.user_id == user_id)
    .where(Task.due_date < now)
    .where(Task.status != TaskStatus.Done)
  ).one()

  due_this_week_tasks = session.exec(
    select(func.count())
    .select_from(Task)
    .join(Project, Task.project_id == Project.id)
    .where(Project.user_id == user_id)
    .where(Task.due_date >= now)
    .where(Task.due_date <= week_from_now)
    .where(Task.status != TaskStatus.Done)
  ).one()

  active_projects = session.exec(
    select(func.count())
    .select_from(Project)
    .where(Project.user_id == user_id)
    .where(Project.status == ProjectStatus.Active)
  ).one()

  completed_projects = session.exec(
    select(func.count())
    .select_from(Project)
    .where(Project.user_id == user_id)
    .where(Project.status == ProjectStatus.Completed)
  ).one()

  return {
    "overdue_tasks": overdue_tasks,
    "due_this_week_tasks": due_this_week_tasks,
    "active_projects": active_projects,
    "completed_projects": completed_projects,
  }
