from app.core.dependencies import get_current_user, get_session
from app.models.user import User
from fastapi import APIRouter, Depends 
from app.schemas.notes import NoteCreate, NoteUpdate, NotePublic
from app.services import notes as service 
from sqlmodel import Session


router = APIRouter(prefix="/projects/{project_id}/notes", tags=["Notes"] )


@router.get("", response_model=list[NotePublic])
def get_project_notes(project_id: int ,
                      current_user: User = Depends(get_current_user),
                      page: int = 1, limit: int = 10,
                      session: Session = Depends(get_session)):
  return service.get_all_project_notes(project_id, user_id = current_user.id, page=page, limit=limit, session=session)

@router.get("/{notes_id}", response_model=NotePublic)
def get_note(project_id: int, notes_id: int,
              current_user: User = Depends(get_current_user),
              session: Session = Depends(get_session)):
  return service.get_note_by_id(project_id, notes_id, user_id = current_user.id, session=session)

@router.post("", response_model=NotePublic)
def create_note(project_id: int, data: NoteCreate, 
                current_user: User = Depends(get_current_user),
                session: Session = Depends(get_session)):
  return service.create_note(project_id, data, user_id = current_user.id, session=session)

@router.delete("/{note_id}", status_code=204)
def delete_note(project_id: int, note_id: int,
                 current_user: User = Depends(get_current_user),
                 session: Session = Depends(get_session)):
    service.delete_note(project_id, note_id, user_id=current_user.id, session=session)
  

@router.put("/{note_id}", response_model=NotePublic)
def update_note(project_id: int, note_id: int, data: NoteUpdate, 
                current_user: User = Depends(get_current_user),
                session:Session = Depends(get_session)):
    return service.update_note(project_id, note_id, data, user_id=current_user.id, session=session)


