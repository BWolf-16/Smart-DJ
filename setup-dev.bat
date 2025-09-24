@echo off
REM Smart DJ Development Setup Script for Windows

echo 🎵 Smart DJ Development Setup
echo ==============================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js %node --version% detected

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Copy environment file if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo 📝 Created .env file from .env.example
    echo ⚠️  Please update the .env file with your API keys!
)

REM Create necessary directories
if not exist "backend\logs" mkdir "backend\logs"
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "docker\mongodb\init" mkdir "docker\mongodb\init"
if not exist "docker\nginx" mkdir "docker\nginx"

echo 📁 Created necessary directories

REM Start development environment
echo 🚀 Starting development environment...
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:3001
echo.
echo To stop the development server, press Ctrl+C
echo.

npm run dev