@echo off
echo ========================================================
echo        CampusPulse Web Presentation Edition - Startup
echo ========================================================
echo.

echo Starting FastAPI Backend...
cd backend
start "CampusPulse Backend" cmd /c "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
cd ..

echo.
echo Starting React Frontend...
cd frontend
start "CampusPulse Frontend" cmd /c "npm run dev"
cd ..

echo.
echo ========================================================
echo Startup Complete!
echo.
echo Backend API available at: http://127.0.0.1:8000/api
echo Frontend UI available at: http://127.0.0.1:5173
echo.
echo Close the terminal windows to shut down, or run stop_web_app.bat.
echo ========================================================
pause
