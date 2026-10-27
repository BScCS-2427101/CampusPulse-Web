# CAMPUSPULSE — FRONTEND DATA CONTRACTS & VISUALIZATION SPECIFICATIONS

**Project Developer:** RAJDEEP M PARAB (Roll No: T101)  
**System:** CampusPulse — Live Academic Analytics, Visualization & Storytelling System

---

## 1. Global API & Connectivity Conventions

- **Base URL Resolution:**
  - Local / Unified Deployment: `/api` (relative)
  - Split Vercel Deployment: `VITE_API_BASE_URL` (e.g., `https://campuspulse-web.onrender.com/api`)
- **Common Envelope Structure:**
  - All analytical endpoints return `{ "last_updated": string, "charts": { ... }, "filter_options": { ... } }`
- **Error States:** Standard HTTP 4xx/5xx with `{ "detail": string }`. Frontend displays retry button.
- **Empty States:** Renders localized `<div className="no-data">No Data</div>` if arrays are empty.

---

## 2. Dashboard (`/dashboard`)
- **Endpoint:** `GET /api/dashboard`
- **Data Contract:**
  - `kpis`:
    - `total_students` (int): Total unique student count (e.g. 100)
    - `programs` (int): Total degree programs (e.g. 100)
    - `courses` (int): Total courses available (e.g. 100)
    - `enrollments` (int): Total enrollment records (e.g. 100)
    - `avg_score` (float): Mean assessment score (0.0–100.0)
    - `avg_attendance` (float): Mean attendance percentage (0.0–100.0)
    - `pass_percentage` (float): Percentage of enrollments with passing status (`is_pass == 1`)
    - `academic_risk_count` (int): Count of active enrollments with High risk status
  - `charts`:
    - `avg_score_by_program`: `[{ program_name: string, avg_assessment_score: float }]`
    - `attendance_vs_score`: `[{ attendance_percentage: float, assessment_score: float }]`
    - `grade_distribution`: `[{ grade: string, count: int }]`
    - `enrollment_trend`: `[{ period: string, count: int }]`

---

## 3. Practical 13 — Academic Performance Analysis (`/practical13`)
- **Endpoint:** `GET /api/practical13?program=&course=&semester=&year=`
- **Filters:** `program` (string), `course` (string), `semester` (string), `year` (string)
- **Charts Specifications:**
  1. **Avg Assessment Score by Program:**
     - Fields: `program_name` (string), `assessment_score` (float)
     - Aggregation: Mean assessment score grouped by `program_name`.
  2. **Pass Percentage by Course:**
     - Fields: `course_name` (string), `pass_percentage` (float)
     - Aggregation: `(passed_enrollments / total_assessed) * 100` grouped by course.
     - Rule: Excludes unassessed records (`pd.notna(assessment_score)`). Pass status: `result_status.isin(['passed', 'pass'])`.
  3. **Assessment Score Trend:**
     - Fields: `period` (string, `YYYY-MM`), `assessment_score` (float)
     - Aggregation: Chronological mean score per period.
  4. **Attendance by Program:**
     - Fields: `program_name` (string), `attendance_percentage` (float)
     - Aggregation: Mean attendance percentage per program.
  5. **Attendance vs Assessment Score:**
     - Fields: `attendance_percentage` (float, 0–100), `assessment_score` (float, 0–100)
     - Visualization: Scatter plot.
  6. **Study Hours vs Assessment Score:**
     - Fields: `study_hours` (float, 0–24), `assessment_score` (float, 0–100)
     - Join: `Learning_Activity` aggregated at `student_id` level merged into `student_course_performance`.
  7. **Course/Semester Heatmap:**
     - Fields: `course_name` (string), `semester` (string), `score` (float)
     - Pivot: Matrix of courses by semesters.
  8. **Grade Distribution:**
     - Fields: `grade` (string: A+, A, B+, B, C, F), `count` (int)
  9. **Credits Attempted vs Earned by Program:**
     - Fields: `program_name` (string), `credits_attempted` (int), `credits_earned` (int)
     - Anomaly Notice: Preserves 29 historical records with `credits_earned > credits_attempted` with transparent notification.

---

## 4. Practical 14 — Student Segmentation & Behaviour Analysis (`/practical14`)
- **Endpoint:** `GET /api/practical14?program=&risk=&year=&res=&schol=`
- **Filters:** `program`, `risk`, `year`, `res`, `schol`
- **Charts Specifications:**
  1. **Academic Risk Distribution:**
     - Fields: `risk_level` (string: Low, Medium, High), `count` (int)
     - Join: Students merged on `student_id` only.
  2. **Residency Distribution:**
     - Fields: `residency` (string: Local, Commuter, Hostel), `count` (int)
  3. **Scholarship Distribution:**
     - Fields: `scholarship` (string: Merit, Need-Based, Athletic, Not Specified), `count` (int)
     - Note: Accurately reflects 52 missing scholarship status records as 'Not Specified'.
  4. **Engagement by Risk Level:**
     - Fields: `academic_risk_level` (string), `engagement_score` (float)
  5. **LMS Logins vs Assessment Score:**
     - Fields: `lms_logins` (int), `assessment_score` (float)
     - Scatter plot populated via student-level activity aggregation.
  6. **Library Visits vs Assessment Score:**
     - Fields: `library_visits` (int), `assessment_score` (float)
  7. **Video Learning vs Assessment Score:**
     - Fields: `video_minutes` (int), `assessment_score` (float)
  8. **Study Hours Segmentation:**
     - Fields: `segment` (string: Low, Mod-Low, Mod-High, High), `count` (int)
  9. **Attendance vs Assignment Completion:**
     - Fields: `attendance_percentage` (float), `assignment_completion_rate` (float)

---

## 5. Practical 15 — Historical Trends & Forecasting (`/practical15`)
- **Endpoint:** `GET /api/practical15?program=&course=&year=&sem=`
- **Filters:** `program`, `course`, `year`, `sem`
- **Charts Specifications:**
  1. **Historical Enrollment Trend:** `period` (string), `count` (int)
  2. **Assessment Score Trend:** `period` (string), `score` (float)
  3. **Pass Percentage Trend:** `period` (string), `pass_percent` (float, calculated via valid status)
  4. **Attendance Trend:** `period` (string), `attendance` (float)
  5. **Credits Earned Trend:** `period` (string), `credits` (int)
  6. **Enrollment by Program:** `program` (string), `count` (int)
  7. **Enrollment by Course:** `course` (string), `count` (int)
  8. **Monthly Enrollment Pattern:** `month` (string), `count` (int)
  9. **Enrollment Forecast:**
     - Fields: `data`: `[{ period: string, historical: int|null, forecast: int|null }]`
     - Metadata: `method` (string: Linear Extrapolation), `horizon` (int: 3)

---

## 6. Storytelling Engine (`/storytelling`)
- **Narrative Stages:**
  - Stage 1: Executive Summary & Cohort Baseline
  - Stage 2: Academic Performance Disparities
  - Stage 3: Attendance, LMS & Digital Study Hours
  - Stage 4: Risk Tier Segmentation
  - Stage 5: Longitudinal Trajectories
  - Stage 6: Predictive Enrollment Horizon
  - Stage 7: Data Quality & Anomalies Audit
  - Stage 8: Strategic Interventions & Recommendations
- **Resilience:** Stage 1 renders immediately. Secondary analytical failures do not block narrative progression.

---

## 7. Live Simulation & Event Log (`/live`)
- **Endpoints:**
  - `GET /api/live/status`: `{ is_running: bool, interval_ms: int, update_count: int, last_update: string, log_entries: LogEntry[] }`
  - `POST /api/live/start?interval_ms=10000`: Starts asynchronous background loop. Requires `X-Role: Admin`.
  - `POST /api/live/stop`: Terminates background loop. Requires `X-Role: Admin`.
  - `POST /api/live/update`: Executes single atomic mutation. Requires `X-Role: Admin`.
  - `POST /api/live/reset`: Atomically restores live workbook from authoritative baseline. Requires `X-Role: Admin`.
