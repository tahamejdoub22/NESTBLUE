# Quick test script to verify backend server is running
Write-Host "Testing backend server on port 4000..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if port is listening
Write-Host "1. Checking if port 4000 is listening..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName localhost -Port 4000 -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host "   ✅ Port 4000 is listening" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 4000 is NOT listening" -ForegroundColor Red
    Write-Host "   The server may not be running or crashed after startup" -ForegroundColor Yellow
}

Write-Host ""

# Test 2: Try to access health endpoint
Write-Host "2. Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Health endpoint responded!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Try to access Swagger
Write-Host "3. Testing Swagger endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Swagger endpoint responded!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Swagger endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "If all tests pass, your server is working!" -ForegroundColor Green
Write-Host "If tests fail, restart the backend server:" -ForegroundColor Yellow
Write-Host "  1. Press Ctrl+C in backend terminal" -ForegroundColor Yellow
Write-Host "  2. Run: npm run start:dev" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan


