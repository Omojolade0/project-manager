from datetime import datetime
from app.models.notes import Note
from app.schemas.notes import NoteCreate, NoteUpdate
from sqlmodel import Session, select 
from app.core.permissions import verify_project_ownership
from fastapi import HTTPException


def get_all_project_notes(project_id: int, user_id: int, page: int, limit: int, session: Session) -> list[Note]:
  verify_project_ownership(project_id, user_id, session)
  results = session.exec(select(Note).where(Note.project_id == project_id)).offset((page - 1) * limit).limit(limit).all()
  return results

def get_note_by_id(project_id: int, note_id: int, user_id: int, session: Session) -> Note:
  verify_project_ownership(project_id, user_id, session)
  results = session.exec(select(Note).where((Note.project_id == project_id) & (Note.id == note_id ))).first()
  if not results:
    raise HTTPException(status_code=404, detail="Note not found")
  return results

def create_note(project_id: int, data: NoteCreate, user_id: int, session: Session) -> Note:
  verify_project_ownership(project_id, user_id, session)
  newNote = Note(content=data.content,
                 is_pinned=data.is_pinned,
                  project_id=project_id)

  session.add(newNote)
  session.commit()
  session.refresh(newNote)
  return newNote


def delete_note(project_id: int, note_id:int, user_id: int, session: Session)-> None:
  verify_project_ownership(project_id, user_id, session)
  deleter = get_note_by_id(project_id, note_id, user_id, session)
  session.delete(deleter)
  session.commit()
    

def update_note(project_id: int, note_id:int, data: NoteUpdate, user_id: int, session: Session) -> Note:
  verify_project_ownership(project_id, user_id, session)
  updater = get_note_by_id(project_id, note_id, user_id, session)
  if data.content is not None:
    updater.content = data.content
  if data.is_pinned is not None:
    updater.is_pinned = data.is_pinned  
  updater.updated_at = datetime.utcnow()
  session.add(updater)
  session.commit()
  session.refresh(updater)
  return updater 