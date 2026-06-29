"""Training service for AI-powered prompt scoring & training."""

import math
import random
from typing import List, Tuple

from app.schemas.training import (
    Mistake,
    NextPractice,
    OptimizedVersion,
    RadarScore,
    TokenDiagnosis,
    TrainingAdvice,
    TrainingFeedback,
    TrainingResponse,
    TrainingTask,
)

# Model display names
MODEL_NAMES = {
    "deepseek": "DeepSeek",
    "qwen": "Qwen",
    "kimi": "Kimi",
    "doubao": "豆包",
    "gpt": "GPT",
    "claude": "Claude",
}

# Scenario guidance prompts
SCENARIO_GUIDANCE = {
    "code": {
        "name": "代码开发",
        "keywords": ["函数", "API", "代码", "编程语言", "算法", "debug", "测试"],
        "focus": "技术精确性、上下文完整、输出格式明确",
    },
    "copywriting": {
        "name": "文案创作",
        "keywords": ["文案", "广告", "营销", "标题", "品牌", "故事"],
        "focus": "语言感染力、目标受众明确、风格一致",
    },
    "data": {
        "name": "数据分析",
        "keywords": ["数据", "分析", "统计", "图表", "报表", "趋势", "指标"],
        "focus": "数据范围明确、分析方法具体、输出结构清晰",
    },
    "creative": {
        "name": "创意设计",
        "keywords": ["创意", "设计", " brainstorming", "灵感", "创新", "艺术"],
        "focus": "开放性适度、约束条件明确、创意方向清晰",
    },
    "education": {
        "name": "教育学习",
        "keywords": ["学习", "教学", "课程", "知识", "讲解", "练习"],
        "focus": "知识层级分明、受众水平匹配、互动性设计",
    },
    "business": {
        "name": "商务办公",
        "keywords": ["商务", "报告", "邮件", "会议", "方案", "计划"],
        "focus": "专业得体、信息结构清晰、行动导向",
    },
    "general": {
        "name": "通用场景",
        "keywords": [],
        "focus": "通用优化建议",
    },
}


class TrainingService:
    """Service for AI-powered prompt scoring and training."""

    def __init__(self):
        pass

    def analyze_prompt(self, prompt_content: str, model: str, scenario: str) -> TrainingResponse:
        """Analyze a prompt and return comprehensive training results."""
        prompt_content = prompt_content.strip()
        scenario_info = SCENARIO_GUIDANCE.get(scenario, SCENARIO_GUIDANCE["general"])
        model_name = MODEL_NAMES.get(model, model)

        # Compute scores
        radar_scores = self._compute_radar_scores(prompt_content, model, scenario)

        # Token analysis
        token_diagnosis = self._analyze_tokens(prompt_content)

        # Generate optimized versions
        optimized_versions = self._generate_optimizations(prompt_content, model, scenario)

        # Training advice
        training_advice = self._generate_training_advice(
            prompt_content, radar_scores, token_diagnosis, model, scenario
        )

        # Training tasks
        training_tasks = self._generate_training_tasks(
            prompt_content, radar_scores, scenario
        )

        # Training feedback (model-aware coaching)
        training_feedback = self._generate_training_feedback(
            prompt_content, radar_scores, token_diagnosis, model, scenario
        )

        return TrainingResponse(
            radar_scores=radar_scores,
            token_diagnosis=token_diagnosis,
            optimized_versions=optimized_versions,
            training_advice=training_advice,
            training_tasks=training_tasks,
            training_feedback=training_feedback,
            original_prompt=prompt_content,
            selected_model=model_name,
            scenario=scenario_info["name"],
        )

    def _compute_radar_scores(self, text: str, model: str, scenario: str) -> RadarScore:
        """Compute radar chart scores based on prompt analysis.

        Now evaluates 8 dimensions — the original 6 plus 2 model-aware metrics:
        - model_fit:  Prompt's structural suitability for the selected target model
        - token_efficiency:  How efficiently the prompt uses tokens for the target model
        """
        word_count = len(text)
        sentences = [s.strip() for s in text.replace("！", "。").replace("？", "。").split("。") if s.strip()]
        sentence_count = len(sentences)

        # Clarity: checks sentence structure, concrete terms
        has_concrete = any(kw in text.lower() for kw in ["具体", "明确", "列出", "生成", "创建", "写出"])
        avg_sentence_len = word_count / max(sentence_count, 1)
        clarity = min(10, 4 + (3 if has_concrete else 0) + min(3, avg_sentence_len / 20))

        # Specificity: checks for specific numbers, examples, constraints
        has_numbers = any(c.isdigit() for c in text)
        has_examples = any(kw in text.lower() for kw in ["例如", "比如", "示例", "如下"])
        has_constraints = any(kw in text.lower() for kw in ["限制", "不超过", "至少", "范围", "格式"])
        specificity = min(10, 3 + (2 if has_numbers else 0) + (2 if has_examples else 0) + (3 if has_constraints else 0))

        # Creativity: vocabulary diversity and structure
        unique_ratio = len(set(text.lower().split())) / max(len(text.split()), 1)
        has_creative = any(kw in text.lower() for kw in ["创意", "创新", "独特", "新颖", "风格", "想象"])
        creativity = min(10, 3 + min(4, unique_ratio * 8) + (2 if has_creative else 0))

        # Feasibility: actionable and clear output spec
        has_output_spec = any(kw in text.lower() for kw in ["输出", "返回", "结果", "给我", "回答"])
        has_role = any(kw in text.lower() for kw in ["你作为", "你是一个", "扮演", "角色", "你是"])
        feasibility = min(10, 3 + (3 if has_output_spec else 0) + (2 if has_role else 0) + (2 if has_constraints else 0))

        # Completeness: covers all essential parts
        completeness = min(10, 2 + (2 if has_role else 0) + (2 if has_output_spec else 0)
                           + (2 if has_constraints else 0) + (2 if has_examples else 0))

        # Conciseness: no unnecessary fluff
        fluff_words = ["请", "你好", "谢谢", "请帮忙", "能不能", "我想让你"]
        fluff_count = sum(text.count(w) for w in fluff_words)
        conciseness = min(10, 8 - fluff_count + (2 if word_count < 200 else 0) + (2 if word_count < 100 else 0)
                          - (2 if word_count > 500 else 0))
        conciseness = max(1, min(10, conciseness))

        # Scenario-based adjustments
        scenario_info = SCENARIO_GUIDANCE.get(scenario, SCENARIO_GUIDANCE["general"])
        if scenario != "general":
            scenario_keyword_hits = sum(1 for kw in scenario_info["keywords"] if kw.strip().lower() in text.lower())
            scenario_relevance = min(3, scenario_keyword_hits / max(len(scenario_info["keywords"]), 1) * 5)
            specificity = min(10, specificity + scenario_relevance)

        # ============ NEW: Model-Fit Score ============
        # Evaluates how well the prompt is structured for the *specific* target model
        model_fit = self._compute_model_fit(text, model)

        # ============ NEW: Token Efficiency Score ============
        # Evaluates how efficiently the prompt uses tokens for the target model
        token_efficiency = self._compute_token_efficiency(text, model, fluff_count)

        return RadarScore(
            clarity=round(clarity, 1),
            specificity=round(specificity, 1),
            creativity=round(creativity, 1),
            feasibility=round(feasibility, 1),
            completeness=round(completeness, 1),
            conciseness=round(conciseness, 1),
            model_fit=round(model_fit, 1),
            token_efficiency=round(token_efficiency, 1),
        )

    def _compute_model_fit(self, text: str, model: str) -> float:
        """Score how well the prompt fits the target model's strengths (0-10)."""
        text_lower = text.lower()
        has_role = any(kw in text_lower for kw in ["你作为", "你是一个", "扮演", "角色", "你是"])
        has_output_spec = any(kw in text_lower for kw in ["输出", "返回", "结果", "给我", "回答"])
        has_structured = any(kw in text_lower for kw in ["格式", "结构", "列表", "表格", "json", "分点"])
        has_examples = any(kw in text_lower for kw in ["例如", "比如", "示例", "如下"])
        has_reasoning = any(kw in text_lower for kw in ["推理", "分析", "步骤", "逐步", "原因", "解释"])
        has_creative_guide = any(kw in text_lower for kw in ["风格", "语气", "调性", "创意", "想象"])
        has_length_req = any(kw in text_lower for kw in ["不超过", "至少", "字数", "控制在", "以内"])

        # Model-specific fit logic
        model_fit_map = {
            "deepseek": {
                # DeepSeek excels with structured output, clear reasoning chains, concise instructions
                "base": 5.0,
                "boost": (2.0 if has_structured else 0) + (1.5 if has_reasoning else 0)
                         + (1.0 if has_output_spec else 0) - (1.0 if has_role and not has_structured else 0),
                "why": "DeepSeek对结构化输出和推理链最友好",
            },
            "qwen": {
                "base": 5.0,
                "boost": (1.5 if has_output_spec else 0) + (1.0 if has_examples else 0)
                         + (1.5 if has_length_req else 0) - (0.5 if has_role and not has_output_spec else 0),
                "why": "Qwen在多语言和结构化场景表现优秀",
            },
            "kimi": {
                "base": 5.0,
                "boost": (2.0 if has_reasoning and len(text) > 100 else 0) + (1.0 if has_role else 0)
                         + (1.0 if has_examples else 0) + (0.5 if len(text) > 200 else 0),
                "why": "Kimi擅长长文本理解和深度分析，长上下文场景加分",
            },
            "doubao": {
                "base": 5.0,
                "boost": (2.0 if has_creative_guide else 0) + (1.5 if has_role else 0)
                         + (1.0 if has_output_spec else 0) - (1.0 if has_structured and not has_creative_guide else 0),
                "why": "豆包在中文创意写作方面表现突出，需风格引导",
            },
            "gpt": {
                "base": 5.0,
                "boost": (1.5 if has_role else 0) + (1.5 if has_output_spec else 0)
                         + (1.0 if has_structured else 0) + (1.0 if has_examples else 0),
                "why": "GPT综合性强，角色+输出+结构+示例全面受益",
            },
            "claude": {
                "base": 5.0,
                "boost": (1.5 if has_reasoning else 0) + (1.0 if has_output_spec else 0)
                         + (1.0 if has_examples else 0) + (0.5 if has_role else 0),
                "why": "Claude注重安全性和细致分析，清晰的分析框架会加分",
            },
        }

        info = model_fit_map.get(model, {"base": 5.0, "boost": 0.0, "why": ""})
        score = info["base"] + info["boost"]
        return max(1.0, min(10.0, score))

    def _compute_token_efficiency(self, text: str, model: str, fluff_count: int) -> float:
        """Score how efficiently the prompt uses tokens for the target model (0-10)."""
        word_count = len(text)
        chinese_chars = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
        english_chars = len(text) - chinese_chars
        total_tokens = int(chinese_chars / 1.3 + english_chars / 4)

        # Base: longer prompts get penalized, very short ones get bonus
        if word_count < 50:
            base = 8.0
        elif word_count < 150:
            base = 7.0
        elif word_count < 300:
            base = 5.5
        elif word_count < 500:
            base = 4.0
        else:
            base = 2.5

        # Fluff penalty
        fluff_penalty = fluff_count * 1.0

        # Repetition penalty (same character appearing too often)
        if chinese_chars > 0:
            max_char_freq = max(text.count(c) for c in set(text) if '\u4e00' <= c <= '\u9fff')
            freq_ratio = max_char_freq / max(chinese_chars, 1)
            repetition_penalty = 1.5 if freq_ratio > 0.15 else 0
        else:
            repetition_penalty = 0

        # Model-specific token efficiency adjustments
        model_efficiency_map = {
            "deepseek": {
                "context_bonus": 0.5,  # DeepSeek has efficient long-input processing
                "note": "DeepSeek长输入成本相对较低，冗余敏感度中等",
            },
            "qwen": {
                "context_bonus": 0.0,
                "note": "Qwen对冗余较为敏感，简洁表达效果更好",
            },
            "kimi": {
                "context_bonus": 1.5,  # Kimi excels at long context
                "note": "Kimi擅长长文本，适当增加背景信息不影响效率评分",
            },
            "doubao": {
                "context_bonus": 0.5,
                "note": "豆包对创意性冗余容忍度较高",
            },
            "gpt": {
                "context_bonus": 0.0,
                "note": "GPT对Token消耗敏感，建议精确控制长度",
            },
            "claude": {
                "context_bonus": 0.5,
                "note": "Claude长上下文表现良好，但冗余仍需避免",
            },
        }

        eff_info = model_efficiency_map.get(model, {"context_bonus": 0.0, "note": ""})

        # Negative instruction penalty (using "不要/别" wastes tokens)
        has_negative = any(nw in text for nw in ["不要", "别", "禁止"])
        negative_penalty = 1.0 if has_negative else 0

        score = base - fluff_penalty - repetition_penalty - negative_penalty + eff_info["context_bonus"]

        return max(1.0, min(10.0, score))

    def _analyze_tokens(self, text: str) -> TokenDiagnosis:
        """Analyze token usage and redundancy."""
        # Estimate token count (rough: 1 token ≈ 1.3 Chinese chars or 4 English chars)
        chinese_chars = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
        english_chars = len(text) - chinese_chars
        total_tokens = int(chinese_chars / 1.3 + english_chars / 4)

        redundant_details = []
        suggestions = []

        # Detect polite but unnecessary phrases
        polite_phrases = ["请", "你好", "谢谢", "能不能请你"]
        for phrase in polite_phrases:
            if phrase in text:
                redundant_details.append(f'礼貌用语 "{phrase}" 可以省略，直接给出指令即可')

        # Detect repeated information
        sentences = [s.strip() for s in text.replace("！", "。").replace("？", "。").split("。") if len(s.strip()) > 5]
        for i, s1 in enumerate(sentences):
            for j, s2 in enumerate(sentences):
                if i < j and len(s1) > 10 and len(s2) > 10:
                    # Simple overlap detection
                    common = len(set(s1) & set(s2)) / max(len(set(s1) | set(s2)), 1)
                    if common > 0.7:
                        redundant_details.append(f'第{i+1}句和第{j+1}句内容重复，建议合并')

        # Detect overly long sentences
        long_sentences = [s for s in sentences if len(s) > 100]
        if long_sentences:
            redundant_details.append(f'发现 {len(long_sentences)} 个过长句子（超过100字），建议拆分为短句')

        # Detection of vague modifiers
        vague_words = ["一些", "很多", "某种", "各种", "一些方面", "一定程度上"]
        for w in vague_words:
            if w in text:
                redundant_details.append(f'模糊修饰语 "{w}" 建议替换为具体描述')
                break

        # Detection of negative instructions
        if any(nw in text for nw in ["不要", "别", "禁止"]):
            redundant_details.append('负面指令（"不要/别"）通常占用Token且效果不佳，建议用正向指令替代')

        # Generate suggestions
        if redundant_details:
            suggestions.append("移除所有礼貌用语和客套话，直接进入主题")
            suggestions.append("合并重复表达，每句话传递一个独特信息")
            suggestions.append("将长句拆分为15-20字的短句，提升解析效率")
            suggestions.append("用具体数据替代模糊修饰语")
            suggestions.append("将负面指令改写为正向要求")
        else:
            suggestions.append("整体表达简洁，继续保持")
            suggestions.append("可考虑增加具体约束条件以提升精确度")

        redundant_tokens = int(total_tokens * min(0.4, len(redundant_details) * 0.08))
        redundant_ratio = round(redundant_tokens / max(total_tokens, 1), 2)

        return TokenDiagnosis(
            total_tokens=total_tokens,
            redundant_tokens=redundant_tokens,
            redundant_ratio=redundant_ratio,
            redundant_details=list(set(redundant_details)),
            suggestions=suggestions,
        )

    def _generate_optimizations(
        self, text: str, model: str, scenario: str
    ) -> List[OptimizedVersion]:
        """Generate three optimized versions of the prompt."""
        model_name = MODEL_NAMES.get(model, model)
        scenario_info = SCENARIO_GUIDANCE.get(scenario, SCENARIO_GUIDANCE["general"])

        # Version 1: Concise version - remove fluff, tighten language
        v1_content = text
        for phrase in ["你好", "请帮忙", "能不能请你", "我想让你"]:
            v1_content = v1_content.replace(phrase, "")
        v1_content = v1_content.replace("请", "").strip()
        if v1_content and not v1_content.startswith("你"):
            v1_content = v1_content

        optimized_1 = OptimizedVersion(
            title="精简版（去除冗余）",
            content=v1_content if v1_content != text else text + "\n\n【优化建议：此版本已较简洁，可进一步拆分指令】",
            focus="删除客套话和冗余词，保留核心指令",
        )

        # Version 2: Role + Constraints version
        has_role = any(kw in text.lower() for kw in ["你作为", "你是一个", "扮演"])
        if not has_role:
            role_prefix = "你是一位专业的AI助手"
            if scenario == "code":
                role_prefix = "你是一位资深软件工程师"
            elif scenario == "copywriting":
                role_prefix = "你是一位资深文案策划专家"
            elif scenario == "data":
                role_prefix = "你是一位数据分析专家"
            elif scenario == "creative":
                role_prefix = "你是一位创意总监"
            elif scenario == "education":
                role_prefix = "你是一位资深教育专家"
            elif scenario == "business":
                role_prefix = "你是一位商务顾问"
            v2_content = f"{role_prefix}。请按照以下要求完成任务：\n\n{text}\n\n要求：\n1. 输出结构清晰，分点呈现\n2. 确保内容专业准确\n3. 如有多种方案，请对比说明"
        else:
            v2_content = f"{text}\n\n要求：\n1. 输出结构清晰，分点呈现\n2. 确保内容专业准确"

        optimized_2 = OptimizedVersion(
            title="结构版（角色+约束）",
            content=v2_content,
            focus="添加角色设定和输出约束，提升结果质量",
        )

        # Version 3: Few-shot / Example-driven version
        v3_content = f"""{text}

请按照以下格式输出：
【分析】：首先简要分析任务需求
【方案】：提供详细解决方案
【注意事项】：列出关键点和潜在问题

参考示例：
输入："帮我写一封商务邮件"
输出：
【分析】：需要一封正式的商务邮件，目的是...
【方案】：邮件正文如下...
【注意事项】：注意语气专业、信息完整"""

        optimized_3 = OptimizedVersion(
            title="示例版（Few-shot引导）",
            content=v3_content,
            focus="通过示例和格式定义引导模型输出符合预期的结果",
        )

        return [optimized_1, optimized_2, optimized_3]

    def _generate_training_advice(
        self,
        text: str,
        scores: RadarScore,
        diagnosis: TokenDiagnosis,
        model: str,
        scenario: str,
    ) -> TrainingAdvice:
        """Generate personalized training coach advice."""
        model_name = MODEL_NAMES.get(model, model)
        scenario_info = SCENARIO_GUIDANCE.get(scenario, SCENARIO_GUIDANCE["general"])

        strengths = []
        weaknesses = []
        improvements = []

        # Analyze strengths based on scores
        score_map = {
            "清晰度": scores.clarity,
            "具体性": scores.specificity,
            "创造性": scores.creativity,
            "可行性": scores.feasibility,
            "完整性": scores.completeness,
            "简洁性": scores.conciseness,
            "模型适配度": scores.model_fit,
            "Token效率": scores.token_efficiency,
        }

        for name, val in score_map.items():
            if val >= 7:
                strengths.append(f"✅ {name}表现优秀（{val}分）：这是您的核心优势")
            elif val <= 4:
                weaknesses.append(f"⚠️ {name}有待提升（{val}分）：需要重点关注")

        # Scenario-specific advice
        if scenario_info["focus"]:
            improvements.append(f"🔍 针对{scenario_info['name']}场景：{scenario_info['focus']}")

        # Generate summary (now 8 dimensions)
        overall = (scores.clarity + scores.specificity + scores.creativity
                   + scores.feasibility + scores.completeness + scores.conciseness
                   + scores.model_fit + scores.token_efficiency) / 8

        if overall >= 7:
            summary = f"🎉 整体表现良好（{overall:.1f}/10）！您的提示词在多数维度上表现不错。针对{model_name}模型，" \
                      f"建议在{scenario_info['name']}场景下进一步优化细节，追求满分表现。"
        elif overall >= 5:
            summary = f"📈 中等偏上（{overall:.1f}/10），有提升空间！您的提示词基础框架不错，但" \
                      f"在低分维度上可以针对性改进。{model_name}模型在{scenario_info['name']}场景下，" \
                      f"特别注重指令的明确性和结构化。"
        else:
            summary = f"🌱 起步阶段（{overall:.1f}/10），有很大提升潜力！建议从基础结构开始，" \
                      f"参考优化版本逐步改进。{model_name}模型擅长遵循结构化指令，" \
                      f"建议在{scenario_info['name']}场景中多使用具体约束。"

        # Model-specific tips
        model_tips = {
            "deepseek": "DeepSeek 擅长数学和逻辑推理，建议使用逐步推理的提示方式",
            "qwen": "Qwen 对多语言支持优秀，适合需要中英混合的场景",
            "kimi": "Kimi 擅长长文本理解，可以处理更复杂的上下文",
            "doubao": "豆包在中文创意写作方面表现出色，适合文案和故事创作",
            "gpt": "GPT 系列综合能力强，建议使用明确的角色设定和输出格式",
            "claude": "Claude 注重安全性和细致分析，适合需要深度思考的任务",
        }
        model_specific_tips = model_tips.get(model, f"{model_name}：建议查阅官方文档获取最佳实践")

        # Scenario tips
        scenario_tips = f"【{scenario_info['name']}场景建议】{scenario_info['focus']}。建议在提示词中包含场景关键词，引导模型理解上下文。"

        # Generate improvement suggestions
        if diagnosis.redundant_ratio > 0.15:
            improvements.append(f"✂️ 冗余Token占比{diagnosis.redundant_ratio*100:.0f}%，建议精简表达")
        if scores.specificity < 6:
            improvements.append("📋 增加具体数字、示例和约束条件，提升具体性分数")
        if scores.completeness < 6:
            improvements.append("🏗️ 补充角色设定、输出格式和约束条件，构建完整的指令框架")
        if scores.conciseness < 5:
            improvements.append("🎯 删除多余修饰词，每句话聚焦一个核心指令")
        if scores.model_fit < 6:
            improvements.append(f"🎯 模型适配度偏低（{scores.model_fit}分），建议根据{model_name}的特点调整Prompt结构")
        if scores.token_efficiency < 6:
            improvements.append(f"💰 Token效率偏低（{scores.token_efficiency}分），长Prompt需精简以适配{model_name}的上下文窗口")

        return TrainingAdvice(
            summary=summary,
            strengths=strengths if strengths else ["暂无显著优势项，继续努力！"],
            weaknesses=weaknesses if weaknesses else ["暂无显著短板，保持均衡发展"],
            improvements=improvements if improvements else ["尝试在不同场景下测试您的提示词"],
            model_specific_tips=model_specific_tips,
            scenario_tips=scenario_tips,
        )

    def _generate_training_tasks(
        self, text: str, scores: RadarScore, scenario: str
    ) -> List[TrainingTask]:
        """Generate personalized training tasks."""
        scenario_info = SCENARIO_GUIDANCE.get(scenario, SCENARIO_GUIDANCE["general"])
        tasks = []

        # Find the weakest dimension
        score_map = {
            "清晰度": (scores.clarity, "具体化表达"),
            "具体性": (scores.specificity, "增加细节和数据"),
            "创造性": (scores.creativity, "拓展创意边界"),
            "可行性": (scores.feasibility, "明确输出要求"),
            "完整性": (scores.completeness, "构建完整框架"),
            "简洁性": (scores.conciseness, "精简表达"),
            "模型适配度": (scores.model_fit, "适配目标模型特性"),
            "Token效率": (scores.token_efficiency, "优化Token使用效率"),
        }
        sorted_scores = sorted(score_map.items(), key=lambda x: x[1][0])
        weakest = sorted_scores[0]
        second_weakest = sorted_scores[1]

        # Task 1: Improve weakest dimension
        tasks.append(TrainingTask(
            title=f"专项提升：{weakest[0]}训练",
            description=f"基于当前提示词，请重写一段{weakest[0]}更高的版本。"
                       f"当前{weakest[0]}评分仅为{weakest[1][0]}分。"
                       f"练习重点：{weakest[1][1]}",
            difficulty="beginner" if weakest[1][0] < 4 else "intermediate",
            hint=f"尝试使用以下方法：{weakest[1][1]}，并参考优化版本中的建议",
            expected_improvement=f"目标：将{weakest[0]}提升2分以上",
        ))

        # Task 2: Scenario adaptation
        tasks.append(TrainingTask(
            title=f"场景适配：{scenario_info['name']}优化",
            description=f"将当前提示词改写为专门适配{scenario_info['name']}场景的版本，"
                       f"加入场景相关的关键词和约束条件",
            difficulty="intermediate",
            hint=f"{scenario_info['name']}场景关注点：{scenario_info['focus']}",
            expected_improvement="目标：学会为不同场景定制提示词",
        ))

        # Task 3: Comprehensive rewrite
        tasks.append(TrainingTask(
            title="综合挑战：从0到1重构",
            description=f"忘记当前提示词，请从零开始编写一个面向"
                       f"{scenario_info['name']}场景的完整提示词。"
                       f"要求包含：角色设定、具体任务、输出格式、约束条件",
            difficulty="advanced",
            hint="参考「结构版（角色+约束）」的框架，先列大纲再填充内容",
            expected_improvement="目标：掌握结构化提示词编写的完整方法论",
        ))

        return tasks

    def _generate_training_feedback(
        self,
        text: str,
        scores: RadarScore,
        diagnosis: TokenDiagnosis,
        model: str,
        scenario: str,
    ) -> TrainingFeedback:
        """Generate model-aware training feedback with mistake analysis and learning formula.

        This is the core training coach prompt — it combines the TARGET_MODEL characteristics
        with the user's raw prompt and scoring results to deliver personalized coaching.
        """
        model_name = MODEL_NAMES.get(model, model)
        scenario_info = SCENARIO_GUIDANCE.get(scenario, SCENARIO_GUIDANCE["general"])

        overall = (scores.clarity + scores.specificity + scores.creativity
                   + scores.feasibility + scores.completeness + scores.conciseness
                   + scores.model_fit + scores.token_efficiency) / 8

        # Determine user level
        if overall >= 7.5:
            user_level = "advanced"
        elif overall >= 5:
            user_level = "intermediate"
        else:
            user_level = "beginner"

        # --- Model-specific knowledge base ---
        model_knowledge = {
            "deepseek": {
                "strength": "逻辑推理与数学计算",
                "style": "清晰推理链",
                "advice": "DeepSeek 擅长逐步推理，应避免模糊角色设定和过度修饰。直接给出任务目标+约束+输出格式最为有效。",
                "formula": "[任务目标] + [约束条件] + [输出格式要求]",
                "waste": "过度角色设定不仅浪费Token，还可能导致指令冲突，因为DeepSeek的推理能力在简洁指令下表现最佳",
            },
            "qwen": {
                "strength": "多语言理解与跨文化沟通",
                "style": "多语言混合理解",
                "advice": "Qwen 对多语言混合场景支持优秀。中英夹杂时无需刻意统一语言，但需明确指定输出语言。",
                "formula": "[目标] + [语言要求] + [文化背景] + [输出结构]",
                "waste": "多次重复同一指令的不同语言版本会浪费Token，Qwen能自动理解一种语言表达的完整意图",
            },
            "kimi": {
                "strength": "长文本理解与深度分析",
                "style": "长上下文精准把握",
                "advice": "Kimi 擅长处理超长上下文，适合需要大量背景信息的任务。建议充分利用上下文窗口提供完整信息。",
                "formula": "[完整背景] + [核心任务] + [分析维度] + [输出长度要求]",
                "waste": "过度拆分长文本反而会丢失上下文连贯性，Kimi的长窗口能力可以一次性处理完整信息",
            },
            "doubao": {
                "strength": "中文创意与情感表达",
                "style": "富有感染力的中文输出",
                "advice": "豆包在中文创意写作和情感表达上表现突出。适合文案、故事、营销内容创作，可以给出风格指导和情感调性要求。",
                "formula": "[风格调性] + [创作目标] + [目标受众] + [参考风格]",
                "waste": "过于机械的结构化指令会限制豆包的创作自由度，适当留白让模型发挥创意效果更好",
            },
            "gpt": {
                "strength": "综合能力均衡，多任务适应",
                "style": "全面通用型",
                "advice": "GPT 系列在各类任务上表现均衡。建议使用明确的角色设定、结构化输出格式和约束条件来最大化其综合能力。",
                "formula": "[角色设定] + [具体任务] + [输出格式] + [约束条件] + [示例参考]",
                "waste": "缺乏输出格式约束会导致GPT回答过于发散，浪费Token在无关内容上",
            },
            "claude": {
                "strength": "安全性、细致分析与深度思考",
                "style": "谨慎细致的分析型",
                "advice": "Claude 注重回答的安全性和深度。适合需要伦理考量、多角度分析的任务。建议提供清晰的思考框架。",
                "formula": "[分析框架] + [多角度要求] + [安全边界] + [输出结构]",
                "waste": "模糊或矛盾的要求会让Claude花费大量Token在安全审核上，导致核心内容输出不足",
            },
        }

        model_info = model_knowledge.get(model, {
            "strength": "通用能力强",
            "style": "综合型",
            "advice": f"{model_name} 建议参考官方文档获取最佳实践",
            "formula": "[目标] + [约束] + [输出格式]",
            "waste": "模糊的指令会浪费Token，建议清晰表达需求",
        })

        # --- Identify main mistakes ---
        main_mistakes = []
        score_map = {
            "清晰度": scores.clarity,
            "具体性": scores.specificity,
            "创造性": scores.creativity,
            "可行性": scores.feasibility,
            "完整性": scores.completeness,
            "简洁性": scores.conciseness,
            "模型适配度": scores.model_fit,
            "Token效率": scores.token_efficiency,
        }

        # Find lowest scoring dimensions
        sorted_dims = sorted(score_map.items(), key=lambda x: x[1])
        low_dims = [(name, val) for name, val in sorted_dims if val < 6]

        mistake_templates = {
            "清晰度": {
                "mistake": "指令表达模糊，缺乏明确的任务描述",
                "why": f"模糊指令会让{model_name}难以准确理解您的需求。{model_info['style']}风格的模型需要清晰的方向指引才能发挥其{model_info['strength']}的优势。",
                "fix": "使用「请完成以下任务：...」开头，明确说明您期望的具体输出内容",
            },
            "具体性": {
                "mistake": "缺少具体数字、示例或约束条件",
                "why": f"缺乏具体约束时，{model_name}会自行假设参数，结果可能与预期偏差很大。具体性能提升模型的输出精度。",
                "fix": "添加具体数字（字数、条数、时间等）、参考示例和明确的限制条件",
            },
            "创造性": {
                "mistake": "表达过于模板化，缺乏创意引导",
                "why": f"{model_name}在{model_info['strength']}方面有优势，但需要创意方向的引导才能输出精彩内容。",
                "fix": "加入风格要求、创意方向和参考案例，引导模型朝您期望的风格输出",
            },
            "可行性": {
                "mistake": "未明确输出格式，导致结果难以使用",
                "why": f"没有输出格式要求时，{model_name}会自由发挥，可能返回难以解析的格式。明确输出规范能提升{model_info['strength']}的发挥。",
                "fix": "指定输出格式（JSON/表格/列表/分段）、语言风格和详细程度",
            },
            "完整性": {
                "mistake": "缺少角色设定或任务框架不完整",
                "why": f"完整的Prompt框架（角色+任务+约束+输出）能让{model_name}更快进入状态，减少试错成本。",
                "fix": "构建完整框架：角色设定 + 任务描述 + 约束条件 + 输出格式",
            },
            "简洁性": {
                "mistake": "包含过多礼貌用语或重复表达",
                "why": f"冗余信息会占用{model_name}的上下文窗口，稀释核心指令的权重。{model_info['style']}模型在简洁指令下效率更高。",
                "fix": "删除「请」「你好」「谢谢」等礼貌用语，去除重复表述，每句话传递一个独特信息",
            },
            "模型适配度": {
                "mistake": f"Prompt结构与{model_name}的特性不匹配",
                "why": f"每个模型有独特优势：{model_info['strength']}。当前Prompt未充分利用{model_name}的核心能力。{model_info.get('waste', '')}",
                "fix": f"采用{model_name}友好的公式：{model_info['formula']}，充分发挥其{model_info['strength']}优势",
            },
            "Token效率": {
                "mistake": "Token使用效率不高，占用了过多上下文窗口",
                "why": f"{model_name}虽然能处理一定量的Token，但低效的Token使用会稀释核心指令，导致关键信息被噪音淹没。",
                "fix": "移除冗余修饰词，使用精确表达替代模糊描述，考虑使用结构化格式压缩信息密度",
            },
        }

        for dim_name, dim_val in low_dims:
            template = mistake_templates.get(dim_name, {
                "mistake": f"{dim_name}评分偏低（{dim_val}分）",
                "why": f"该维度影响{model_name}的{model_info['strength']}发挥",
                "fix": "参考优化版本中的建议进行改进",
            })
            main_mistakes.append(Mistake(
                mistake=template["mistake"],
                why_it_matters=template["why"].replace("{{TARGET_MODEL}}", model_name),
                how_to_fix=template["fix"],
            ))

        # If no low dimensions, give generic advice
        if not main_mistakes:
            main_mistakes.append(Mistake(
                mistake="整体表现良好，但还有提升空间",
                why_it_matters=f"高分Prompt也需要针对{model_name}的{model_info['strength']}特点做微调以达到最佳效果",
                how_to_fix=f"尝试使用{model_info['formula']}公式进一步优化，充分发挥{model_name}的优势",
            ))

        # --- Build learning formula ---
        scenario_formula_map = {
            "code": f"[编程语言/框架] + [功能描述] + [输入输出示例] + [性能/安全约束]",
            "copywriting": f"[品牌调性] + [目标受众] + [核心信息] + [风格参考] + [字数要求]",
            "data": f"[数据范围] + [分析维度] + [统计方法] + [可视化要求]",
            "creative": f"[创意方向] + [风格参考] + [限制条件] + [输出形式]",
            "education": f"[知识领域] + [受众水平] + [教学目标] + [互动方式] + [评估标准]",
            "business": f"[沟通对象] + [核心目的] + [关键信息] + [语气风格] + [行动要求]",
        }
        scenario_formula = scenario_formula_map.get(
            scenario,
            f"[目标] + [约束] + [输出格式]"
        )
        learning_formula = (
            f"【{model_name}专属Prompt公式】\n"
            f"核心公式：{model_info['formula']}\n\n"
            f"【{scenario_info['name']}场景增强公式】\n"
            f"{scenario_formula}\n\n"
            f"💡 {model_info['advice']}"
        )

        # --- Build next practice ---
        weakest_dim = sorted_dims[0]
        next_practice = NextPractice(
            task=f"针对「{weakest_dim[0]}」维度优化当前Prompt",
            instruction=(
                f"当前Prompt在「{weakest_dim[0]}」维度得分仅为{weakest_dim[1]}分。\n\n"
                f"请使用以下公式重写：\n{model_info['formula']}\n\n"
                f"重写要求：\n"
                f"1. 保留原始任务目标\n"
                f"2. 重点提升「{weakest_dim[0]}」维度得分\n"
                f"3. 遵循{model_name}的最佳实践\n"
                f"4. 确保适合{scenario_info['name']}场景"
            ),
            model_suggestion=f"建议使用 {model_name} 测试优化后的Prompt效果，验证{model_info['strength']}方面的表现",
        )

        # --- Short feedback ---
        if user_level == "advanced":
            short_feedback = (
                f"🎯 您已经是Prompt高手！针对{model_name}的{model_info['strength']}特点，"
                f"微调公式{model_info['formula']}即可达到顶尖效果。"
            )
        elif user_level == "intermediate":
            short_feedback = (
                f"📈 基础扎实！重点关注「{weakest_dim[0]}」维度，"
                f"结合{model_name}的{model_info['style']}风格特点，"
                f"使用公式{model_info['formula']}可以快速提升。"
            )
        else:
            short_feedback = (
                f"🌱 欢迎加入Prompt训练！从基础公式开始：{model_info['formula']}。"
                f"{model_name}擅长{model_info['strength']}，保持简洁清晰的指令就能看到明显进步！"
            )

        return TrainingFeedback(
            user_level=user_level,
            main_mistakes=main_mistakes,
            learning_formula=learning_formula,
            next_practice=next_practice,
            short_feedback=short_feedback,
        )
