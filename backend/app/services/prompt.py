"""Prompt service for prompt management and scoring."""

import json
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.prompt import Prompt, PromptScore
from app.schemas.prompt import PromptCreate, PromptScoreCreate


class PromptService:
    """Service handling prompt CRUD and scoring operations."""

    def __init__(self, db: Session):
        self.db = db

    def create_prompt(
        self, prompt_data: PromptCreate, author_id: int
    ) -> Prompt:
        """Create a new prompt."""
        prompt = Prompt(
            title=prompt_data.title,
            content=prompt_data.content,
            category=prompt_data.category,
            difficulty=prompt_data.difficulty,
            author_id=author_id,
            is_public=prompt_data.is_public,
        )
        self.db.add(prompt)
        self.db.commit()
        self.db.refresh(prompt)
        return prompt

    def get_prompt(self, prompt_id: int) -> Optional[Prompt]:
        """Get a single prompt by ID."""
        return self.db.query(Prompt).filter(Prompt.id == prompt_id).first()

    def get_prompts(
        self,
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        difficulty: Optional[str] = None,
        author_id: Optional[int] = None,
        is_public: Optional[bool] = None,
    ) -> List[Prompt]:
        """Get list of prompts with optional filters."""
        query = self.db.query(Prompt)

        if category:
            query = query.filter(Prompt.category == category)
        if difficulty:
            query = query.filter(Prompt.difficulty == difficulty)
        if author_id:
            query = query.filter(Prompt.author_id == author_id)
        if is_public is not None:
            query = query.filter(Prompt.is_public == is_public)

        return (
            query.order_by(Prompt.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_prompt(
        self, prompt_id: int, update_data: dict, user_id: int
    ) -> Prompt:
        """Update a prompt."""
        prompt = self.get_prompt(prompt_id)
        if not prompt:
            raise HTTPException(status_code=404, detail="提示词不存在")
        if prompt.author_id != user_id:
            raise HTTPException(status_code=403, detail="无权修改此提示词")

        for key, value in update_data.items():
            if value is not None:
                setattr(prompt, key, value)

        self.db.commit()
        self.db.refresh(prompt)
        return prompt

    def delete_prompt(self, prompt_id: int, user_id: int) -> None:
        """Delete a prompt."""
        prompt = self.get_prompt(prompt_id)
        if not prompt:
            raise HTTPException(status_code=404, detail="提示词不存在")
        if prompt.author_id != user_id:
            raise HTTPException(status_code=403, detail="无权删除此提示词")

        self.db.delete(prompt)
        self.db.commit()

    def score_prompt(
        self, prompt_id: int, score_data: PromptScoreCreate, user_id: int
    ) -> PromptScore:
        """Score a prompt and calculate overall score."""
        prompt = self.get_prompt(prompt_id)
        if not prompt:
            raise HTTPException(status_code=404, detail="提示词不存在")

        # Check if user already scored this prompt
        existing_score = (
            self.db.query(PromptScore)
            .filter(
                PromptScore.prompt_id == prompt_id,
                PromptScore.user_id == user_id,
            )
            .first()
        )
        if existing_score:
            raise HTTPException(
                status_code=400, detail="您已经评分过此提示词"
            )

        # Calculate overall score (weighted average)
        overall = (
            score_data.clarity * 0.25
            + score_data.specificity * 0.25
            + score_data.creativity * 0.25
            + score_data.feasibility * 0.25
        )

        score = PromptScore(
            prompt_id=prompt_id,
            user_id=user_id,
            clarity=score_data.clarity,
            specificity=score_data.specificity,
            creativity=score_data.creativity,
            feasibility=score_data.feasibility,
            overall_score=round(overall, 2),
            feedback=score_data.feedback,
        )
        self.db.add(score)
        self.db.commit()
        self.db.refresh(score)
        return score

    def get_prompt_scores(self, prompt_id: int) -> List[PromptScore]:
        """Get all scores for a prompt."""
        return (
            self.db.query(PromptScore)
            .filter(PromptScore.prompt_id == prompt_id)
            .order_by(PromptScore.created_at.desc())
            .all()
        )

    def get_prompt_average_score(self, prompt_id: int) -> float:
        """Get average overall score for a prompt."""
        result = (
            self.db.query(func.avg(PromptScore.overall_score))
            .filter(PromptScore.prompt_id == prompt_id)
            .scalar()
        )
        return round(result, 2) if result else 0.0

    def get_categories(self) -> List[str]:
        """Get all unique prompt categories."""
        results = (
            self.db.query(Prompt.category)
            .filter(Prompt.category.isnot(None))
            .distinct()
            .all()
        )
        return [r[0] for r in results if r[0]]

    def search_prompts(
        self, query: str, skip: int = 0, limit: int = 20
    ) -> List[Prompt]:
        """Search prompts by title or content."""
        search_term = f"%{query}%"
        return (
            self.db.query(Prompt)
            .filter(
                Prompt.is_public == True,
                (
                    Prompt.title.ilike(search_term)
                    | Prompt.content.ilike(search_term)
                ),
            )
            .order_by(Prompt.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
