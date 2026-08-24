from enum import Enum
import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional
from datetime import datetime


class ThemePreferences(str, Enum):
    light = "light"
    dark = "dark"
    system = "system"

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr  
    password: str  

class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    username: str
    email: EmailStr
    created_at: datetime
    avatar_url: Optional[str] = None
    has_completed_onboarding: bool
    theme_preference: ThemePreferences
    is_guest: bool

class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    has_completed_onboarding: Optional[bool] = None
    theme_preference: Optional[ThemePreferences] = None 
