"""Membership service for plan management and payments."""

from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.membership import Membership, PaymentRecord, UserMembership


class MembershipService:
    """Service handling membership plans, subscriptions, and payments."""

    def __init__(self, db: Session):
        self.db = db

    # --- Membership Plans ---

    def create_plan(self, plan_data: dict) -> Membership:
        """Create a new membership plan."""
        existing = (
            self.db.query(Membership)
            .filter(Membership.name == plan_data["name"])
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="会员方案已存在")

        plan = Membership(**plan_data)
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def get_plans(self, active_only: bool = True) -> List[Membership]:
        """Get all membership plans."""
        query = self.db.query(Membership)
        if active_only:
            query = query.filter(Membership.is_active == True)
        return query.all()

    def get_plan(self, plan_id: int) -> Optional[Membership]:
        """Get a single membership plan."""
        plan = self.db.query(Membership).filter(Membership.id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="会员方案不存在")
        return plan

    def update_plan(self, plan_id: int, update_data: dict) -> Membership:
        """Update a membership plan."""
        plan = self.get_plan(plan_id)
        for key, value in update_data.items():
            if value is not None:
                setattr(plan, key, value)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    # --- User Memberships ---

    def get_user_membership(self, user_id: int) -> Optional[UserMembership]:
        """Get user's active membership."""
        return (
            self.db.query(UserMembership)
            .filter(
                UserMembership.user_id == user_id,
                UserMembership.is_active == True,
                UserMembership.end_date > datetime.now(timezone.utc),
            )
            .first()
        )

    def get_user_memberships(self, user_id: int) -> List[UserMembership]:
        """Get all memberships for a user."""
        return (
            self.db.query(UserMembership)
            .filter(UserMembership.user_id == user_id)
            .order_by(UserMembership.created_at.desc())
            .all()
        )

    # --- Payments ---

    def create_payment(
        self, user_id: int, membership_id: int, amount: float
    ) -> PaymentRecord:
        """Create a payment record simulating a payment."""
        membership = self.get_plan(membership_id)

        payment = PaymentRecord(
            user_id=user_id,
            membership_id=membership_id,
            amount=amount,
            transaction_id=str(uuid4()),
            status="completed",
            paid_at=datetime.now(timezone.utc),
        )
        self.db.add(payment)

        # Activate membership subscription
        existing = self.get_user_membership(user_id)
        if existing:
            # Extend existing membership
            existing.end_date = existing.end_date + timedelta(
                days=membership.duration_days
            )
        else:
            # Create new membership subscription
            user_membership = UserMembership(
                user_id=user_id,
                membership_id=membership_id,
                start_date=datetime.now(timezone.utc),
                end_date=datetime.now(timezone.utc)
                + timedelta(days=membership.duration_days),
                is_active=True,
            )
            self.db.add(user_membership)

        self.db.commit()
        self.db.refresh(payment)
        return payment

    def get_user_payments(
        self, user_id: int, skip: int = 0, limit: int = 20
    ) -> List[PaymentRecord]:
        """Get payment history for a user."""
        return (
            self.db.query(PaymentRecord)
            .filter(PaymentRecord.user_id == user_id)
            .order_by(PaymentRecord.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_all_payments(
        self, skip: int = 0, limit: int = 20
    ) -> List[PaymentRecord]:
        """Get all payment records (admin)."""
        return (
            self.db.query(PaymentRecord)
            .order_by(PaymentRecord.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def check_user_permission(
        self, user_id: int, feature: str
    ) -> bool:
        """Check if a user has permission for a specific feature."""
        membership = self.get_user_membership(user_id)
        if not membership:
            return False

        plan = self.get_plan(membership.membership_id)

        permissions = {
            "ai_scoring": plan.can_use_ai_scoring,
            "export_reports": plan.can_export_reports,
            "priority_support": plan.priority_support,
        }
        return permissions.get(feature, False)
