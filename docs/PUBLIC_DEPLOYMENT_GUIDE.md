# CampusPulse Web - Public Deployment Guide

This guide details how to deploy the single-server CampusPulse Web application to a free hosting platform like Render.com for public academic demonstrations.

## 1. GitHub Repository Setup
1. Create a new, free repository on GitHub.
2. Push the entire `CampusPulse_Web` folder to this repository.
   - Do NOT push the original standalone desktop project files.

## 2. Render Configuration
The project includes a `render.yaml` configuration file for automatic deployment. 
1. Log into [Render.com](https://render.com).
2. Go to **Blueprints** (or create a new Web Service directly from your GitHub repository).
3. Connect your repository. Render will automatically detect the settings from `render.yaml`.

## 3. Build Command
Render will execute the included `build.sh` script, which does the following:
- Installs Node modules and runs `npm run build` to generate the Vite production static files.
- Installs Python backend packages via `pip install -r requirements.txt`.

## 4. Start Command
Once built, Render will start the FastAPI backend serving both the API and the React production build on the assigned port:
`cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 5. Health Check
Render expects a health check to know when the service is fully running.
- **Path**: `/api/health`
- **Expected Status**: 200 OK

## 6. Environment Variables
- `PORT`: Automatically assigned by Render.
- `PYTHON_VERSION`: Fixed to `3.11.0` in `render.yaml`.

## 7. Public URL Location
Once deployed, Render will provide a public link (e.g., `https://campuspulse-web.onrender.com`). You can visit this single URL to access both the React dashboard and the underlying APIs.

## 8. Free-Tier Sleep Limitation
**IMPORTANT:** If you are using Render's free tier, the web service will "sleep" after 15 minutes of inactivity. 
- The first time you (or your audience) open the link after it sleeps, it may take **up to 50 seconds** to wake up.
- *Best Practice*: Open the public URL a few minutes *before* your presentation begins to wake the service.

## 9. Live Dataset Persistence Limitation
The "Live Simulation" relies on mutating `CampusPulse_Live_Data.xlsx`.
- In a cloud environment like Render, the filesystem is **ephemeral**.
- If the service restarts or goes to sleep, any simulated changes to the Live Dataset will be lost, and it will automatically restore from the Original Dataset baseline when it wakes up.
- This is perfectly suited for temporary academic demonstrations.

## 10. Original Dataset Protection
The deployment strictly isolates and protects the Original Dataset.
- The `CampusPulse_Academic_Dataset_Original.xlsx` file remains entirely read-only and is never modified during simulations or exports.
- Original SHA-256 remains locked: `2DBE711EF832AE18AE7B7D54F52232A6CDC66661C53A55BB1E8EAB5124B8C557`.

## 11. Admin / Viewer Behavior
The authorization rules remain unchanged on the public web:
- **Viewers** can navigate dashboards, read analytics, and use exports, but receive HTTP 403 blocks if they try to mutate the Live Dataset.
- **Admins** have access to the Live Simulation interface to mimic dataset shifts.

## 12. Troubleshooting
- **Blank Screen**: Ensure `npm run build` ran successfully and `frontend/dist/index.html` exists. FastAPI is configured to serve this directory dynamically.
- **API Errors**: Ensure you aren't using hardcoded `localhost` URLs in `frontend/src/services/api.js`. It must be relative (`/api`).

## 13. Local Fallback Procedure
If public deployment fails during your demonstration, use the bundled single-server fallback:
- Run `start_single_server.bat`.
- Open `http://127.0.0.1:8000`.
