"""Membership and payment models."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Membership(Base):
    """Membership plan model - defines available membership tiers."""

    __tablename__ = "memberships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)  # Price per month
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    max_prompts_per_day: Mapped[int] = mapped_column(Integer, default=10)
    max_score_queries: Mapped[int] = mapped_column(Integer, default=5)
    can_use_ai_scoring: Mapped[bool] = mapped_column(Boolean, default=False)
    can_export_reports: Mapped[bool] = mapped_column(Boolean, default=False)
    priority_support: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user_memberships = relationship("UserMembership", back_populates="membership")

    def __repr__(self) -> str:
        return f"<Membership(id={self.id}, name={self.name}, price={self.price})>"


class UserMembership(Base):
    """User membership subscription model."""

    __tablename__ = "user_memberships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    membership_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("memberships.id"), nullable=False
    )
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="memberships")
    membership = relationship("Membership", back_populates="user_memberships")

    @property
    def is_expired(self) -> bool:
        """Check if membership is expired."""
        return datetime.now(timezone.utc) > self.end_date

    def __repr__(self) -> str:
        return f"<UserMembership(user_id={self.user_id}, plan={self.membership_id})>"


class PaymentRecord(Base):
    """Payment transaction record model."""

    __tablename__ = "payment_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    membership_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("memberships.id"), nullable=False
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="CNY")
    payment_method: Mapped[str] = mapped_column(String(50), nullable=True)
    transaction_id: Mapped[str] = mapped_column(String(200), unique=True, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )  # pending, completed, failed, refunded
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="payments")
    membership = relationship("Membership")

    def __repr__(self) -> str:
        return f"<PaymentRecord(id={self.id}, amount={self.amount}, status={self.status})>"
