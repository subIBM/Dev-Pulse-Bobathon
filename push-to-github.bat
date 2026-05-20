@echo off
echo ========================================
echo DevPulse - GitHub Push Script
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    echo.
)

REM Check if remote exists
git remote -v | findstr origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo No remote repository configured.
    echo Please enter your GitHub repository URL:
    echo Example: https://github.com/username/devpulse.git
    set /p REPO_URL="Repository URL: "
    
    git remote add origin %REPO_URL%
    echo Remote added successfully!
    echo.
)

REM Show current status
echo Current Git Status:
echo -------------------
git status
echo.

REM Ask for commit message
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update DevPulse codebase

echo.
echo Adding all files...
git add .

echo.
echo Creating commit...
git commit -m "%COMMIT_MSG%"

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo Push failed! Common solutions:
    echo 1. Check your internet connection
    echo 2. Verify GitHub credentials
    echo 3. Ensure repository exists on GitHub
    echo 4. Try: git push -f origin main (force push)
    echo ========================================
    pause
    exit /b 1
)

echo.
echo ========================================
echo Successfully pushed to GitHub!
echo ========================================
echo.
echo Next steps:
echo 1. Visit your repository on GitHub
echo 2. Check the Actions tab for CI/CD status
echo 3. Review the GITHUB_DEPLOYMENT.md guide
echo.
pause

@REM Made with Bob
