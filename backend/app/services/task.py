import uuid
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, ReorderColumn
from sqlmodel import Session, select
from sqlalchemy import func
from fastapi import HTTPException
from app.core.permissions import verify_project_ownership
from datetime import datetime, timezone


def get_all_project_tasks(project_id: uuid.UUID, page: int, limit: int, user_id: uuid.UUID, session: Session) -> dict:
  verify_project_ownership(project_id, user_id, session)
  total = session.exec(
    select(func.count()).select_from(Task).where(Task.project_id == project_id)
  ).one()
  results = session.exec(
    select(Task)
    .where(Task.project_id == project_id)
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
  for column in columns:
    for index, task_id in enumerate(column.task_ids):
      task = session.exec(
        select(Task).where((Task.id == task_id) & (Task.project_id == project_id))
      ).first()
      if not task:
        continue
      task.position = index
      task.status = column.status
      session.add(task)
  session.commit()
  return {"success": True}

