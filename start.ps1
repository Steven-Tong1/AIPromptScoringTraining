# AI提示词培训平台 - 一键启动脚本 (PowerShell)
# 同时启动后端和前端服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI提示词培训平台 - 一键启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot

# 检查后端虚拟环境
$BackendDir = Join-Path $ProjectRoot "backend"
$VenvPath = Join-Path $BackendDir "venv"

if (-not (Test-Path $VenvPath)) {
    Write-Host "[后端] 创建Python虚拟环境..." -ForegroundColor Yellow
    Set-Location $BackendDir
    python -m venv venv
    if (-not $?) {
        Write-Host "[后端] 创建虚拟环境失败，请确保已安装 Python 3.10+" -ForegroundColor Red
        Read-Host "按 Enter 键退出"
        exit 1
    }
}

# 安装后端依赖
Write-Host "[后端] 安装依赖..." -ForegroundColor Yellow
$Pip = Join-Path $VenvPath "Scripts\pip"
& $Pip install -r requirements.txt -q
if (-not $?) {
    Write-Host "[后端] 安装依赖失败" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

# 初始化数据库
Write-Host "[后端] 初始化数据库并填充种子数据..." -ForegroundColor Yellow
$Python = Join-Path $VenvPath "Scripts\python"
& $Python seed_data.py
if (-not $?) {
    Write-Host "[后端] 数据库初始化失败，请确保 PostgreSQL 已启动且数据库已创建" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

# 检查前端依赖
$FrontendDir = Join-Path $ProjectRoot "frontend"
$NodeModules = Join-Path $FrontendDir "node_modules"
if (-not (Test-Path $NodeModules)) {
    Write-Host "[前端] 安装依赖..." -ForegroundColor Yellow
    Set-Location $FrontendDir
    npm install
    if (-not $?) {
        Write-Host "[前端] 安装依赖失败" -ForegroundColor Red
        Read-Host "按 Enter 键退出"
        exit 1
    }
}

# 启动后端 (新窗口)
Write-Host "[后端] 启动服务..." -ForegroundColor Yellow
$BackendScript = Join-Path $ProjectRoot "start-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& `"$BackendScript`"" -WindowStyle Normal

# 等待后端启动
Start-Sleep -Seconds 3

# 启动前端 (新窗口)
Write-Host "[前端] 启动服务..." -ForegroundColor Yellow
$FrontendScript = Join-Path $ProjectRoot "start-frontend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& `"$FrontendScript`"" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  所有服务启动中..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  后端服务: http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API文档:   http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  前端服务: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  默认账户:" -ForegroundColor Gray
Write-Host "  管理员: admin / admin123" -ForegroundColor Gray
Write-Host "  演示用户: demo / demo123" -ForegroundColor Gray
Write-Host ""
Write-Host "  请分别在各窗口中按 Ctrl+C 停止服务" -ForegroundColor Yellow
Write-Host ""

# 回到项目根目录
Set-Location $ProjectRoot
