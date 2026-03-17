from app.auth.dependencies import get_current_user
from app.models.user import User
from fastapi import APIRouter, Depends 
from app.models.notes import Note, NoteCreate, NoteUpdate
from app.crud import notes as crud 
from sqlmodel import Session
from app.routers.utils import get_session


router = APIRouter(prefix="/projects/{project_id}/notes", tags=["Notes"] )


@router.get("")
def get_project_notes(project_id: int ,
                      current_user: User = Depends(get_current_user),
                      session = Depends(get_session)):
  return crud.get_all_project_notes(project_id, user_id = current_user.id, session=session)

@router.get("/{notes_id}")
def get_note(project_id: int, notes_id: int,
              current_user: User = Depends(get_current_user),
              session = Depends(get_session)):
  return crud.get_note_by_id(project_id, notes_id, user_id = current_user.id, session=session)

@router.post("")
def create_note(project_id: int, data: NoteCreate, 
                current_user: User = Depends(get_current_user),
                session: Session = Depends(get_session)):
  return crud.create_note(project_id, data, user_id = current_user.id, session=session)

@router.delete("/{note_id}")
def delete_note(project_id: int, note_id: int,
                 current_user: User = Depends(get_current_user),
                 session: Session = Depends(get_session)):
    crud.delete_note(project_id, note_id, user_id=current_user.id, session=session)
    return {"message": "Task deleted"}

@router.put("/{note_id}")
def update_note(project_id: int, note_id: int, data: NoteUpdate, 
                current_user: User = Depends(get_current_user),
                session:Session = Depends(get_session)):
    return crud.update_note(project_id, note_id, data, user_id=current_user.id, session=session)


