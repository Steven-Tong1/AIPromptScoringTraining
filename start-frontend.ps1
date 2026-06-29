# AI提示词培训平台 - 前端启动脚本 (PowerShell)
# 启动 Vite + React 前端开发服务器

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI提示词培训平台 - 前端服务启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$FrontendDir = Join-Path $PSScriptRoot "frontend"
Set-Location $FrontendDir

# 检查 node_modules
$NodeModules = Join-Path $FrontendDir "node_modules"
if (-not (Test-Path $NodeModules)) {
    Write-Host "[步骤1/2] 安装前端依赖..." -ForegroundColor Yellow
    npm install
    if (-not $?) {
        Write-Host "安装依赖失败，请确保已安装 Node.js 18+" -ForegroundColor Red
        Read-Host "按 Enter 键退出"
        exit 1
    }
}

# 启动前端
Write-Host "[步骤2/2] 启动前端开发服务器 (http://localhost:5173)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Gray
Write-Host ""

npm run dev

if (-not $?) {
    Write-Host "服务启动失败" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}
