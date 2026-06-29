@echo off
chcp 65001 >nul
title AI提示词培训平台 - 前端服务

echo ========================================
echo   AI提示词培训平台 - 前端服务启动
echo ========================================
echo.

set "FRONTEND_DIR=%~dp0frontend"
cd /d "%FRONTEND_DIR%"

REM 检查 node_modules
if not exist "node_modules" (
    echo [步骤1/2] 安装前端依赖...
    call npm install
    if errorlevel 1 (
        echo 安装依赖失败，请确保已安装 Node.js 18+
        pause
        exit /b 1
    )
)

REM 启动前端
echo [步骤2/2] 启动前端开发服务器 (http://localhost:5173)...
echo.
echo 按 Ctrl+C 停止服务
echo.

call npm run dev

if errorlevel 1 (
    echo 服务启动失败
    pause
    exit /b 1
)

pause
