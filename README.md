# CampusPulse Web - Presentation Edition

## 1. Project Title & Purpose
**CampusPulse Web** is a comprehensive educational data analytics platform designed for academic demonstration. The purpose of this project is to provide a modern, web-based presentation interface that mirrors the analytical capabilities of the standalone desktop CampusPulse application, equipped with a dynamic Live Simulation layer for interactive demonstrations.

## 2. Main Features
- **Interactive Dashboards**: Deep insights spanning Academic Performance (Practical 13), Student Risk (Practical 14), and Historical Trends/Forecasting (Practical 15).
- **Live Data Simulation**: Real-time administrative controls to mimic live university database updates and watch the React UI dynamically respond.
- **Storytelling Mode**: An 8-stage guided academic presentation for seamless projector demonstrations.
- **Data Quality Module**: Real-time integrity validation against the live simulated dataset.
- **Export Center**: Securely extract currently-filtered metrics to PNG, PDF, CSV (ZIP), and XLSX formats.

## 3. Technology Stack
- **Frontend**: React 18, Vite, React Router, Recharts, Lucide-React.
- **Backend**: Python, FastAPI, Pandas, Uvicorn, OpenPyXL.
- **Data Persistence**: In-memory `DataCache` layered over `.xlsx` files.

## 4. Project Structure
The web application is completely isolated from the original desktop environment.
```text
CampusPulse_Web/
├── backend/            # FastAPI python application
│   ├── app/            # Core routing and logic
│   ├── data/           # Safe copy of analytical baseline & live datasets
│   └── tests/          # Pytest suite
├── frontend/           # Vite + React interface
│   ├── src/pages/      # Individual UI modules (Dashboard, Practicals, Live, etc.)
│   └── src/components/ # Shared charts and layout components
├── docs/               # Technical parity and QA reports
├── start_web_app.bat   # 1-click bootloader
└── stop_web_app.bat    # 1-click shutdown script
```

## 5. Installation & Setup
1. **Backend**:
   - `cd backend`
   - `pip install fastapi uvicorn pandas openpyxl pytest`
2. **Frontend**:
   - `cd frontend`
   - `npm install`

## 6. Startup Instructions
For normal presentations, double-click `start_web_app.bat` from the `CampusPulse_Web` folder.
This will autonomously launch both the frontend and backend servers.

**Default Local URLs:**
- Web Interface: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- API Backend: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)

## 7. Login / Role Behavior
The application supports a zero-friction simulated authorization toggle in the top-right Header:
- **Viewer**: Read-only access to Dashboards, Storytelling, and Exports.
- **Admin**: Elevated privileges. Capable of mutating the Live Dataset via the `/live` page to simulate database shifts.

## 8. Simulation & Reset Instructions
**To run a simulation (Admin only):**
1. Open the **Live Data Simulation** page from the sidebar.
2. Select your desired update interval (e.g., 5 seconds) and click **Start Simulation**, or use **Simulate One Update** for precise control.
3. Observe live metric adjustments across the dashboards.

**To reset the demo:**
1. Navigate to the **Live Data Simulation** page.
2. Click **Reset Live Dataset** to instantly truncate all mutated records and restore exact mathematical baselines.

## 9. Export & Storytelling Instructions
- **Export Center**: Click the Export icon in the sidebar to securely download current layouts and underlying CSV tables.
- **Storytelling**: Click the Presentation icon. Enter "Presentation Mode" to maximize the screen for a projector. Use left/right arrow keys or on-screen buttons to cycle through the 8 sequential analytical stages.

## 10. Data Quality Functionality
Found under the "Data Quality" tab, this module continuously audits the Live Dataset, identifying anomalies like missing scholarship statuses or mismatched credit completions, proving dataset vigilance dynamically.

## 11. Desktop vs. Web Separation
**CRITICAL**: This web application is entirely isolated from the legacy `CampusPulse` desktop project. 

## 12. Original Dataset Protection
The **Original Dataset** (`CampusPulse_Academic_Dataset_Original.xlsx`) is strictly **read-only** and completely shielded from modification. All administrative mutations take place exclusively on the isolated `CampusPulse_Live_Data.xlsx` file.

## 13. Testing
Execute `pytest tests/` within the `backend/` directory for full structural QA, and `npm run build` in the `frontend/` directory to certify production bundles.

## 14. Known Limitations
- *Browser Automation*: Playwright drivers encounter an Azure CDN 404 in certain automated environments, meaning programmatic PNG/PDF integration tests must be executed manually.
- *Simulation Boundaries*: The live simulation mutates existing rows (shifting grades and attendance) rather than continuously inflating row counts to prevent unbounded memory growth during long presentations.
