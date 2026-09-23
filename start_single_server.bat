@echo off
echo ========================================================
echo        CampusPulse Web - Local Production Test
echo ========================================================
echo.
echo Starting FastAPI Backend (which now serves the React Build)...
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
