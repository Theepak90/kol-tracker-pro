@echo off
echo 🚀 Starting KOL Tracker Pro...
echo =================================

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo ⚠️  MongoDB is not running. Please start MongoDB first:
    echo    net start MongoDB
    echo    or start MongoDB service from Services panel
    pause
    exit /b 1
)

REM Function to kill processes on specific ports
echo 🧹 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

REM Start Backend (NestJS)
echo 🔧 Starting Backend (NestJS) on port 3000...
cd backend
start "Backend" cmd /c "npm run start:dev"
cd ..

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start Telethon Service (Python)
echo 🐍 Starting Telethon Service (Python) on port 8000...
cd backend\telethon_service

REM Check if virtual environment exists
if exist "venv" (
    echo 📦 Activating Python virtual environment...
    call venv\Scripts\activate
) else (
    echo ⚠️  Virtual environment not found. Creating one...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
)

start "Telethon" cmd /c "python main.py"
cd ..\..

REM Wait for Telethon service to start
timeout /t 5 /nobreak >nul

REM Start Frontend (React)
echo ⚛️  Starting Frontend (React) on port 5173...
start "Frontend" cmd /c "npm run dev"

REM Wait a bit for all services to start
timeout /t 3 /nobreak >nul

echo.
echo ✅ All services started successfully!
echo =================================
echo 🌐 Frontend:        http://localhost:5173
echo 🔧 Backend API:     http://localhost:3000
echo 🐍 Telethon API:    http://localhost:8000
echo.
echo 📱 Open your browser and go to: http://localhost:5173
echo.
echo To stop all services, run: stop.bat
echo.
echo Press any key to exit...
pause >nul 