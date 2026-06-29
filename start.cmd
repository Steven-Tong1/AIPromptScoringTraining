@echo off
chcp 65001 >nul
title AI提示词培训平台 - 一键启动

echo ========================================
echo   AI提示词培训平台 - 一键启动
echo ========================================
echo.

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"

REM 检查后端虚拟环境
if not exist "%BACKEND_DIR%\venv" (
    echo [后端] 创建Python虚拟环境...
    cd /d "%BACKEND_DIR%"
    python -m venv venv
    if errorlevel 1 (
        echo [后端] 创建虚拟环境失败，请确保已安装 Python 3.10+
        pause
        exit /b 1
    )
)

REM 安装后端依赖
echo [后端] 安装依赖...
call "%BACKEND_DIR%\venv\Scripts\pip" install -r "%BACKEND_DIR%\requirements.txt" -q
if errorlevel 1 (
    echo [后端] 安装依赖失败
    pause
    exit /b 1
)

REM 初始化数据库
echo [后端] 初始化数据库并填充种子数据...
call "%BACKEND_DIR%\venv\Scripts\python" "%BACKEND_DIR%\seed_data.py"
if errorlevel 1 (
    echo [后端] 数据库初始化失败，请确保 PostgreSQL 已启动且数据库已创建
    pause
    exit /b 1
)

REM 检查前端依赖
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [前端] 安装依赖...
    cd /d "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo [前端] 安装依赖失败
        pause
        exit /b 1
    )
)

REM 启动后端 (新窗口)
echo [后端] 启动服务...
start "AI后端服务" cmd /c "%PROJECT_ROOT%start-backend.cmd"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端 (新窗口)
echo [前端] 启动服务...
start "AI前端服务" cmd /c "%PROJECT_ROOT%start-frontend.cmd"

echo.
echo ========================================
echo   所有服务启动中...
echo ========================================
echo.
echo   后端服务: http://localhost:8000
echo   API文档:   http://localhost:8000/docs
echo   前端服务: http://localhost:5173
echo.
echo   默认账户:
echo   管理员: admin / admin123
echo   演示用户: demo / demo123
echo.
echo   请分别在各窗口中按 Ctrl+C 停止服务
echo.

cd /d "%PROJECT_ROOT%"
pause
