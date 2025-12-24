# Kill process using port 3001
Write-Host "Finding process using port 3001..." -ForegroundColor Yellow

$processes = netstat -ano | findstr :3001
if ($processes) {
    $pids = $processes | ForEach-Object {
        if ($_ -match '\s+(\d+)\s*$') {
            $matches[1]
        }
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        Write-Host "Killing process with PID: $pid" -ForegroundColor Red
        taskkill /PID $pid /F
    }
    Write-Host "✅ Port 3001 is now free" -ForegroundColor Green
} else {
    Write-Host "✅ Port 3001 is already free" -ForegroundColor Green
}


