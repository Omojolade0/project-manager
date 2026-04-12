from app.models.user import User, UserCreate, UserUpdate
from sqlmodel import Session, Relationship, select 
from app.auth import utils as util
from fastapi import HTTPException

def get_user_by_email(email: str, session: Session) -> User | None:
  user = session.exec(select(User).where(User.email == email)).first()
  return user 

def get_user_by_id(user_id:int, session: Session) -> User | None:
  user = session.exec(select(User).where(User.id == user_id)).first()
  return user

def create_user(user_data: UserCreate, session: Session):
  if get_user_by_email(user_data.email, session):
      raise HTTPException(status_code=400, detail="Email already registered")
  
  hashed_password = util.hash_password(user_data.password)
  user = User(username=user_data.username, email=user_data.email, hashed_password=hashed_password)
  session.add(user)
  session.commit()
  session.refresh(user)
  return user


def update_user(user_id:int, user_data: UserUpdate, session: Session):
  user = get_user_by_id(user_id, session)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  
  if user_data.username is not None:
    user.username = user_data.username
  if user_data.email is not None:
    if user.email != user_data.email and get_user_by_email(user_data.email, session):
      raise HTTPException(status_code=400, detail="Email already registered")
    user.email = user_data.email

  if user_data.password is not None:
    user.hashed_password = util.hash_password(user_data.password)

  session.add(user)
  session.commit()
  session.refresh(user)
  return user

def delete_user(user_id:int,  session: Session):
  user = get_user_by_id(user_id, session)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  session.delete(user)
  session.commit()
    

