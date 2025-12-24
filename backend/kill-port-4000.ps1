# Kill processes using port 4000
$port = 4000
Write-Host "🔍 Finding processes using port $port..."

# Try using Get-NetTCPConnection (Windows 8+)
try {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($processId in $processIds) {
            Write-Host "🛑 Killing process with PID: $processId"
            try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "✅ Process $processId killed successfully"
            } catch {
                Write-Host "❌ Failed to kill process $processId : $_"
            }
        }
    } else {
        Write-Host "✅ No processes found using port $port"
    }
} catch {
    # Fallback to netstat method
    Write-Host "Using netstat fallback..."
    $netstatOutput = netstat -ano | Select-String ":$port"
    if ($netstatOutput) {
        $processIds = $netstatOutput | ForEach-Object {
            if ($_ -match '\s+(\d+)$') {
                $matches[1]
            }
        } | Select-Object -Unique
        
        foreach ($processId in $processIds) {
            Write-Host "🛑 Killing process with PID: $processId"
            try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "✅ Process $processId killed successfully"
            } catch {
                Write-Host "❌ Failed to kill process $processId : $_"
            }
        }
    } else {
        Write-Host "✅ No processes found using port $port"
    }
}

Write-Host "✅ Done!"


