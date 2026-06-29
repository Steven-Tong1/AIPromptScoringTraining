"""Membership and payment API routes."""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.membership import (
    MembershipCreate,
    MembershipResponse,
    PaymentCreate,
    PaymentResponse,
    UserMembershipResponse,
)
from app.services.auth import AuthService
from app.services.membership import MembershipService

router = APIRouter()


# --- Membership Plans ---


@router.get("/plans", response_model=List[MembershipResponse], summary="获取会员方案列表")
def list_plans(db: Session = Depends(get_db)):
    """Get all available membership plans."""
    service = MembershipService(db)
    return service.get_plans(active_only=True)


@router.get("/plans/{plan_id}", response_model=MembershipResponse, summary="获取会员方案详情")
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    """Get details of a specific membership plan."""
    service = MembershipService(db)
    return service.get_plan(plan_id)


@router.post("/plans", response_model=MembershipResponse, summary="创建会员方案（管理员）")
def create_plan(
    plan_data: MembershipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Create a new membership plan (admin only)."""
    if not current_user.is_superuser:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="仅管理员可创建会员方案")
    service = MembershipService(db)
    return service.create_plan(plan_data.model_dump())


# --- User Memberships ---


@router.get("/my", response_model=UserMembershipResponse, summary="获取我的会员信息")
def get_my_membership(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Get the current user's active membership."""
    service = MembershipService(db)
    membership = service.get_user_membership(current_user.id)
    if not membership:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="暂无有效会员")
    resp = UserMembershipResponse.model_validate(membership)
    resp.membership_name = membership.membership.name if membership.membership else None
    return resp


@router.get("/my/history", response_model=List[UserMembershipResponse], summary="获取会员历史")
def get_membership_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Get the current user's membership history."""
    service = MembershipService(db)
    memberships = service.get_user_memberships(current_user.id)
    result = []
    for m in memberships:
        resp = UserMembershipResponse.model_validate(m)
        resp.membership_name = m.membership.name if m.membership else None
        result.append(resp)
    return result


# --- Payments ---


@router.post("/payments", response_model=PaymentResponse, summary="创建支付")
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Create a payment and activate membership."""
    service = MembershipService(db)
    payment = service.create_payment(
        current_user.id, payment_data.membership_id, payment_data.amount
    )
    resp = PaymentResponse.model_validate(payment)
    resp.membership_name = payment.membership.name if payment.membership else None
    return resp


@router.get("/payments", response_model=List[PaymentResponse], summary="获取支付记录")
def get_my_payments(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Get the current user's payment history."""
    service = MembershipService(db)
    payments = service.get_user_payments(current_user.id, skip=skip, limit=limit)
    result = []
    for p in payments:
        resp = PaymentResponse.model_validate(p)
        resp.membership_name = p.membership.name if p.membership else None
        result.append(resp)
    return result
