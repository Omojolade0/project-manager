from fastapi import APIRouter, Depends
from app.models.user import User, UserCreate, UserLogin
from app.crud import user as crud
from sqlmodel import Session 
from app.routers.utils import get_session
from fastapi import HTTPException
from app.auth.utils import verify_password, create_access_token


auth_router = APIRouter(
    prefix='/auth',
    tags=['Auth'],
)

@auth_router.post('/register')
def create_user_account(data: UserCreate, session: Session = Depends(get_session)):
  return crud.create_user(data, session)

@auth_router.post('/login')
def user_login(data:UserLogin, session: Session = Depends(get_session)):
  user = crud.get_user_by_email(data.email, session)
  if not user:
    raise HTTPException(status_code=401, detail="Invalid credentials")
  if not verify_password(data.password, user.hashed_password):
    raise HTTPException(status_code=401, detail="Invalid credentials")
  access_token = create_access_token({
        "user_id": user.id,
        "email": user.email
    })
    
  return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }