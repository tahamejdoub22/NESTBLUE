# Backend Startup Script for Windows PowerShell
# This script helps you start the backend server correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cost Management Backend Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("backend")) {
    Write-Host "⚠️  Warning: Not in backend directory" -ForegroundColor Yellow
    Write-Host "   Current directory: $($currentDir.Path)" -ForegroundColor Yellow
    Write-Host ""
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    # Check PORT configuration
    $portLine = Get-Content .env | Select-String -Pattern "^PORT="
    if ($portLine) {
        Write-Host "   $portLine" -ForegroundColor Gray
        if ($portLine -match "PORT=4000") {
            Write-Host "✅ Port configured correctly (4000)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Port is not 4000. Expected: PORT=4000" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  PORT not found in .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Run: npm run setup:env" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Backend Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Backend will run on: http://localhost:4000" -ForegroundColor Cyan
Write-Host "📍 Swagger docs: http://localhost:4000/api" -ForegroundColor Cyan
Write-Host "📍 Frontend should connect to: http://localhost:4000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Keep this terminal open while the server is running!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Green
Write-Host ""

# Start the server
npm run start:dev


