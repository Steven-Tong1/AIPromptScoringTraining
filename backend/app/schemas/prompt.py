"""Prompt schemas for request/response validation."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PromptCreate(BaseModel):
    """Schema for creating a new prompt."""

    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category: Optional[str] = Field(None, max_length=50)
    difficulty: str = Field(default="beginner", pattern="^(beginner|intermediate|advanced)$")
    is_public: bool = True


class PromptUpdate(BaseModel):
    """Schema for updating a prompt."""

    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    is_public: Optional[bool] = None


class PromptResponse(BaseModel):
    """Schema for prompt response data."""

    id: int
    title: str
    content: str
    category: Optional[str] = None
    difficulty: str
    author_id: int
    is_public: bool
    created_at: datetime
    updated_at: datetime
    author_name: Optional[str] = None
    average_score: Optional[float] = None

    class Config:
        from_attributes = True


class PromptScoreCreate(BaseModel):
    """Schema for creating a prompt score."""

    clarity: float = Field(..., ge=0, le=10)
    specificity: float = Field(..., ge=0, le=10)
    creativity: float = Field(..., ge=0, le=10)
    feasibility: float = Field(..., ge=0, le=10)
    feedback: Optional[str] = None


class PromptScoreResponse(BaseModel):
    """Schema for prompt score response."""

    id: int
    prompt_id: int
    user_id: int
    clarity: float
    specificity: float
    creativity: float
    feasibility: float
    overall_score: float
    feedback: Optional[str] = None
    ai_feedback: Optional[str] = None
    created_at: datetime
    username: Optional[str] = None

    class Config:
        from_attributes = True


class PromptWithScoresResponse(BaseModel):
    """Schema for prompt with all scores."""

    prompt: PromptResponse
    scores: List[PromptScoreResponse] = []
