# 🧠 AI提示词培训平台 (AIPromptScoringTraining)

> 帮助用户学习和掌握AI提示词编写技巧，支持提示词创建、评分、会员管理等功能的完整平台。

## 📋 功能特性

### ✅ 用户系统
- 用户注册与登录（JWT认证）
- 个人资料管理
- 权限管理

### ✅ 提示词管理
- 创建/编辑/删除提示词
- 提示词分类（文案写作、代码生成、数据分析等）
- 难度等级（入门/进阶/高级）
- 搜索与筛选

### ✅ 评分系统（8维评估）
- **8维度评分**：清晰度、具体性、创造性、可行性、完整性、简洁性、模型适配度、Token效率
- **模型感知评分**：根据所选目标模型（DeepSeek/Qwen/Kimi/豆包/GPT/Claude）动态调整适配度和效率评分
- 综合评分计算（8维均分）
- 评分历史查看
- 评语反馈

### ✅ AI Prompt训练系统（核心功能）
- **智能评分雷达图**：8维度可视化评分展示
- **Token冗余诊断**：自动识别冗余表达并给出精简建议
- **三版本优化**：精简版、结构版（角色+约束）、示例版（Few-shot引导）
- **训练教练反馈**：基于目标模型特性的个性化训练建议
- **模型感知反馈**：结合所选模型的优势/风格进行针对性指导
- **用户水平评估**：自动判定 beginner / intermediate / advanced
- **专属练习任务**：针对薄弱维度生成可执行的练习任务
- **下次写作公式**：为目标模型+使用场景定制的最佳Prompt公式
- **支持6大使用场景**：代码开发、文案创作、数据分析、创意设计、教育学习、商务办公

### ✅ 会员系统
- 多层级会员方案（免费版/专业版/企业版/年度专业版）
- 会员权限控制
- 在线支付模拟
- 充值记录

## 🏗️ 技术架构

### 前端 (Frontend)
| 技术 | 用途 |
|------|------|
| React 18 | UI框架 |
| TypeScript | 类型安全 |
| Ant Design 5 | 组件库 |
| React Router 6 | 路由管理 |
| Zustand | 状态管理 |
| Axios | HTTP请求 |
| Vite | 构建工具 |

### 后端 (Backend)
| 技术 | 用途 |
|------|------|
| Python 3.10+ | 运行环境 |
| FastAPI | Web框架 |
| SQLAlchemy 2.0 | ORM |
| PostgreSQL | 数据库 |
| Alembic | 数据库迁移 |
| JWT | 身份认证 |
| Passlib | 密码加密 |

## 🚀 快速开始

### 前置条件

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1️⃣ 克隆项目

```bash
cd AIPromptScoringTraining
```

### 2️⃣ 配置数据库

创建PostgreSQL数据库：

```sql
CREATE DATABASE ai_prompt_training;
```

修改 `backend/.env` 中的数据库连接信息：

```env
DATABASE_URL=postgresql://用户名:密码@localhost:5432/ai_prompt_training
```

### 3️⃣ 启动后端

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境 (Windows)
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 初始化数据库并填充种子数据
python seed_data.py

# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端运行在: http://localhost:8000
API文档: http://localhost:8000/docs

### 4️⃣ 启动前端

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端运行在: http://localhost:5173

## 🔑 默认账户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 演示用户 | demo | demo123 |

## 📁 项目结构

```
AIPromptScoringTraining/
├── backend/                    # Python FastAPI 后端
│   ├── app/
│   │   ├── api/               # API路由
│   │   │   ├── auth.py        # 认证接口
│   │   │   ├── prompts.py     # 提示词接口
│   │   │   ├── memberships.py # 会员接口
│   │   │   └── training.py    # ✨ 训练评分接口
│   │   ├── core/              # 核心配置
│   │   │   ├── config.py      # 配置管理
│   │   │   ├── database.py    # 数据库连接
│   │   │   └── security.py    # JWT/密码
│   │   ├── models/            # 数据库模型
│   │   │   ├── user.py        # 用户模型
│   │   │   ├── prompt.py      # 提示词模型
│   │   │   └── membership.py  # 会员模型
│   │   ├── schemas/           # Pydantic验证
│   │   │   └── training.py    # ✨ 训练评分Schema
│   │   ├── services/          # 业务逻辑
│   │   │   ├── auth.py        # 认证服务
│   │   │   ├── membership.py  # 会员服务
│   │   │   ├── prompt.py      # 提示词服务
│   │   │   └── training.py    # ✨ AI评分+训练服务核心
│   │   └── main.py            # 入口文件
│   ├── alembic/               # 数据库迁移
│   ├── seed_data.py           # 种子数据
│   ├── .env                   # 环境变量
│   └── requirements.txt       # Python依赖
├── frontend/                   # React前端
│   ├── src/
│   │   ├── api/               # API调用
│   │   │   └── training.ts    # ✨ 训练API客户端
│   │   ├── components/        # 公共组件
│   │   ├── pages/             # 页面组件
│   │   │   └── TrainingPage.tsx # ✨ 训练页面（3步流程）
│   │   ├── store/             # 状态管理
│   │   └── App.tsx            # 路由配置
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 📸 API接口概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/auth/register | 用户注册 |
| POST | /api/v1/auth/login | 用户登录 |
| GET | /api/v1/auth/me | 获取当前用户 |
| PUT | /api/v1/auth/me | 更新个人资料 |
| GET | /api/v1/prompts | 提示词列表 |
| POST | /api/v1/prompts | 创建提示词 |
| GET | /api/v1/prompts/search | 搜索提示词 |
| GET | /api/v1/prompts/{id} | 提示词详情 |
| PUT | /api/v1/prompts/{id} | 更新提示词 |
| DELETE | /api/v1/prompts/{id} | 删除提示词 |
| POST | /api/v1/prompts/{id}/scores | 评分提示词 |
| GET | /api/v1/prompts/{id}/scores | 获取评分 |
| GET | /api/v1/memberships/plans | 会员方案列表 |
| POST | /api/v1/memberships/payments | 创建支付 |
| GET | /api/v1/memberships/my | 我的会员 |
| POST | /api/v1/training/analyze | ✨ Prompt评分与训练分析 |
| GET | /api/v1/training/models | ✨ 获取支持的模型列表 |
| GET | /api/v1/training/scenarios | ✨ 获取支持的使用场景 |
