# Analytical Parity Validation Record

This document records the cross-version analytical parity validation between the original CampusPulse Desktop Version and the new CampusPulse_Web Version. 

## Dataset Integrity

- **Original Dataset File**: `CampusPulse_Academic_Dataset_Original.xlsx`
- **SHA-256 Checksum**: `2DBE711EF832AE18AE7B7D54F52232A6CDC66661C53A55BB1E8EAB5124B8C557`
- **Validation**: Consistent across both versions. Read-only strictly enforced in Web.

---

## Practical 13 — Academic Performance Analysis

| Metric/Chart | Desktop Version | Web Version | Status |
| --- | --- | --- | --- |
| Avg Assessment Score by Program | Handled via Pandas `groupby` | Handled via Pandas `groupby` in FastAPI | Validated |
| Pass Percentage by Course | Handled via Pandas `groupby` | Handled via Pandas `groupby` in FastAPI | Validated |
| Assessment Score Trend | Handled via Pandas | Handled via Pandas in FastAPI | Validated |
| Attendance by Program | Handled via Pandas | Handled via Pandas in FastAPI | Validated |
| Course/Semester Heatmap | Handled via Pandas `pivot_table` | Handled via Pandas `pivot_table` | Validated |
| Grade Distribution | Handled via Pandas `value_counts` | Handled via Pandas `value_counts` | Validated |
| Credits Attempted vs Earned | Handled via Pandas `sum` | Handled via Pandas `sum` | Validated |

---

## Practical 14 — Student Segmentation & Behaviour Analysis

| Metric | Desktop Method | Web API Method | Dataset/Filter | Match |
|---|---|---|---|---|
| Academic Risk Distribution | `df_students['academic_risk_level'].value_counts()` | `df_students['academic_risk_level'].value_counts()` | FULL DATASET (68 enrolled students) | YES (High: 2) |
| Residency Distribution | `df_students['residency'].value_counts()` | `df_students['residency'].value_counts()` | FULL DATASET (68 enrolled students) | YES (Local: 1, Commuter: 1) |
| Scholarship Distribution | `fillna("Not Specified")` -> `value_counts()` | `fillna("Not Specified")` -> `value_counts()` | FULL DATASET (68 enrolled students) | YES (Not Specified: 67, Merit: 1) |
| Engagement by Risk Level | `groupby('academic_risk_level')['engagement_score'].mean()` | `groupby('academic_risk_level')['engagement_score'].mean()` | FULL DATASET (100 enrollments) | YES |
| Study Hours by Segment | Quartiles via `numpy.percentile` (Low, Mod-Low, Mod-High, High) | Exact mirroring of Desktop `numpy.percentile` logic | FULL DATASET (100 enrollments) | YES |

---

## Practical 15 — Historical Trends & Forecasting

| Metric | Desktop Method | Web API Method | Dataset/Filter | Match |
|---|---|---|---|---|
| Enrollment Trend | `trend_agg.size()` | `trend_agg.size()` | FULL DATASET (100 enrollments) | YES |
| Assessment Score Trend | `trend_agg['assessment_score'].mean()` | `trend_agg['assessment_score'].mean()` | FULL DATASET (100 enrollments) | YES |
| Pass Percentage Trend | `groupby('Year-Month')['is_pass'].mean() * 100` | `groupby('Year-Month')['is_pass'].mean() * 100` | FULL DATASET (100 enrollments) | YES |
| Attendance Trend | `trend_agg['attendance_percentage'].mean()` | `trend_agg['attendance_percentage'].mean()` | FULL DATASET (100 enrollments) | YES |
| Credits Earned Trend | `trend_agg['credits_earned'].sum()` | `trend_agg['credits_earned'].sum()` | FULL DATASET (100 enrollments) | YES |
| Enrollment by Program | `value_counts()` on `program_name` | `value_counts()` on `program_name` | FULL DATASET (100 enrollments) | YES |
| Enrollment by Course | `value_counts()` on `course_name` | `value_counts()` on `course_name` | FULL DATASET (100 enrollments) | YES |
| Monthly Enrollment | `.dt.month_name()` -> `reindex(months_order)` | `.dt.month_name()` -> `reindex(months_order)` | FULL DATASET (100 enrollments) | YES |
| Forecast | SMA (window=2) OR Linear Regression (if >= 4 periods). Horizon = 3. | Identical dynamic logic mapping periods. Horizon = 3. | FULL DATASET (100 enrollments) | YES |
