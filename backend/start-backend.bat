@echo off
REM Backend Startup Script for Windows CMD
REM This script helps you start the backend server correctly

echo ========================================
echo   Cost Management Backend Startup
echo ========================================
echo.

REM Check if .env file exists
if exist .env (
    echo [OK] .env file found
    findstr /C:"PORT=" .env
) else (
    echo [ERROR] .env file not found!
    echo    Run: npm run setup:env
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Starting Backend Server...
echo ========================================
echo.
echo [INFO] Backend will run on: http://localhost:4000
echo [INFO] Swagger docs: http://localhost:4000/api
echo [INFO] Frontend should connect to: http://localhost:4000/api
echo.
echo [WARNING] Keep this terminal open while the server is running!
echo.
echo Starting server...
echo.

REM Start the server
npm run start:dev

pause


