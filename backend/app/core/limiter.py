from fastapi import Request
from jose import JWTError, jwt
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import ALGORITHM, SECRET_KEY

limiter = Limiter(key_func=get_remote_address)


def get_user_id_or_ip(request: Request) -> str:
    """Rate-limit key: authenticated user id, falling back to IP if unauthenticated."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[len("Bearer "):]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            if user_id:
                return user_id
        except JWTError:
            pass
    return get_remote_address(request)
