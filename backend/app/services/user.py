import uuid
from app.models.user import User
from app.schemas.user import UserCreate, UserPublic, UserUpdate
from sqlmodel import Session, select
from app.core import security as util
from fastapi import HTTPException
from datetime import datetime, timezone
from app.schemas.token import LoginResponse

def get_user_by_email(email: str, session: Session) -> User | None:
  user = session.exec(select(User).where(User.email == email)).first()
  return user

def get_user_by_id(user_id: uuid.UUID, session: Session) -> User | None:
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

def build_login_response(user: User) -> LoginResponse:
  access_token = util.create_access_token({
        "user_id": str(user.id),
        "email": user.email
    })

  return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserPublic.model_validate(user)
    )

def login_user(email: str, password: str, session: Session) -> LoginResponse:
  user = get_user_by_email(email, session)
  if not user:
    raise HTTPException(status_code=401, detail="Invalid credentials")
  if not util.verify_password(password, user.hashed_password):
    raise HTTPException(status_code=401, detail="Invalid credentials")
  return build_login_response(user)


def update_user(user_id: uuid.UUID, user_data: UserUpdate, session: Session) -> User:
  user = get_user_by_id(user_id, session)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  update_fields = user_data.model_dump(exclude_unset=True)

  if "email" in update_fields:
    new_email = update_fields["email"]
    if user.email != new_email and get_user_by_email(new_email, session):
      raise HTTPException(status_code=400, detail="Email already registered")

  if "password" in update_fields:
    validate_password(update_fields["password"])
    update_fields["hashed_password"] = util.hash_password(update_fields.pop("password"))

  for field, value in update_fields.items():
    setattr(user, field, value)

  user.updated_at = datetime.now(timezone.utc)
  session.add(user)
  session.commit()
  session.refresh(user)
  return user

def revoke_refresh_tokens(user_id: uuid.UUID, session: Session) -> None:
  user = get_user_by_id(user_id, session)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  user.token_version += 1
  session.add(user)
  session.commit()

def delete_user(user_id: uuid.UUID,  session: Session) -> None:
  user = get_user_by_id(user_id, session)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  
  session.delete(user)
  session.commit()
    

