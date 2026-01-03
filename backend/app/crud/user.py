from app.models.user import User, UserCreate
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
