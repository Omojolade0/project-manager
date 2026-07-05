import uuid
from app.schemas.user import UserPublic
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: uuid.UUID | None = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserPublic