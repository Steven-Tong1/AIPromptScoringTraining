"""Membership schemas for request/response validation."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MembershipCreate(BaseModel):
    """Schema for creating a membership plan."""

    name: str = Field(..., max_length=50)
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    duration_days: int = Field(..., ge=1)
    max_prompts_per_day: int = Field(default=10, ge=0)
    max_score_queries: int = Field(default=5, ge=0)
    can_use_ai_scoring: bool = False
    can_export_reports: bool = False
    priority_support: bool = False


class MembershipResponse(BaseModel):
    """Schema for membership plan response."""

    id: int
    name: str
    description: Optional[str] = None
    price: float
    duration_days: int
    max_prompts_per_day: int
    max_score_queries: int
    can_use_ai_scoring: bool
    can_export_reports: bool
    priority_support: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserMembershipResponse(BaseModel):
    """Schema for user membership response."""

    id: int
    user_id: int
    membership_id: int
    membership_name: Optional[str] = None
    start_date: datetime
    end_date: datetime
    is_active: bool
    is_expired: bool

    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    """Schema for creating a payment record."""

    membership_id: int
    amount: float = Field(..., ge=0)
    payment_method: Optional[str] = None


class PaymentResponse(BaseModel):
    """Schema for payment record response."""

    id: int
    user_id: int
    membership_id: int
    membership_name: Optional[str] = None
    amount: float
    currency: str
    status: str
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
