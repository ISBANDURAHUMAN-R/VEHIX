# ==============================
# setup-and-run.ps1  –  VEHIX AI
# ==============================
# Run from PowerShell:
#   Set-Location <path-to-VEHIX>
#   .\setup-and-run.ps1
# -------------------------------------------------

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-ErrorMsg($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# 1️⃣ Verify we are on Windows
if ($env:OS -notlike "*Windows*") {
    Write-ErrorMsg "This script is intended for Windows only."
    exit 1
}

# 2️⃣ Detect Python (Prefer 3.12 for ML wheels compatibility)
$pythonCmd = "python"
if (Get-Command py -ErrorAction SilentlyContinue) {
    $has312 = py -0 2>$null | Select-String "3.12"
    if ($has312) {
        $pythonCmd = "py -3.12"
    }
}
Write-Info "Using Python runner: $pythonCmd"

# 3️⃣ Backend setup (Python virtual environment)
Write-Info "`n=== Backend setup ==="
$backendDir = Join-Path $PSScriptRoot "backend"
$venvDir = Join-Path $backendDir ".venv"

if (-not (Test-Path $venvDir)) {
    Write-Info "Creating virtual environment with $pythonCmd..."
    Invoke-Expression "$pythonCmd -m venv `"$venvDir`""
}

$venvPython = Join-Path $venvDir "Scripts\python.exe"

# Install Backend dependencies
Write-Info "Installing Backend Python dependencies..."
if (Get-Command uv -ErrorAction SilentlyContinue) {
    uv pip install --python $venvPython -r "$backendDir\requirements.txt"
} else {
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install -r "$backendDir\requirements.txt"
}
Write-Success "Backend dependencies verified."

# 4️⃣ Frontend setup
Write-Info "`n=== Frontend setup ==="
$frontendDir = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendDir

# Ensure src exists in frontend
if (-not (Test-Path (Join-Path $frontendDir "src")) -and (Test-Path (Join-Path $PSScriptRoot "src"))) {
    Write-Info "Syncing src directory to frontend..."
    Copy-Item -Recurse -Force (Join-Path $PSScriptRoot "src") (Join-Path $frontendDir "src")
}

Write-Info "Installing Frontend npm dependencies..."
if (Test-Path "package-lock.json") {
    npm ci
} else {
    npm install
}
Write-Success "Frontend dependencies installed."

# 5️⃣ Verify .env
$envPath = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envPath)) {
    $exampleEnv = Join-Path $PSScriptRoot ".env.example"
    if (Test-Path $exampleEnv) {
        Copy-Item $exampleEnv $envPath
    }
}
Copy-Item $envPath (Join-Path $backendDir ".env") -Force -ErrorAction SilentlyContinue
Write-Success "Configuration ready."

# 6️⃣ Launch Backend and Frontend in separate windows
Write-Info "`n=== Starting VEHIX Services ==="

# Backend (FastAPI on 127.0.0.1:8000)
Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "`$host.UI.RawUI.WindowTitle = 'VEHIX Backend (FastAPI)'; Set-Location '$backendDir'; .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
) -WindowStyle Normal

# Frontend (Vite on http://localhost:5173)
Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "`$host.UI.RawUI.WindowTitle = 'VEHIX Frontend (Vite)'; Set-Location '$frontendDir'; npm run dev"
) -WindowStyle Normal

Write-Success "`n==============================================="
Write-Success " 🚀 VEHIX AI is running!"
Write-Success " 🌐 Frontend: http://localhost:5173"
Write-Success " ⚡ Backend API: http://127.0.0.1:8000"
Write-Success " 📖 API Docs: http://127.0.0.1:8000/docs"
Write-Success "==============================================="

Set-Location $PSScriptRoot