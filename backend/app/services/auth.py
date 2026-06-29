"""Authentication service for user management."""

from datetime import timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.user import UserCreate

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class AuthService:
    """Service handling authentication and user operations."""

    def __init__(self, db: Session):
        self.db = db

    @classmethod
    def get_current_user(
        cls,
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db),
    ) -> User:
        """Dependency: get the currently authenticated user from JWT token."""
        payload = decode_access_token(token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭证",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if user is None or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户不存在或已被禁用",
            )
        return user

    def register(self, user_data: UserCreate) -> dict:
        """Register a new user account."""
        # Check if username exists
        existing_user = (
            self.db.query(User)
            .filter(
                (User.username == user_data.username)
                | (User.email == user_data.email)
            )
            .first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名或邮箱已被注册",
            )

        # Create user
        user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            display_name=user_data.display_name or user_data.username,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # Generate token
        token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=1440),
        )

        from app.schemas.user import UserResponse

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user),
        }

    def login(self, username: str, password: str) -> dict:
        """Authenticate user and return JWT token."""
        user = (
            self.db.query(User)
            .filter(User.username == username)
            .first()
        )
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="账户已被禁用",
            )

        token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=1440),
        )

        from app.schemas.user import UserResponse

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user),
        }

    def get_user_profile(self, user_id: int) -> Optional[User]:
        """Get user profile by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def update_profile(self, user_id: int, update_data: dict) -> User:
        """Update user profile."""
        user = self.get_user_profile(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")

        for key, value in update_data.items():
            if value is not None:
                setattr(user, key, value)

        self.db.commit()
        self.db.refresh(user)
        return user
