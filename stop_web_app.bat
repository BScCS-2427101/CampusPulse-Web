@echo off
echo ========================================================
echo        CampusPulse Web Presentation Edition - Shutdown
echo ========================================================
echo.

echo Terminating Frontend (npm / vite)...
taskkill /F /IM node.exe /T >nul 2>&1

echo Terminating Backend (python / uvicorn)...
for /f "tokens=5" %%a in ('netstat -aon ^| find "8000" ^| find "LISTENING"') do taskkill /F /PID %%a /T >nul 2>&1

echo.
echo Shutdown Complete.
echo ========================================================
pause
