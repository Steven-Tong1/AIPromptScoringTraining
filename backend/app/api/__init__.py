from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.prompts import router as prompts_router
from app.api.memberships import router as memberships_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router, prefix="/auth", tags=["认证"])
api_router.include_router(prompts_router, prefix="/prompts", tags=["提示词"])
api_router.include_router(memberships_router, prefix="/memberships", tags=["会员"])
