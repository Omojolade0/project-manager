from app.core.dependencies import get_current_user, get_session
from app.core import security as util
from app.core.config import REFRESH_TOKEN_EXPIRE_DAYS, SECRET_KEY, ALGORITHM
from app.core.limiter import limiter
from app.schemas.token import LoginResponse
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from app.schemas.user import UserLogin, UserCreate, UserPublic, UserUpdate
from app.services import user as service
from app.services import demo as demo_service
from sqlmodel import Session
from jose import jwt, JWTError
import uuid



auth_router = APIRouter(
    prefix='/auth',
    tags=['Auth'],
)

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_TOKEN_MAX_AGE = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

def _set_refresh_cookie(response: Response, user_id: uuid.UUID, email: str) -> None:
  refresh_token = util.create_refresh_token({
      "user_id": str(user_id),
      "email": email
  })
  response.set_cookie(
      key=REFRESH_COOKIE_NAME,
      value=refresh_token,
      httponly=True,
      secure=True,
      samesite="none",
      max_age=REFRESH_TOKEN_MAX_AGE,
  )

@auth_router.post('/register', response_model= UserPublic)
@limiter.limit("5/hour")
def create_user_account(request: Request, data: UserCreate, session: Session = Depends(get_session)):
  return service.create_user(data, session)

@auth_router.post('/login', response_model=LoginResponse)
@limiter.limit("5/minute")
def user_login(request: Request, data: UserLogin, response: Response, session: Session = Depends(get_session)):
  login_data = service.login_user(data.email, data.password, session)
  _set_refresh_cookie(response, login_data.user.id, login_data.user.email)
  return login_data

@auth_router.post('/demo', response_model=LoginResponse)
@limiter.limit("5/hour")
def create_demo_account(request: Request, response: Response, session: Session = Depends(get_session)):
  guest = demo_service.create_guest_user(session)
  login_data = service.build_login_response(guest)
  _set_refresh_cookie(response, guest.id, guest.email)
  return login_data

@auth_router.post('/refresh', response_model=LoginResponse)
def refresh_access_token(request: Request, session: Session = Depends(get_session)):
  credentials_exception = HTTPException(status_code=401, detail="Could not validate refresh token")

  refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
  if refresh_token is None:
    raise credentials_exception

  try:
    payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    if payload.get("type") != "refresh":
      raise credentials_exception
    raw_user_id = payload.get("user_id")
    if raw_user_id is None:
      raise credentials_exception
    user_id = uuid.UUID(raw_user_id)
  except (JWTError, ValueError):
    raise credentials_exception

  user = service.get_user_by_id(user_id, session)
  if user is None:
    raise credentials_exception

  access_token = util.create_access_token({
      "user_id": str(user.id),
      "email": user.email
  })

  return LoginResponse(
      access_token=access_token,
      token_type="bearer",
      user=UserPublic.model_validate(user)
  )

@auth_router.post('/logout')
def logout(response: Response):
  response.delete_cookie(
      key=REFRESH_COOKIE_NAME,
      httponly=True,
      secure=True,
      samesite="none",
  )
  return {"message": "Logged out"}


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
    