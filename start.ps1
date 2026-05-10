# ICity Business Manager - Startup Script
# Run this from PowerShell in the icity-app directory

Write-Host "=== ICity Business Manager ===" -ForegroundColor Cyan

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host "Node.js version: $(node --version)" -ForegroundColor Green

# Setup backend .env
if (-not (Test-Path ".\backend\.env")) {
    Copy-Item ".\backend\.env.example" ".\backend\.env"
    Write-Host "Created backend/.env - please add your Google OAuth credentials" -ForegroundColor Yellow
}

# Setup frontend .env
if (-not (Test-Path ".\frontend\.env")) {
    Copy-Item ".\frontend\.env.example" ".\frontend\.env"
    Write-Host "Created frontend/.env - please add your Google Client ID" -ForegroundColor Yellow
}

# Install dependencies if needed
if (-not (Test-Path ".\backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Push-Location .\backend ; npm install ; Pop-Location
}

if (-not (Test-Path ".\frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location .\frontend ; npm install ; Pop-Location
}

# Start both servers
Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Green
Write-Host "  Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray

$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; node src/index.js" -PassThru
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -PassThru

Write-Host "Servers started in separate windows."
Write-Host "Open http://localhost:3000 in your browser."
