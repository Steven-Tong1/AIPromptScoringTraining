# AI提示词培训平台 - 后端启动脚本 (PowerShell)
# 启动 FastAPI 后端服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI提示词培训平台 - 后端服务启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BackendDir = Join-Path $PSScriptRoot "backend"
Set-Location $BackendDir

# 检查虚拟环境
$VenvPath = Join-Path $BackendDir "venv"
if (-not (Test-Path $VenvPath)) {
    Write-Host "[步骤1/3] 创建Python虚拟环境..." -ForegroundColor Yellow
    python -m venv venv
    if (-not $?) {
        Write-Host "创建虚拟环境失败，请确保已安装 Python 3.10+" -ForegroundColor Red
        Read-Host "按 Enter 键退出"
        exit 1
    }
}

# 激活虚拟环境并安装依赖
Write-Host "[步骤1/3] 检查并安装依赖..." -ForegroundColor Yellow
$Pip = Join-Path $VenvPath "Scripts\pip"
& $Pip install -r requirements.txt -q
if (-not $?) {
    Write-Host "安装依赖失败" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

# 初始化数据库和种子数据
Write-Host "[步骤2/3] 初始化数据库并填充种子数据..." -ForegroundColor Yellow
$Python = Join-Path $VenvPath "Scripts\python"
& $Python seed_data.py
if (-not $?) {
    Write-Host "数据库初始化失败，请确保 PostgreSQL 已启动且数据库已创建" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

# 启动后端服务
Write-Host "[步骤3/3] 启动后端服务 (http://localhost:8000)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "API文档: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Gray
Write-Host ""

$Uvicorn = Join-Path $VenvPath "Scripts\uvicorn"
& $Uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if (-not $?) {
    Write-Host "服务启动失败" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}
