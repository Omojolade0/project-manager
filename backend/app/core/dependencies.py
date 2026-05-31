from app.models.user import User
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from fastapi import Depends, HTTPException
from typing import Annotated
from jose import jwt, JWTError
from app.services import user as service
from app.schemas.token import TokenData
from app.core.config import SECRET_KEY, ALGORITHM
from app.database import engine

security = HTTPBearer()

def get_session():
    with Session(engine) as session:
        yield session

def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Session = Depends(get_session)
)-> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        userId = payload.get("user_id")
        if userId is None:
            raise credentials_exception
        token_data = TokenData(user_id=userId)
    except JWTError:
        raise credentials_exception
    user = service.get_user_by_id(token_data.user_id, session)
    if user is None:
        raise credentials_exception
    return user