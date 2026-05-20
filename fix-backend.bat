@echo off
echo ========================================
echo DevPulse Backend Fix Script
echo ========================================
echo.

echo [1/4] Stopping any running processes...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Removing old virtual environment...
cd backend
if exist venv (
    rmdir /s /q venv
    echo Virtual environment removed.
) else (
    echo No virtual environment found.
)

echo [3/4] Creating fresh virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [4/4] Installing dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install --no-cache-dir -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Backend is ready.
echo ========================================
echo.
echo Now run: .\start-devpulse.bat
echo.
pause

@REM Made with Bob
