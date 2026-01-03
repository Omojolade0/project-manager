from fastapi import APIRouter, Depends
from app.models.project import Project, ProjectUpdate, ProjectCreate
from app.models.user import User
from sqlmodel import Session
from app.crud import project as crud
from app.routers.utils import get_session
from app.auth.dependencies import get_current_user


router = APIRouter(prefix="/projects", tags=["Projects"])



@router.get("/")
def list_projects(
    current_user: User= Depends(get_current_user), 
    session: Session = Depends(get_session)):
    
    """Retrieve a list of all project."""
    return crud.get_all_projects(
        user_id=current_user.id, 
        session=session)

@router.get("/{project_id}")
def retrieve_project(project_id: int, 
                     current_user: User= Depends(get_current_user), 
                     session: Session = Depends(get_session)):
    """Retrieve a list of all project."""
    return crud.get_project_by_id(project_id, 
                                  user_id=current_user.id,
                                  session=session)

@router.post("/")
def create_project( data: ProjectCreate, 
                   current_user: User= Depends(get_current_user),
                   session:Session = Depends(get_session)):
    return crud.create_project(data,
                               user_id=current_user.id,
                               session=session)

@router.put("/{project_id}")
def update_project(project_id: int, 
                   data: ProjectUpdate, 
                   current_user: User = Depends(get_current_user),
                   session:Session = Depends(get_session)):
    return crud.update_project(project_id, data,
                               user_id= current_user.id,
                               session=session)

@router.delete("/{project_id}")
def delete_project(project_id: int, 
                     current_user: User= Depends(get_current_user), 
                     session: Session = Depends(get_session)):
    crud.delete_project(project_id, 
                        user_id=current_user.id,
                        session=session)
    return {"message": "Project deleted"}