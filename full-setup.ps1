# Full setup and run script for VEHIX AI project
# -------------------------------------------------

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[SUCCESS] $msg" -ForegroundColor Green }

# 1️⃣ Frontend Setup
$frontendPath = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendPath

# Ensure src exists in frontend
if (-not (Test-Path (Join-Path $frontendPath "src")) -and (Test-Path (Join-Path $PSScriptRoot "src"))) {
    Write-Info "Syncing src directory to frontend..."
    Copy-Item -Recurse -Force (Join-Path $PSScriptRoot "src") (Join-Path $frontendPath "src")
}

Write-Info "Installing frontend dependencies..."
if (Test-Path "package-lock.json") {
    npm ci
} else {
    npm install
}

# 2️⃣ Backend Setup
$backendPath = Join-Path $PSScriptRoot "backend"
$venvDir = Join-Path $backendPath ".venv"

$pythonCmd = "python"
if (Get-Command py -ErrorAction SilentlyContinue) {
    $has312 = py -0 2>$null | Select-String "3.12"
    if ($has312) {
        $pythonCmd = "py -3.12"
    }
}

if (-not (Test-Path $venvDir)) {
    Write-Info "Creating Python virtual environment using $pythonCmd..."
    Invoke-Expression "$pythonCmd -m venv `"$venvDir`""
}

$venvPython = Join-Path $venvDir "Scripts\python.exe"

Write-Info "Installing backend Python dependencies..."
if (Get-Command uv -ErrorAction SilentlyContinue) {
    uv pip install --python $venvPython -r "$backendPath\requirements.txt"
} else {
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install -r "$backendPath\requirements.txt"
}

# 3️⃣ Configuration
$envPath = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envPath)) {
    $exampleEnv = Join-Path $PSScriptRoot ".env.example"
    if (Test-Path $exampleEnv) {
        Copy-Item $exampleEnv $envPath
    }
}
Copy-Item $envPath (Join-Path $backendPath ".env") -Force -ErrorAction SilentlyContinue

# 4️⃣ Launch backend and frontend servers
Write-Info "Starting FastAPI backend..."
Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "`$host.UI.RawUI.WindowTitle = 'VEHIX Backend (FastAPI)'; Set-Location '$backendPath'; .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
) -WindowStyle Normal

Write-Info "Starting Vite frontend dev server..."
Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "`$host.UI.RawUI.WindowTitle = 'VEHIX Frontend (Vite)'; Set-Location '$frontendPath'; npm run dev"
) -WindowStyle Normal

Write-Success "`n[DONE] VEHIX AI is up and running!"
Write-Success "Frontend:  http://localhost:5173"
Write-Success "Backend:   http://127.0.0.1:8000"
Write-Success "Docs:      http://127.0.0.1:8000/docs"

Set-Location $PSScriptRoot
