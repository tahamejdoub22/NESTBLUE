# Backend Server Status Checker
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend Server Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$port = 3001
$apiUrl = "http://localhost:$port/api"
$healthUrl = "http://localhost:$port/api/health"

Write-Host "Checking port $port..." -ForegroundColor Yellow

# Check if port is in use
$portCheck = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue

if ($portCheck) {
    Write-Host "✅ Port $port is open and listening" -ForegroundColor Green
    Write-Host ""
    
    # Try to reach the API
    Write-Host "Testing API endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $apiUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ API is responding!" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ API is not responding" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Try health endpoint
    Write-Host ""
    Write-Host "Testing health endpoint..." -ForegroundColor Yellow
    try {
        $healthResponse = Invoke-WebRequest -Uri $healthUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ Health endpoint is working!" -ForegroundColor Green
        Write-Host "   Response: $($healthResponse.Content)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Health endpoint not available (may not be registered yet)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Port $port is NOT open" -ForegroundColor Red
    Write-Host ""
    Write-Host "The backend server is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start the backend:" -ForegroundColor Yellow
    Write-Host "  1. Make sure you're in the backend directory" -ForegroundColor Yellow
    Write-Host "  2. Run: npm run start:dev" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Wait for this message:" -ForegroundColor Yellow
    Write-Host "  🚀 Application is running on: http://localhost:$port" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan


