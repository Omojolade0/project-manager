from app.core.dependencies import get_current_user, get_session
from app.schemas.token import LoginResponse
from fastapi import APIRouter, Depends
from app.schemas.user import UserLogin, UserCreate, UserPublic, UserUpdate
from app.services import user as service 
from sqlmodel import Session 



auth_router = APIRouter(
    prefix='/auth',
    tags=['Auth'],
)

@auth_router.post('/register', response_model= UserPublic)
def create_user_account(data: UserCreate, session: Session = Depends(get_session)):
  return service.create_user(data, session)

@auth_router.post('/login', response_model=LoginResponse)
def user_login(data:UserLogin, session: Session = Depends(get_session)):
  return service.login_user(data.email, data.password, session)
    

@auth_router.get('/me', response_model=UserPublic)
def get_me(current_user: UserPublic = Depends(get_current_user)):
    return current_user

@auth_router.put('/me', response_model=UserPublic)
def update_me(data: UserUpdate, 
              current_user: UserPublic = Depends(get_current_user), 
              session: Session = Depends(get_session)):
    return service.update_user(current_user.id, data, session)
@auth_router.delete('/me', status_code=204)
def delete_me(current_user: UserPublic = Depends(get_current_user), session: Session = Depends(get_session)):
    service.delete_user(current_user.id, session)
    