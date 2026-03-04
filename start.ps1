# Lumbarong - Start Backend + Frontend
Write-Host "Starting Lumbarong..." -ForegroundColor Cyan

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Backend starting on port 5000...' -ForegroundColor Green; npm run dev"

# Small delay so backend starts first
Start-Sleep -Seconds 2

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Frontend starting on port 3000...' -ForegroundColor Yellow; npm run dev"

Write-Host "Both servers launched!" -ForegroundColor Cyan
Write-Host "  Backend  -> http://localhost:5000" -ForegroundColor Green
Write-Host "  Frontend -> http://localhost:3000" -ForegroundColor Yellow
