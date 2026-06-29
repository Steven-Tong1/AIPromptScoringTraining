"""Training schemas for request/response validation."""

from typing import List, Optional
from pydantic import BaseModel, Field


class TrainingRequest(BaseModel):
    """Schema for training request."""
    prompt_content: str = Field(..., min_length=1, description="用户输入的原始 Prompt")
    model: str = Field(default="deepseek", description="目标模型")
    scenario: str = Field(default="general", description="使用场景")


class Mistake(BaseModel):
    """A single mistake identified in the user's prompt."""
    mistake: str = ""
    why_it_matters: str = ""
    how_to_fix: str = ""


class NextPractice(BaseModel):
    """A practice task for the user."""
    model_config = {"protected_namespaces": ()}
    task: str = ""
    instruction: str = ""
    model_suggestion: str = ""


class TrainingFeedback(BaseModel):
    """Training feedback with model-aware coaching."""
    user_level: str = "beginner"
    main_mistakes: List[Mistake] = []
    learning_formula: str = ""
    next_practice: NextPractice = Field(default_factory=NextPractice)
    short_feedback: str = ""


class RadarScore(BaseModel):
    """Radar chart dimension score — 8 dimensions including model-aware metrics."""
    model_config = {"protected_namespaces": ()}
    clarity: float = 0.0
    specificity: float = 0.0
    creativity: float = 0.0
    feasibility: float = 0.0
    completeness: float = 0.0
    conciseness: float = 0.0
    model_fit: float = 0.0
    token_efficiency: float = 0.0


class TokenDiagnosis(BaseModel):
    """Token redundancy diagnosis."""
    total_tokens: int = 0
    redundant_tokens: int = 0
    redundant_ratio: float = 0.0
    redundant_details: List[str] = []
    suggestions: List[str] = []


class OptimizedVersion(BaseModel):
    """An optimized version of the prompt."""
    title: str = ""
    content: str = ""
    focus: str = ""


class TrainingAdvice(BaseModel):
    """Training coach advice."""
    model_config = {"protected_namespaces": ()}
    summary: str = ""
    strengths: List[str] = []
    weaknesses: List[str] = []
    improvements: List[str] = []
    model_specific_tips: str = ""
    scenario_tips: str = ""


class TrainingTask(BaseModel):
    """A training task for the user."""
    title: str = ""
    description: str = ""
    difficulty: str = "beginner"
    hint: str = ""
    expected_improvement: str = ""


class TrainingResponse(BaseModel):
    """Complete training response."""
    radar_scores: RadarScore = Field(default_factory=RadarScore)
    token_diagnosis: TokenDiagnosis = Field(default_factory=TokenDiagnosis)
    optimized_versions: List[OptimizedVersion] = []
    training_advice: TrainingAdvice = Field(default_factory=TrainingAdvice)
    training_tasks: List[TrainingTask] = []
    training_feedback: TrainingFeedback = Field(default_factory=TrainingFeedback)
    original_prompt: str = ""
    selected_model: str = ""
    scenario: str = ""
