from typing import Annotated
from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user, get_session
from app.models.user import User
from app.schemas.search import SearchRequest, SearchResponse
from app.services import search as service
from sqlmodel import Session


router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=SearchResponse)
def search(data: Annotated[SearchRequest, Depends()],
           current_user: User = Depends(get_current_user),
           session: Session = Depends(get_session)):
  return service.search(user_id=current_user.id, text=data.text, session=session)