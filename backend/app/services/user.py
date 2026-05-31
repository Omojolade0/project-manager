from app.models.user import User
from app.schemas.user import UserCreate, UserPublic, UserUpdate
from sqlmodel import Session, select 
from app.core import security as util
from fastapi import HTTPException
from datetime import datetime
from app.schemas.token import LoginResponse

def get_user_by_email(email: str, session: Session) -> User | None:
  user = session.exec(select(User).where(User.email == email)).first()
  return user 

def get_user_by_id(user_id:int, session: Session) -> User | None:
  user = session.exec(select(User).where(User.id == user_id)).first()
  return user

def validate_password(plain_password: str) -> None:
  if len(plain_password) < 8:
    raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")


def create_user(user_data: UserCreate, session: Session) -> User:
  if get_user_by_email(user_data.email, session):
      raise HTTPException(status_code=400, detail="Email already registered")
  validate_password(user_data.password)
  hashed_password = util.hash_password(user_data.password)
  user = User(username=user_data.username, email=user_data.email, hashed_password=hashed_password)
  session.add(user)
  session.commit()
  session.refresh(user)
  return user

def login_user(email: str, password: str, session: Session) -> LoginResponse:
  user = get_user_by_email(email, session)
  if not user:
    raise HTTPException(status_code=401, detail="Invalid credentials")
  if not util.verify_password(password, user.hashed_password):
    raise HTTPException(status_code=401, detail="Invalid credentials")
  access_token = util.create_access_token({
        "user_id": user.id,
        "email": user.email
    })
    
  return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserPublic.model_validate(user)
    )


def update_user(user_id:int, user_data: UserUpdate, session: Session) -> User:
  user = get_user_by_id(user_id, session)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  
  if user_data.username is not None:
    user.username = user_data.username
  if user_data.email is not None:
    if user.email != user_data.email and get_user_by_email(user_data.email, session):
      raise HTTPException(status_code=400, detail="Email already registered")
    user.email = user_data.email
  if user_data.avatar_url is not None:
    user.avatar_url = user_data.avatar_url  

  if user_data.password is not None:
    validate_password(user_data.password)
    user.hashed_password = util.hash_password(user_data.password)

  user.updated_at = datetime.utcnow()
  session.add(user)
  session.commit()
  session.refresh(user)
  return user

def delete_user(user_id:int,  session: Session) -> None:
  user = get_user_by_id(user_id, session)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  
  session.delete(user)
  session.commit()
    

