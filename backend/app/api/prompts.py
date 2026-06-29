"""Prompt management API routes."""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.prompt import (
    PromptCreate,
    PromptResponse,
    PromptScoreCreate,
    PromptScoreResponse,
    PromptUpdate,
)
from app.services.auth import AuthService
from app.services.prompt import PromptService

router = APIRouter()


def get_prompt_service(db: Session = Depends(get_db)) -> PromptService:
    """Dependency: get PromptService instance."""
    return PromptService(db)


@router.post("", response_model=PromptResponse, summary="创建提示词")
def create_prompt(
    prompt_data: PromptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Create a new prompt for training."""
    service = PromptService(db)
    prompt = service.create_prompt(prompt_data, current_user.id)
    prompt.author_name = current_user.display_name or current_user.username
    prompt.average_score = service.get_prompt_average_score(prompt.id)
    return prompt


@router.get("", response_model=List[PromptResponse], summary="获取提示词列表")
def list_prompts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    author_id: Optional[int] = None,
    public_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Get a paginated list of prompts with optional filters."""
    service = PromptService(db)
    prompts = service.get_prompts(
        skip=skip,
        limit=limit,
        category=category,
        difficulty=difficulty,
        author_id=author_id,
        is_public=public_only,
    )

    result = []
    for p in prompts:
        pr = PromptResponse.model_validate(p)
        pr.author_name = p.author.display_name or p.author.username if p.author else None
        pr.average_score = service.get_prompt_average_score(p.id)
        result.append(pr)
    return result


@router.get("/search", response_model=List[PromptResponse], summary="搜索提示词")
def search_prompts(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search prompts by title or content."""
    service = PromptService(db)
    prompts = service.search_prompts(q, skip=skip, limit=limit)

    result = []
    for p in prompts:
        pr = PromptResponse.model_validate(p)
        pr.author_name = p.author.display_name or p.author.username if p.author else None
        pr.average_score = service.get_prompt_average_score(p.id)
        result.append(pr)
    return result


@router.get("/categories", summary="获取所有分类")
def get_categories(db: Session = Depends(get_db)):
    """Get all unique prompt categories."""
    service = PromptService(db)
    return {"categories": service.get_categories()}


@router.get("/{prompt_id}", response_model=PromptResponse, summary="获取提示词详情")
def get_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
):
    """Get detailed information about a specific prompt."""
    service = PromptService(db)
    prompt = service.get_prompt(prompt_id)
    if not prompt:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="提示词不存在")

    pr = PromptResponse.model_validate(prompt)
    pr.author_name = prompt.author.display_name or prompt.author.username if prompt.author else None
    pr.average_score = service.get_prompt_average_score(prompt.id)
    return pr


@router.put("/{prompt_id}", response_model=PromptResponse, summary="更新提示词")
def update_prompt(
    prompt_id: int,
    update_data: PromptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Update an existing prompt."""
    service = PromptService(db)
    prompt = service.update_prompt(
        prompt_id, update_data.model_dump(exclude_none=True), current_user.id
    )
    pr = PromptResponse.model_validate(prompt)
    pr.author_name = prompt.author.display_name or prompt.author.username if prompt.author else None
    pr.average_score = service.get_prompt_average_score(prompt.id)
    return pr


@router.delete("/{prompt_id}", summary="删除提示词")
def delete_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Delete a prompt."""
    service = PromptService(db)
    service.delete_prompt(prompt_id, current_user.id)
    return {"message": "提示词已删除"}


@router.post("/{prompt_id}/scores", response_model=PromptScoreResponse, summary="评分提示词")
def score_prompt(
    prompt_id: int,
    score_data: PromptScoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Score a prompt with rating dimensions."""
    service = PromptService(db)
    score = service.score_prompt(prompt_id, score_data, current_user.id)
    sr = PromptScoreResponse.model_validate(score)
    sr.username = current_user.display_name or current_user.username
    return sr


@router.get("/{prompt_id}/scores", response_model=List[PromptScoreResponse], summary="获取评分列表")
def get_prompt_scores(
    prompt_id: int,
    db: Session = Depends(get_db),
):
    """Get all scores for a specific prompt."""
    service = PromptService(db)
    scores = service.get_prompt_scores(prompt_id)

    result = []
    for s in scores:
        sr = PromptScoreResponse.model_validate(s)
        sr.username = s.user.display_name or s.user.username if s.user else None
        result.append(sr)
    return result
