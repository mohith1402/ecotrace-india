@echo off
title EcoTrace India - GitHub & Cloud Run Deployer
color 0B
cls

echo =====================================================================
echo              EcoTrace India Git Setup & Deployment Guide
echo =====================================================================
echo.
echo This script will help you initialize Git, commit your files, and push
echo them to your GitHub repository. Then, it will show you how to connect
echo it to Google Cloud Run with zero CLI installations.
echo.
echo ---------------------------------------------------------------------

:: Check if Git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Git is not installed or not in your system PATH.
    echo Please download and install Git from: https://git-scm.com/
    echo.
    pause
    exit /b
)

echo [1/3] Initializing local Git repository...
if not exist ".git" (
    git init -b main
) else (
    echo Local Git repository already initialized.
)
echo.

echo [2/3] Staging and committing files...
git add .
git commit -m "Initial commit: EcoTrace India Platform"
echo.

echo ---------------------------------------------------------------------
echo [3/3] Link and Push to your GitHub Repository
echo ---------------------------------------------------------------------
echo Please create a new public or private repository on github.com
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/username/repo.git): "

if "%REPO_URL%"=="" (
    echo.
    echo No repository URL entered. Local commit saved.
    goto CLOUD_RUN_GUIDE
)

:: Remove existing origin if it exists, then add new one
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%

echo.
echo Pushing code to GitHub (main branch)...
git push -u origin main

if %errorlevel% neq 0 (
    color 0E
    echo.
    echo [WARNING] Pushing failed. If this is a new repository, check:
    echo 1. You spelled the repository URL correctly.
    echo 2. You have authenticated Git with GitHub (credentials/tokens).
    echo 3. The remote repository is empty.
    echo.
    echo You can try pushing manually later with: git push -u origin main
) else (
    color 0A
    echo.
    echo [SUCCESS] Your code has been pushed to GitHub!
)

:CLOUD_RUN_GUIDE
echo.
echo =====================================================================
echo                DEPLOYING TO GOOGLE CLOUD RUN (GUIDE)
echo =====================================================================
echo.
echo Since you don't have the gcloud CLI installed on your PC, the easiest 
echo and best way is to connect your GitHub repository directly in the 
echo Google Cloud Web Console. It will deploy automatically on every push!
echo.
echo Follow these simple steps:
echo 1. Open Google Cloud Console: https://console.cloud.google.com/
echo 2. Search for "Cloud Run" in the top search bar.
echo 3. Click "CREATE SERVICE" at the top.
echo 4. Choose "Continuously deploy new revisions from a source repository".
echo 5. Click "SET UP WITH CLOUD BUILD".
echo 6. Select "GitHub" as your provider, authenticate, and select your repository:
echo    "%REPO_URL%"
echo 7. Click Next. Choose Build Type as "Dockerfile" (it will automatically find the 
echo    Dockerfile we created for you).
echo 8. Click Save.
echo 9. In the Service Settings, set:
echo    - Service name: ecotrace-india
echo    - Region: us-central1 (or any preferred region)
echo    - Authentication: Select "Allow unauthenticated invocations" (so anyone can visit the web page).
echo 10. Click CREATE at the bottom.
echo.
echo Cloud Run will build your Docker container and give you a live HTTPS URL!
echo.
echo =====================================================================
pause
