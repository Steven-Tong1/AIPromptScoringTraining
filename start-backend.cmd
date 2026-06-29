@echo off
chcp 65001 >nul
title AI提示词培训平台 - 后端服务

echo ========================================
echo   AI提示词培训平台 - 后端服务启动
echo ========================================
echo.

set "BACKEND_DIR=%~dp0backend"
cd /d "%BACKEND_DIR%"

REM 检查虚拟环境
if not exist "venv" (
    echo [步骤1/3] 创建Python虚拟环境...
    python -m venv venv
    if errorlevel 1 (
        echo 创建虚拟环境失败，请确保已安装 Python 3.10+
        pause
        exit /b 1
    )
)

REM 安装依赖
echo [步骤1/3] 检查并安装依赖...
call venv\Scripts\pip install -r requirements.txt -q
if errorlevel 1 (
    echo 安装依赖失败
    pause
    exit /b 1
)

REM 初始化数据库
echo [步骤2/3] 初始化数据库并填充种子数据...
call venv\Scripts\python seed_data.py
if errorlevel 1 (
    echo 数据库初始化失败，请确保 PostgreSQL 已启动且数据库已创建
    pause
    exit /b 1
)

REM 启动服务
echo [步骤3/3] 启动后端服务 (http://localhost:8000)...
echo.
echo API文档: http://localhost:8000/docs
echo 按 Ctrl+C 停止服务
echo.

call venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if errorlevel 1 (
    echo 服务启动失败
    pause
    exit /b 1
)

pause
