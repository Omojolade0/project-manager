from fastapi import APIRouter, Depends
from app.schemas.project import ProjectUpdate, ProjectCreate, ProjectPublic 
from app.models.user import User
from sqlmodel import Session
from app.services import project as service
from app.core.dependencies import get_session, get_current_user


router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=list[ProjectPublic])
def list_projects(
    current_user: User= Depends(get_current_user), 
    page: int = 1, 
    limit: int = 10,
    session: Session = Depends(get_session)):
    
    """Retrieve a list of all project."""
    return service.get_all_projects(
        user_id=current_user.id, page=page, limit=limit,
        session=session)

@router.get("/{project_id}", response_model=ProjectPublic)
def retrieve_project(project_id: int, 
                     current_user: User= Depends(get_current_user), 
                     session: Session = Depends(get_session)):
    return service.get_project_by_id(project_id, 
                                     user_id=current_user.id,
                                  session=session)

@router.post("", response_model=ProjectPublic)
def create_project( data: ProjectCreate, 
                   current_user: User= Depends(get_current_user),
                   session:Session = Depends(get_session)):
    return service.create_project(data,
                                   user_id=current_user.id,
                                   session=session)

@router.put("/{project_id}", response_model=ProjectPublic)
def update_project(project_id: int, 
                   data: ProjectUpdate, 
                   current_user: User = Depends(get_current_user),
                   session:Session = Depends(get_session)):
    return service.update_project(project_id, data,
                                   user_id= current_user.id,
                                   session=session)

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, 
                     current_user: User= Depends(get_current_user), 
                     session: Session = Depends(get_session)):
    service.delete_project(project_id, 
                        user_id=current_user.id,
                        session=session)
