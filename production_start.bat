@echo off
title Sheetbotics WhatsApp SaaS - Production Server
color 0A
echo ======================================================================
echo           SHEETBOTICS WHATSAPP CLOUD API SAAS PLATFORM
echo               Production Windows Server Launch Script
echo ======================================================================
echo.

echo [1/3] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js LTS from https://nodejs.org
    pause
    exit /b 1
)

echo [2/3] Building production frontend assets...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)

echo [3/3] Starting unified production server on port 5000...
echo Serving:
echo   - React SPA Frontend: http://localhost:5000
echo   - WhatsApp Webhook:   http://localhost:5000/webhook/whatsapp
echo   - Meta Graph Gateway: http://localhost:5000/api/whatsapp
echo.
echo Press Ctrl+C to stop the server.
echo ======================================================================
echo.

call npm start
pause
