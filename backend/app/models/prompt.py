"""Prompt and PromptScore models."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Prompt(Base):
    """Prompt training model - stores prompts created by users."""

    __tablename__ = "prompts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=True)
    difficulty: Mapped[str] = mapped_column(
        String(20), default="beginner"
    )  # beginner, intermediate, advanced
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    is_public: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    author = relationship("User", back_populates="prompts")
    scores = relationship("PromptScore", back_populates="prompt", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Prompt(id={self.id}, title={self.title})>"


class PromptScore(Base):
    """Prompt scoring model - stores scores and feedback for prompts."""

    __tablename__ = "prompt_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    prompt_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("prompts.id"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    clarity: Mapped[float] = mapped_column(Float, default=0.0)  # 清晰度 (0-10)
    specificity: Mapped[float] = mapped_column(Float, default=0.0)  # 具体性 (0-10)
    creativity: Mapped[float] = mapped_column(Float, default=0.0)  # 创造性 (0-10)
    feasibility: Mapped[float] = mapped_column(Float, default=0.0)  # 可行性 (0-10)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)  # 总分
    feedback: Mapped[str] = mapped_column(Text, nullable=True)
    ai_feedback: Mapped[str] = mapped_column(Text, nullable=True)  # AI generated feedback
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    prompt = relationship("Prompt", back_populates="scores")
    user = relationship("User", back_populates="prompt_scores")

    def __repr__(self) -> str:
        return f"<PromptScore(id={self.id}, overall={self.overall_score})>"
