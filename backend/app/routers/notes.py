from fastapi import APIRouter, Depends 
from app.models.notes import Note, NoteCreate
from app.crud import notes as crud 
from sqlmodel import Session
from app.routers.utils import get_session


router = APIRouter(prefix="/projects/{project_id}/notes", tags=["Notes"] )


@router.get("/")
def get_project_notes(project_id: int , session = Depends(get_session)):
  return crud.get_all_project_notes(project_id, session)

@router.get("/{notes_id}")
def get_note(project_id: int, notes_id: int, session = Depends(get_session)):
  return crud.get_note_by_id(project_id, notes_id, session)

@router.post("/")
def create_note(project_id: int, data: NoteCreate, session: Session = Depends(get_session)):
  return crud.create_note(project_id, data, session)

@router.delete("/{note_id}")
def delete_note(project_id: int, note_id: int, session: Session = (Depends(get_session))):
    crud.delete_note(project_id, note_id, session)
    return {"message": "Task deleted"}

@router.put("/{note_id}")
def update_note(project_id: int, note_id: int, data: NoteCreate, session:Session = Depends(get_session)):
    return crud.update_note(project_id, note_id, data, session)


