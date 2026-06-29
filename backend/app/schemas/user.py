"""User schemas for request/response validation."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    display_name: Optional[str] = Field(None, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login."""

    username: str
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    display_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    """Schema for user response data."""

    id: int
    username: str
    email: str
    display_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
