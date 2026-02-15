@echo off
REM SRA System - Complete Startup Script (Windows)
REM Run all services needed for the application

echo.
echo ================================================
echo Smart Reconciliation ^& Audit (SRA) System
echo Complete Startup Script (Windows)
echo ================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo. Node.js found: %NODE_VERSION%

echo.
echo Step 1: Installing backend dependencies...
cd backend
call npm install >nul 2>&1 && echo Done installing backend

echo.
echo Step 2: Installing frontend dependencies...
cd ..\frontend
call npm install >nul 2>&1 && echo Done installing frontend

echo.
echo Step 3: Seeding database with test users...
cd ..\backend
call node scripts/seed.js

echo.
echo ================================================
echo READY TO START!
echo ================================================
echo.
echo Open TWO new PowerShell/CMD windows and run:
echo.
echo Terminal 1 - Backend (Port 5000):
echo   cd backend
echo   npm start
echo.
echo Terminal 2 - Frontend (Port 5173):
echo   cd frontend
echo   npm run dev
echo.
echo Then open browser: http://localhost:5173
echo.
echo Test Account:
echo   Email: admin@example.com
echo   Password: Admin123!
echo.
echo ================================================
echo.
pause
