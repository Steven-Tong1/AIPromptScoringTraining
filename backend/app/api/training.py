"""Training API routes for prompt scoring and training."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.training import TrainingRequest, TrainingResponse
from app.services.auth import AuthService
from app.services.training import TrainingService

router = APIRouter()


@router.post("/analyze", response_model=TrainingResponse, summary="评分与训练分析")
def analyze_prompt(
    request: TrainingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user),
):
    """Analyze a prompt and return comprehensive training results.
    
    Performs:
    1. Multi-dimension scoring (radar chart)
    2. Token redundancy diagnosis
    3. Generates 3 optimized versions
    4. Provides training coach advice
    5. Creates personalized training tasks
    """
    service = TrainingService()
    return service.analyze_prompt(
        prompt_content=request.prompt_content,
        model=request.model,
        scenario=request.scenario,
    )


@router.get("/models", summary="获取支持的模型列表")
def get_models():
    """Get list of supported AI models."""
    return {
        "models": [
            {"value": "deepseek", "label": "DeepSeek", "description": "擅长逻辑推理与数学"},
            {"value": "qwen", "label": "Qwen 通义千问", "description": "多语言支持优秀"},
            {"value": "kimi", "label": "Kimi", "description": "擅长长文本理解"},
            {"value": "doubao", "label": "豆包", "description": "中文创意写作出色"},
            {"value": "gpt", "label": "GPT", "description": "综合能力强"},
            {"value": "claude", "label": "Claude", "description": "注重安全性与深度分析"},
        ]
    }


@router.get("/scenarios", summary="获取支持的使用场景")
def get_scenarios():
    """Get list of supported scenarios."""
    return {
        "scenarios": [
            {"value": "code", "label": "代码开发", "description": "代码生成、调试、API设计"},
            {"value": "copywriting", "label": "文案创作", "description": "广告文案、营销内容、品牌故事"},
            {"value": "data", "label": "数据分析", "description": "数据处理、统计、可视化"},
            {"value": "creative", "label": "创意设计", "description": "创意构思、头脑风暴、艺术创作"},
            {"value": "education", "label": "教育学习", "description": "课程设计、知识讲解、练习生成"},
            {"value": "business", "label": "商务办公", "description": "商务邮件、报告、方案"},
            {"value": "general", "label": "通用场景", "description": "不限定特定场景"},
        ]
    }
