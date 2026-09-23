# Storytelling Parity Validation Record

This document records the cross-version functional and validation parity between the original CampusPulse Desktop Version and the new CampusPulse_Web Version regarding the Storytelling module (Phase 9).

## Story Structure Parity

| Stage | Desktop Version (`ui/storytelling.py`) | Web Version (`Storytelling.jsx`) | Parity Status |
| --- | --- | --- | --- |
| 1. Campus Overview | Dashboard KPI display | Uses `/api/dashboard` KPIs | Validated |
| 2. Academic Performance | Average Score by Program, Grade Distribution | Reuses `/api/practical13` charts | Validated |
| 3. Learning Behaviour | Study Hours Segmentation, Attendance vs Score | Reuses `/api/practical13` and `/api/practical14` charts | Validated |
| 4. Student Risk Segmentation | Risk Distribution, Engagement by Risk | Reuses `/api/practical14` charts | Validated |
| 5. Student Analytical Insights | Desktop used a basic Combobox drill-down. | Explicitly requested to use demographic distributions instead (Residency, Scholarship) via `p14`. | **Modified per explicit instruction** |
| 6. Historical Trends | Enrollment Trend, Pass Percentage Trend | Reuses `/api/practical15` trends | Validated |
| 7. Forecasting | Hybrid: SMA (<4) or Linear Regression (>=4) | Accurately graphs and describes the hybrid model from `/api/practical15` | Validated |
| 8. Insights & Actions | Aggregated text-based insights | Evaluates identical KPIs and data quality outputs | Validated |

## Presentation Mode and Navigation
- **Navigation Layout**: Web implementation preserves the exact First/Previous/Next/Last button cluster.
- **Keyboard Navigation**: Implemented seamlessly via standard React event listeners on `window` (Arrow Left/Right, Home, End).
- **Presentation Display**: Desktop leveraged Tkinter `-fullscreen` geometry flags. Web leverages CSS layer manipulations (hiding Sidebar, Header, enabling full-bleed container) avoiding restrictive browser-level Fullscreen API traps that cause pop-up blockings.

## Architectural Notes
- The Web Version uses concurrent API fetching via `Promise.all()` to gather existing datasets natively. It does not reinvent logic on the React layer, maintaining absolute source-of-truth parity with the Pandas backend.
- The `globalCacheTimestamp` mechanism actively propagates updates into the presentation slides without necessitating a hard browser reload, strictly mirroring the desktop behavior.
- **Student Explorer**: As instructed, Student Explorer remains out of scope for Phase 9 and future scope entirely unless otherwise defined. Stage 5 instead visualizes demographic macro-analysis (Residency/Scholarship distributions).
