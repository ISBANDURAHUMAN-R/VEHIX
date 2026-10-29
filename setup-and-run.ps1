# ===================================================
# VEHIX AI — One-Click Setup & Run Script (Windows)
# ===================================================
# Usage:
#   Open PowerShell, navigate to this folder, and run:
#   .\setup-and-run.ps1
# ===================================================

$ErrorActionPreference = "Stop"

function Write-Step($num, $msg) {
    Write-Host "`n[$num] $msg" -ForegroundColor Cyan
}

function Write-Success($msg) {
    Write-Host "[SUCCESS] $msg" -ForegroundColor Green
}

function Write-Warn($msg) {
    Write-Host "[WARNING] $msg" -ForegroundColor Yellow
}

function Write-Err($msg) {
    Write-Host "[ERROR] $msg" -ForegroundColor Red
}

Write-Host "=================================================" -ForegroundColor DarkCyan
Write-Host " 🚗 VEHIX — Intelligent Vehicle Detection System " -ForegroundColor White
Write-Host "=================================================" -ForegroundColor DarkCyan

# 1. Check Platform
if ($env:OS -notlike "*Windows*") {
    Write-Err "This script is designed for Windows environments."
    exit 1
}

# 2. Detect Python (Prefer Python 3.12 for ML wheel compatibility)
Write-Step "1/5" "Detecting Python..."
$pythonCmd = "python"
if (Get-Command py -ErrorAction SilentlyContinue) {
    $has312 = py -0 2>$null | Select-String "3.12"
    if ($has312) {
        $pythonCmd = "py -3.12"
    }
}
Write-Host "  Using Python runner: $pythonCmd" -ForegroundColor Gray

# 3. Backend Virtual Environment & Dependencies
Write-Step "2/5" "Configuring Backend (FastAPI + YOLO)..."
$backendDir = Join-Path $PSScriptRoot "backend"
$venvDir = Join-Path $backendDir ".venv"

if (-not (Test-Path $venvDir)) {
    Write-Host "  Creating virtual environment in backend\.venv..." -ForegroundColor Gray
    Invoke-Expression "$pythonCmd -m venv `"$venvDir`""
}

$venvPython = Join-Path $venvDir "Scripts\python.exe"

Write-Host "  Verifying backend dependencies..." -ForegroundColor Gray
if (Get-Command uv -ErrorAction SilentlyContinue) {
    uv pip install --python $venvPython -r "$backendDir\requirements.txt"
} else {
    & $venvPython -m pip install --upgrade pip --quiet
    & $venvPython -m pip install -r "$backendDir\requirements.txt" --quiet
}
Write-Success "Backend dependencies installed successfully."

# 4. Frontend Setup
Write-Step "3/5" "Configuring Frontend (Vite + React + Tailwind)..."
$frontendDir = Join-Path $PSScriptRoot "frontend"

if (-not (Test-Path $frontendDir)) {
    Write-Err "Frontend directory not found at $frontendDir"
    exit 1
}

Push-Location $frontendDir
try {
    Write-Host "  Installing frontend npm packages..." -ForegroundColor Gray
    if (Test-Path "package-lock.json") {
        npm ci --silent
    } else {
        npm install --silent
    }
    Write-Success "Frontend dependencies installed successfully."
} finally {
    Pop-Location
}

# 5. Environment File Setup
Write-Step "4/5" "Configuring Environment..."
$envPath = Join-Path $PSScriptRoot ".env"
$backendEnvPath = Join-Path $backendDir ".env"
$exampleEnv = Join-Path $PSScriptRoot ".env.example"

if (-not (Test-Path $envPath) -and (Test-Path $exampleEnv)) {
    Copy-Item $exampleEnv $envPath
}
if (Test-Path $envPath) {
    Copy-Item $envPath $backendEnvPath -Force -ErrorAction SilentlyContinue
}
Write-Success "Configuration ready."

# 6. Launch Servers
Write-Step "5/5" "Launching VEHIX Services..."

# Backend in dedicated window
Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "`$host.UI.RawUI.WindowTitle = 'VEHIX Backend (FastAPI)'; Set-Location '$backendDir'; .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
) -WindowStyle Normal

# Frontend in dedicated window
Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "`$host.UI.RawUI.WindowTitle = 'VEHIX Frontend (Vite)'; Set-Location '$frontendDir'; npm run dev"
) -WindowStyle Normal

Write-Host "`n=================================================" -ForegroundColor DarkGreen
Write-Host " 🚀 VEHIX is now running!" -ForegroundColor Green
Write-Host " 🌐 Web Dashboard:  http://localhost:5173" -ForegroundColor White
Write-Host " ⚡ Backend API:    http://127.0.0.1:8000" -ForegroundColor White
Write-Host " 📖 Swagger Docs:   http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "=================================================`n" -ForegroundColor DarkGreen