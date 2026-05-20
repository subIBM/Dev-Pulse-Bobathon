@echo off
echo ========================================
echo   DevPulse - AI-Powered Sprint Orchestrator
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9 or higher from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Setting up Backend...
echo.

REM Setup backend
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install backend dependencies
echo Installing backend dependencies...
pip install -r requirements.txt --quiet

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

echo.
echo [2/4] Starting Backend Server...
echo Backend will run at: http://localhost:8000
echo.

REM Start backend in new window
start "DevPulse Backend" cmd /k "cd /d %CD% && venv\Scripts\activate.bat && python -m app.main"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

cd ..

echo [3/4] Setting up Frontend...
echo.

REM Setup frontend
cd frontend

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo.
echo [4/4] Starting Frontend Server...
echo Frontend will run at: http://localhost:5173
echo.

REM Start frontend in new window
start "DevPulse Frontend" cmd /k "cd /d %CD% && npm run dev"

cd ..

echo.
echo ========================================
echo   DevPulse Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:5173

echo.
echo To stop the servers, close the Backend and Frontend windows.
echo.
pause

@REM Made with Bob
