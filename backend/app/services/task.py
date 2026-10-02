import uuid
from typing import Optional
from app.models.task import Task, TaskStatus, Priority
from app.models.project import Project, ProjectStatus
from app.schemas.task import TaskCreate, TaskUpdate, ReorderColumn
from sqlmodel import Session, select
from sqlalchemy import func, case, update
from fastapi import HTTPException
from app.core.permissions import verify_project_ownership
from datetime import datetime, timezone


def _unconditional_pin_priority():
  return case((Task.is_pinned == True, 0), else_=1)


def _not_done_first():
  return case((Task.status == TaskStatus.Done, 1), else_=0)


def _project_task_sort_columns(sort: Optional[str]):
  if sort == "created":
    return [Task.created_at.desc()]
  if sort == "updated":
    return [Task.updated_at.desc().nulls_last()]
  if sort == "priority":
    priority_order = case(
      (Task.priority == Priority.High, 0),
      (Task.priority == Priority.Medium, 1),
      (Task.priority == Priority.Low, 2),
      else_=3,
    )
    return [priority_order, Task.due_date.asc().nulls_last()]
  # "deadline" and default: nearest/past due date first
  return [Task.due_date.asc().nulls_last()]


def get_all_project_tasks(project_id: uuid.UUID, page: int, limit: int, user_id: uuid.UUID, session: Session,
                           status: Optional[str] = None, sort: Optional[str] = None) -> dict:
  verify_project_ownership(project_id, user_id, session)

  filters = [Task.project_id == project_id]
  if status:
    filters.append(Task.status == status)

  total = session.exec(
    select(func.count()).select_from(Task).where(*filters)
  ).one()

  order_by = [_not_done_first(), _unconditional_pin_priority(), *_project_task_sort_columns(sort), Task.id]

  results = session.exec(
    select(Task)
    .where(*filters)
    .order_by(*order_by)
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

def create_task(project_id: uuid.UUID, data: TaskCreate, user_id: uuid.UUID, session:Session) -> Task:
  verify_project_ownership(project_id, user_id, session)
  task = Task(title=data.title, 
              description=data.description, 
              priority=data.priority,
              due_date=data.due_date,
              is_pinned=data.is_pinned,
              status=data.status, 
              project_id=project_id)
  session.add(task)
  session.commit()
  session.refresh(task)
  return task

def get_task_by_id(project_id: uuid.UUID, task_id: uuid.UUID, user_id: uuid.UUID, session: Session) -> Task:
  verify_project_ownership(project_id, user_id, session)
  result = session.exec(select(Task).where((Task.project_id == project_id) & (Task.id == task_id ))).first()
  if not result:
    raise HTTPException(status_code=404, detail="Task not found")
  return result


def update_task(project_id: uuid.UUID, task_id: uuid.UUID, data: TaskUpdate, user_id: uuid.UUID, session: Session) -> Task:
  updater = get_task_by_id(project_id, task_id, user_id, session)
  if data.title is not None:
    updater.title = data.title
  if data.description is not None:
    updater.description = data.description
  if data.status is not None:
    updater.status = data.status
  if data.priority is not None:
    updater.priority = data.priority
  if data.due_date is not None:
    updater.due_date = data.due_date
  if data.assigned_to is not None:
    updater.assigned_to = data.assigned_to
  if data.is_pinned is not None:
    updater.is_pinned = data.is_pinned
  if data.position is not None:
    updater.position = data.position
  updater.updated_at = datetime.now(timezone.utc)
  session.add(updater)
  session.commit()
  session.refresh(updater)
  return updater
  

def delete_task(project_id: uuid.UUID, task_id: uuid.UUID, user_id: uuid.UUID, session: Session) -> None:
  deleter = get_task_by_id(project_id, task_id, user_id, session)
  session.delete(deleter)
  session.commit()


def reorder_tasks(project_id: uuid.UUID, columns: list[ReorderColumn], user_id: uuid.UUID, session: Session) -> dict:
  verify_project_ownership(project_id, user_id, session)

  position_by_id: dict[uuid.UUID, int] = {}
  status_by_id: dict[uuid.UUID, TaskStatus] = {}
  for column in columns:
    for index, task_id in enumerate(column.task_ids):
      position_by_id[task_id] = index
      status_by_id[task_id] = column.status

  if not position_by_id:
    return {"success": True}

  task_ids = list(position_by_id.keys())
  position_case = case(
    *[(Task.id == task_id, position) for task_id, position in position_by_id.items()],
    else_=Task.position,
  )
  status_case = case(
    *[(Task.id == task_id, status) for task_id, status in status_by_id.items()],
    else_=Task.status,
  )

  session.exec(
    update(Task)
    .where(Task.id.in_(task_ids), Task.project_id == project_id)
    .values(position=position_case, status=status_case)
  )
  session.commit()
  return {"success": True}


def _pin_priority():
  return case(
    (
      (Task.is_pinned == True)
      & (Project.status == ProjectStatus.Active)
      & (Task.status != TaskStatus.Done),
      0,
    ),
    else_=1,
  )


def _sort_columns(sort: Optional[str]):
  if sort == "created":
    return [Task.created_at.desc()]
  if sort == "updated":
    return [Task.updated_at.desc().nulls_last()]
  if sort == "status":
    status_order = case(
      (Task.status == TaskStatus.Todo, 0),
      (Task.status == TaskStatus.Inprogress, 1),
      (Task.status == TaskStatus.Done, 2),
      else_=3,
    )
    return [status_order, Task.due_date.asc().nulls_last()]
  # "deadline" and default: nearest/past due date first
  return [Task.due_date.asc().nulls_last()]


def get_all_user_tasks(user_id: uuid.UUID, sort: Optional[str], page: int, limit: int, session: Session) -> dict:
  total = session.exec(
    select(func.count())
    .select_from(Task)
    .join(Project, Task.project_id == Project.id)
    .where(Project.user_id == user_id, Task.status != TaskStatus.Done)
  ).one()

  order_by = [_pin_priority(), *_sort_columns(sort), Task.id]

  rows = session.exec(
    select(Task, Project)
    .join(Project, Task.project_id == Project.id)
    .where(Project.user_id == user_id, Task.status != TaskStatus.Done)
    .order_by(*order_by)
    .offset((page - 1) * limit)
    .limit(limit)
  ).all()

  items = [
    {
      **task.model_dump(),
      "project": {"id": project.id, "name": project.name},
    }
    for task, project in rows
  ]

  return {
    "items": items,
    "total": total,
    "page": page,
    "limit": limit,
    "has_more": (page * limit) < total,
  }

