# ===================================================
# VEHIX AI — Full Setup & Run Script (Windows)
# ===================================================
# Usage:
#   .\full-setup.ps1
# ===================================================

$ErrorActionPreference = "Stop"

function Write-Step($num, $msg) {
    Write-Host "`n[$num] $msg" -ForegroundColor Cyan
}

function Write-Success($msg) {
    Write-Host "[SUCCESS] $msg" -ForegroundColor Green
}

function Write-Err($msg) {
    Write-Host "[ERROR] $msg" -ForegroundColor Red
}

Write-Host "=================================================" -ForegroundColor DarkCyan
Write-Host " 🚗 VEHIX — Intelligent Vehicle Detection System " -ForegroundColor White
Write-Host "=================================================" -ForegroundColor DarkCyan

# 1. Platform check
if ($env:OS -notlike "*Windows*") {
    Write-Err "This script is designed for Windows environments."
    exit 1
}

# 2. Python Selection
Write-Step "1/5" "Selecting Python..."
$pythonCmd = "python"
if (Get-Command py -ErrorAction SilentlyContinue) {
    $has312 = py -0 2>$null | Select-String "3.12"
    if ($has312) {
        $pythonCmd = "py -3.12"
    }
}
Write-Host "  Using Python runner: $pythonCmd" -ForegroundColor Gray

# 3. Backend Setup
Write-Step "2/5" "Setting up Backend..."
$backendDir = Join-Path $PSScriptRoot "backend"
$venvDir = Join-Path $backendDir ".venv"

if (-not (Test-Path $venvDir)) {
    Write-Host "  Creating virtual environment in backend\.venv..." -ForegroundColor Gray
    Invoke-Expression "$pythonCmd -m venv `"$venvDir`""
}

$venvPython = Join-Path $venvDir "Scripts\python.exe"
Write-Host "  Installing backend dependencies..." -ForegroundColor Gray
if (Get-Command uv -ErrorAction SilentlyContinue) {
    uv pip install --python $venvPython -r "$backendDir\requirements.txt"
} else {
    & $venvPython -m pip install --upgrade pip --quiet
    & $venvPython -m pip install -r "$backendDir\requirements.txt" --quiet
}
Write-Success "Backend ready."

# 4. Frontend Setup
Write-Step "3/5" "Setting up Frontend..."
$frontendDir = Join-Path $PSScriptRoot "frontend"
Push-Location $frontendDir
try {
    Write-Host "  Installing frontend packages..." -ForegroundColor Gray
    if (Test-Path "package-lock.json") {
        npm ci --silent
    } else {
        npm install --silent
    }
    Write-Success "Frontend ready."
} finally {
    Pop-Location
}

# 5. Environment
Write-Step "4/5" "Preparing Configuration..."
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
Write-Step "5/5" "Starting VEHIX Services..."
Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "`$host.UI.RawUI.WindowTitle = 'VEHIX Backend (FastAPI)'; Set-Location '$backendDir'; .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
) -WindowStyle Normal

Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "`$host.UI.RawUI.WindowTitle = 'VEHIX Frontend (Vite)'; Set-Location '$frontendDir'; npm run dev"
) -WindowStyle Normal

Write-Host "`n=================================================" -ForegroundColor DarkGreen
Write-Host " 🚀 VEHIX AI is running!" -ForegroundColor Green
Write-Host " 🌐 Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host " ⚡ Backend:   http://127.0.0.1:8000" -ForegroundColor White
Write-Host " 📖 API Docs:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "=================================================`n" -ForegroundColor DarkGreen
