import uuid
from datetime import datetime, timezone
from app.models.notes import Note
from app.schemas.notes import NoteCreate, NoteUpdate
from sqlmodel import Session, select
from sqlalchemy import func
from app.core.permissions import verify_project_ownership
from fastapi import HTTPException


def get_all_project_notes(project_id: uuid.UUID, user_id: uuid.UUID, page: int, limit: int, session: Session) -> dict:
  verify_project_ownership(project_id, user_id, session)
  total = session.exec(
    select(func.count()).select_from(Note).where(Note.project_id == project_id)
  ).one()
  results = session.exec(
    select(Note)
    .where(Note.project_id == project_id)
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

def get_note_by_id(project_id: uuid.UUID, note_id: uuid.UUID, user_id: uuid.UUID, session: Session) -> Note:
  verify_project_ownership(project_id, user_id, session)
  results = session.exec(select(Note).where((Note.project_id == project_id) & (Note.id == note_id ))).first()
  if not results:
    raise HTTPException(status_code=404, detail="Note not found")
  return results

def create_note(project_id: uuid.UUID, data: NoteCreate, user_id: uuid.UUID, session: Session) -> Note:
  verify_project_ownership(project_id, user_id, session)
  newNote = Note(content=data.content,
                 is_pinned=data.is_pinned,
                  project_id=project_id)

  session.add(newNote)
  session.commit()
  session.refresh(newNote)
  return newNote


def delete_note(project_id: uuid.UUID, note_id: uuid.UUID, user_id: uuid.UUID, session: Session)-> None:

  deleter = get_note_by_id(project_id, note_id, user_id, session)
  session.delete(deleter)
  session.commit()
    

def update_note(project_id: uuid.UUID, note_id: uuid.UUID, data: NoteUpdate, user_id: uuid.UUID, session: Session) -> Note:

  updater = get_note_by_id(project_id, note_id, user_id, session)
  if data.content is not None:
    updater.content = data.content
  if data.is_pinned is not None:
    updater.is_pinned = data.is_pinned  
  updater.updated_at = datetime.now(timezone.utc)
  session.add(updater)
  session.commit()
  session.refresh(updater)
  return updater 