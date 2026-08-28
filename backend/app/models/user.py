from enum import Enum
import uuid
from app.schemas.user import ThemePreferences
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    is_active: bool = Field(default=True)
    avatar_url: Optional[str] = None
    has_completed_onboarding: bool = Field(default=False)
    theme_preference: ThemePreferences = Field(default=ThemePreferences.system)
    is_guest: bool = Field(default=False)
    token_version: int = Field(default=0)

