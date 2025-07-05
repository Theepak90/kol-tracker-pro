@echo off
echo 🛑 Stopping KOL Tracker Pro services...
echo =======================================

REM Function to kill processes on specific ports
echo 🔪 Stopping Backend (NestJS) on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
    echo ✅ Backend stopped.
)

echo 🔪 Stopping Telethon Service (Python) on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
    echo ✅ Telethon Service stopped.
)

echo 🔪 Stopping Frontend (React) on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
    echo ✅ Frontend stopped.
)

echo.
echo ✅ All services have been stopped.
echo 🚀 To start again, run: start.bat
echo.
pause 