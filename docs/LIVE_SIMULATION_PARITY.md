# Live Simulation Parity Validation Record

This document records the cross-version functional and analytical parity validation between the original CampusPulse Desktop Version and the new CampusPulse_Web Version regarding the Live Data Simulation engine.

## Live Simulation Flow

| Metric/Rule | Desktop Version | Web Version | Status |
| --- | --- | --- | --- |
| Simulation State Engine | Handled via Tkinter `.after()` loop updating `CampusPulse_Live_Data.xlsx` | Handled via Python `asyncio` Task loop updating `CampusPulse_Live_Data.xlsx` | Validated |
| Data Read/Write Core | `openpyxl.load_workbook` modifying single records randomly | `openpyxl.load_workbook` modifying single records randomly | Validated |
| Interval Selector | 5s, 10s, 30s | 5s, 10s, 30s | Validated |
| Target Selection | Randomized across `Enrollments` & `Learning_Activity` | Randomized across `Enrollments` & `Learning_Activity` | Validated |
| Bounding Logic (Percentages) | `+ random.randint(-5, 5)` clamped to `(0, 100)` | `+ random.randint(-5, 5)` clamped to `(0, 100)` | Validated |
| Bounding Logic (Floats) | `+ random.uniform(-0.5, 0.5)` clamped to `(0.0, 10.0)` | `+ random.uniform(-0.5, 0.5)` clamped to `(0.0, 10.0)` | Validated |
| Bounding Logic (Counts) | `+ random.randint(-2, 3)` minimum `0` | `+ random.randint(-2, 3)` minimum `0` | Validated |

## Cache Invalidation & Update Loop

| Metric/Rule | Desktop Version | Web Version | Status |
| --- | --- | --- | --- |
| Cache Handling | Rebuilds local Python memory arrays | In-memory `DataCache` singleton executes `.invalidate()` -> `get_data()` rebuilding Pandas analytics | Validated |
| Dashboard Refresh | Calls `refresh_data()` forcing Tkinter components to redraw | Global React Polling checks `/api/live/status` triggering cascading React renders dynamically without browser refresh via `globalCacheTimestamp` React Context | Validated |

## Authorization Matrix

| Rule | Viewer Role | Admin Role | Enforced |
| --- | --- | --- | --- |
| Start/Stop Simulation | Denied (Buttons disabled & blocked) | Allowed | Validated (Backend 403 test confirmed) |
| Simulate One Update | Denied (Buttons disabled & blocked) | Allowed | Validated (Backend 403 test confirmed) |
| Reset Live Dataset | Denied (Buttons disabled & blocked) | Allowed | Validated (Backend 403 test confirmed) |
| View Log/Status | Allowed | Allowed | Validated |

## Reset Live Dataset Parity

The application ensures the `CampusPulse_Academic_Dataset_Original.xlsx` acts strictly as a read-only mirror. Upon `Reset Live Dataset` execution, a byte-for-byte `shutil.copy2` overrides the `CampusPulse_Live_Data.xlsx`, ensuring analytical parity is returned perfectly to baseline states. Test coverage (`test_backend.py::test_live_dataset_reset`) confirms SHA-256 equivalence.
