# Export Parity & Architecture Documentation

## Overview
Phase 10 (Export Center) introduces a fully integrated export layer to CampusPulse Web without altering the core analytical logic or the original standalone desktop application. The export module bridges the existing frontend visualizations with the backend's `DataCache` and `Live Simulation` state.

## Architecture

1. **Frontend Export Interface (`Exports.jsx`)**
   - Connects to the React Router context to fetch the `globalCacheTimestamp` allowing it to read the live dataset state.
   - For **Structured Data (CSV/Excel)**: Dispatches GET requests directly to the FastAPI backend (`/api/exports/*`). 
   - For **Visual Exports (PNG/PDF)**: Mounts a temporary, hidden-but-dimensionally-accurate `MockRouter` wrapper containing the requested dashboard component. It leverages `html2canvas` and `jsPDF` to capture the DOM structure after data finishes loading.

2. **Backend Export Endpoints (`export_endpoints.py`)**
   - Read-only FastAPI routes return raw or filtered `pandas` dataframes.
   - Retrieves the live dataset directly from `DataCache`, ensuring parity with the data used for on-screen charts.
   - Uses `openpyxl` to build native Multi-sheet Excel exports.
   - Uses `zipfile` and `io` buffers for serving multi-sheet CSVs as a single `.zip` file download.

## Parity Guarantee

- **No Recalculation:** The export functions explicitly invoke the same pandas dataframes computed in Phase 3–6. The export layer solely manages filtering and formatting.
- **Original Dataset Protection:** Exports strictly rely on the backend's active memory (`DataCache.get_data()`), which natively protects the immutable baseline dataset (SHA-256: `2DBE711EF832AE18AE7B7D54F52232A6CDC66661C53A55BB1E8EAB5124B8C557`).
- **Storytelling Accuracy:** To guarantee the correct 8-stage export order for Storytelling, `Storytelling.jsx` was enhanced to support a `forceStage` prop. The export script iteratively renders each of the 8 stages, capturing them into a landscape `1200x800` jsPDF sequence.
- **Visual Accuracy:** The hidden rendering container (`#ffffff` background) preserves Recharts DOM layouts (without `display: none` issues) to maintain 1:1 pixel parity with what users see.

## Supported Formats

- **Live Dataset**: Multi-sheet Excel (.xlsx), ZIP of CSVs.
- **Dashboard / P13 / P14 / P15 / Data Quality**: Excel (.xlsx), CSV, PNG, PDF.
- **Storytelling**: PNG (Current Stage), PDF (Complete 8-stage Sequence).

## Verification Checks Passed
- [x] Backend routes pass `pytest` structural validation (`content-type` matches).
- [x] React `npm run build` completed without errors.
- [x] Export endpoints do not introduce any side-effects to memory.
- [x] Admin vs. Viewer role simulation boundaries are respected (exports read simulation data securely).
