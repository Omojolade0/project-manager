from passlib.context import CryptContext
from jose import jwt 
from datetime import datetime, timedelta, timezone
from app.auth.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_HOURS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto" )

def hash_password(password: str)-> str:
  return pwd_context.hash(password)

def verify_password(plain_password: str, hash_password:str) -> bool:
  return pwd_context.verify(plain_password, hash_password)



def create_access_token(data: dict, expires_delta: timedelta | None = None ) -> str :
  to_encode = data.copy()
  if expires_delta:
    expire = datetime.now(timezone.utc) + expires_delta
  else:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
  to_encode.update({"exp": expire})
  jwt_encode = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return jwt_encode