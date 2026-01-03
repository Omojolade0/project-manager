from app.models.notes import Note
from sqlmodel import Session, Relationship, select 
from app.crud.helperfunctions import project_checker
from fastapi import HTTPException


def get_all_project_notes(project_id: int, session: Session):
  project_checker(project_id, session)
  results = session.exec(select(Note).where(Note.project_id == project_id)).all()
  return results 

def get_note_by_id(project_id: int, note_id: int, session: Session):
  project_checker(project_id, session)
  results = session.exec(select(Note).where((Note.project_id == project_id) & (Note.id == note_id ))).first()
  if not results:
    raise HTTPException(status_code=404, detail="Note not found")
  return results

def create_note(project_id: int, data, session: Session):
  project_checker(project_id, session)
  newNote = Note(content=data.content, project_id=project_id)
  session.add(newNote)
  session.commit()
  session.refresh(newNote)
  return newNote


def delete_note(project_id: int, note_id:int, session: Session):
  project_checker(project_id, session)
  deleter = session.exec(select(Note).where((Note.project_id == project_id) & (Note.id == note_id))).first()
  if not deleter:
    raise HTTPException(status_code=404, detail="Note not found")
  session.delete(deleter)
  session.commit()
    

def update_note(project_id: int, note_id:int, data, session: Session):
  project_checker(project_id, session)
  updater = session.exec(select(Note).where((Note.project_id == project_id) & (Note.id == note_id ))).first()
  if not updater:
    raise HTTPException(status_code=404, detail="Note not found")
  if data.content:
    updater.content = data.content
  session.add(updater)
  session.commit()
  session.refresh(updater)
  return updater 