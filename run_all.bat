@echo off
title SafeSight AI Launcher
echo ========================================================
echo        SAFESIGHT AI - INDUSTRIAL SAFETY SYSTEM
echo ========================================================
echo.
echo Starting Python AI Engine & Flask Backend on port 5000...
start "SafeSight Backend (Port 5000)" cmd /k "python backend/app.py"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo Starting React + Tailwind Dashboard on port 3000...
start "SafeSight Dashboard (Port 3000)" cmd /k "npm run dev"

echo Opening SafeSight AI Dashboard in browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo SafeSight AI is now running!
echo Dashboard: http://localhost:3000
echo API Backend: http://localhost:5000
echo.
pause
