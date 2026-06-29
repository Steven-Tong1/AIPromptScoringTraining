"""Authentication API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)
from app.services.auth import AuthService

router = APIRouter()


@router.post("/register", response_model=TokenResponse, summary="用户注册")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account and return JWT token."""
    service = AuthService(db)
    return service.register(user_data)


@router.post("/login", response_model=TokenResponse, summary="用户登录")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    service = AuthService(db)
    return service.login(login_data.username, login_data.password)


@router.get("/me", response_model=UserResponse, summary="获取当前用户信息")
def get_current_user(
    current_user=Depends(AuthService.get_current_user),
):
    """Get the currently authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse, summary="更新个人资料")
def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.get_current_user),
):
    """Update the current user's profile information."""
    service = AuthService(db)
    return service.update_profile(
        current_user.id, update_data.model_dump(exclude_none=True)
    )
