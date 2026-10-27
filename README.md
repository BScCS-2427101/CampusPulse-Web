# CampusPulse — Live Academic Analytics, Visualization & Storytelling System

**Project Developer:** RAJDEEP M PARAB  
**Roll Number:** T101  
**Edition:** Web & Cloud Deployment Edition

## 1. Project Overview & Identity
**CampusPulse** is an academic capstone analytics, visualization and storytelling system developed by **RAJDEEP M PARAB (Roll No: T101)**. It provides deep analytical insights across student academic achievement, attendance patterns, learning behaviors, demographic risk segmentation, longitudinal trends, and forward-looking enrollment estimations, coupled with an active Live Data Simulation engine.

## 2. Core Capabilities
- **Executive Dashboard**: High-level institutional KPIs, program performance, attendance correlations, and enrollment distributions.
- **Practical 13 (Academic Performance)**: 9 comprehensive charts including course pass rates, program averages, assessment trends, attendance scatter, study hours correlation, course-semester heatmaps, grade distributions, and attempted vs earned credits.
- **Practical 14 (Student Segmentation & Behaviour)**: 9 behavioural analytics modules covering academic risk tiers (Low, Medium, High), residency, scholarship allocations, LMS logins, library visits, video engagement minutes, and study hour bands.
- **Practical 15 (Historical Trends & Forecasting)**: 9 longitudinal trend visualizations including chronological pass rates, enrollment shifts, attendance patterns, and statistical enrollment forecasts with documented confidence boundaries.
- **Storytelling Portal**: 8 guided executive presentation stages with progressive loading, presentation "Projector Mode", and keyboard navigation.
- **Data Quality Assurance**: Real-time schema validation, referential integrity auditing, missing field detection, and historical anomaly tracking (29 credit anomalies preserved transparently).
- **Live Data Simulation**: Administrative mutation engine with bounded adjustments and safe baseline reset.
- **Export Centre**: High-fidelity export generation for PDF, PNG, XLSX, and multi-sheet CSV (ZIP) archives.
- **About the Project**: Full capstone documentation portal detailing problem statement, technology stack, data persistence architecture, and developer credits.

## 3. Technology Stack
- **Frontend**: React 18, Vite, React Router, Recharts, Lucide-React.
- **Backend**: Python 3.11+, FastAPI, Pandas, Uvicorn, OpenPyXL.
- **Persistence Model**: Dual-dataset architecture with authoritative immutable original baseline (`CampusPulse_Academic_Dataset_Original.xlsx`) and an isolated, mutable working dataset (`CampusPulse_Live_Data.xlsx`).

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

## 14. Cloud Deployment Architecture
### A. Render (Unified Web Service or Dedicated Backend)
- **Service Name:** `campuspulse-web`
- **Build Command:** `./build.sh` (builds frontend with `npm run build` and installs backend dependencies)
- **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Persistent Storage:** Attach a 1 GB persistent disk mounted at `/var/data` with environment variable `PERSISTENT_DATA_DIR=/var/data` (optional on paid tier; falls back gracefully to local storage).
- **CORS Configuration:** `CORS_ORIGINS=https://campuspulse.vercel.app,http://localhost:5173`

### B. Vercel (Independent React Frontend)
- **Framework Preset:** Vite
- **Root Directory:** `CampusPulse_Web/frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_BASE_URL=https://campuspulse-web.onrender.com/api`
- **Routing:** Handled automatically via `frontend/vercel.json` SPA rewrite rules.

## 15. Known Limitations
- *Free-Tier Cold Starts*: Render free instances spin down after 15 minutes of inactivity; initial requests take 30–50s while waking.
- *Data Anomalies*: 29 records in the original workbook have `credits_earned > credits_attempted`; these are preserved as genuine historical anomalies and flagged in the Data Quality module.

