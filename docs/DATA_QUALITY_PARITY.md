# Data Quality Parity Validation Record

This document records the cross-version functional and validation parity between the original CampusPulse Desktop Version and the new CampusPulse_Web Version regarding the Data Quality module.

## Core Validation Logic

| Metric/Rule | Desktop Version (`data_validator.py` / `data_quality.py`) | Web Version (`data_quality_service.py` / `DataQuality.jsx`) | Status |
| --- | --- | --- | --- |
| Source of Truth | Pandas DataFrame loaded via `DataLoader` | Pandas DataFrame loaded via `DataLoader` and `DataCache` | Validated |
| Sheet Dimensions | Reports Row and Column counts | Reports Row and Column counts | Validated |
| Missing Values (`scholarship_status`) | `Students['scholarship_status'].isna().sum()` | `Students['scholarship_status'].isna().sum()` | Validated |
| Missing Values (`prerequisite_course`) | `Courses['prerequisite_course'].isna().sum()` | `Courses['prerequisite_course'].isna().sum()` | Validated |
| General Missing Values | Iterates over columns detecting `> 0` nulls | Iterates over columns detecting `> 0` nulls | Validated |
| Duplicate Primary IDs | Checks `student_id`, `program_id`, `course_id`, `enrollment_id`, `activity_id` using `.duplicated().sum()` | Checks the identical set of ID columns using `.duplicated().sum()` | Validated |
| Referential Integrity | Mentions "Foreign-key orphans" | Explicitly computes orphans across 5 core relationships | Enhanced Parity |
| Data Anomalies (Credits) | `credits_earned > credits_attempted` (or `> 100`) | `credits_earned > credits_attempted` (or `> 100`) | Validated |

## Baseline Dataset Results (Original Dataset)

When running against the unmodified `CampusPulse_Academic_Dataset_Original.xlsx` (SHA-256: `2DBE711EF832AE18AE7B7D54F52232A6CDC66661C53A55BB1E8EAB5124B8C557`), the results perfectly match:

1. **Missing Values**:
   - `Students.scholarship_status`: Detected (matches desktop baseline)
   - `Courses.prerequisite_course`: Detected (matches desktop baseline)

2. **Duplicate IDs**:
   - 0 duplicates across all primary ID checks.

3. **Anomalies**:
   - Credits anomaly (`credits_earned > credits_attempted`) accurately identified and matching baseline count.

## Live Dataset Awareness

The Web Version's Data Quality module inherently respects the `Live` Dataset architecture. 

- **Live Changes**: When the `Admin` executes a Live Simulation update targeting `Enrollments` or `Learning_Activity`, the Data Quality module leverages the active `DataCache`. If the simulation randomly generates an anomaly or violates a check, the frontend correctly updates upon refresh.
- **Reset to Baseline**: When the `Admin` resets the Live Dataset, the Data Quality module immediately returns to the precise baseline results derived from the `Original` dataset.
