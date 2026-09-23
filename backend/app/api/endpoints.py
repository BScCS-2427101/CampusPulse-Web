from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional
import pandas as pd
from app.services.cache import DataCache, serialize_for_api
from app.services.data_loader import DataLoader
from app.services.live_simulation import (
    start_simulation, stop_simulation, perform_one_update, 
    reset_dataset, get_status
)
from app.services.data_quality_service import get_data_quality_report

router = APIRouter()
cache = DataCache()

@router.get("/health")
def health_check():
    return {"status": "ok", "message": "CampusPulse Backend is running"}

@router.get("/dataset/summary")
def get_dataset_summary():
    try:
        data = cache.get_data()
        raw = data["raw"]
        summary = {
            "last_updated": data["last_updated"],
            "sheets": list(raw.keys()),
            "rows_count": {k: len(v) for k, v in raw.items()},
            "quality_reports": data["report_lines"]
        }
        return serialize_for_api(summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
def get_dashboard_data():
    try:
        data = cache.get_data()
        raw = data["raw"]
        analytical = data["analytical"]
        
        # Calculate KPIs
        enrollments = raw['Enrollments']
        pass_count = (enrollments['result_status'] == 'Pass').sum()
        pass_pct = (pass_count / len(enrollments)) * 100 if len(enrollments) > 0 else 0
        
        risk_perf = analytical.get('student_risk_analysis')
        academic_risk_count = 0
        if risk_perf is not None and not risk_perf.empty:
            high_risk = risk_perf[risk_perf['academic_risk_level'] == 'High']
            if not high_risk.empty:
                academic_risk_count = int(high_risk['student_count'].iloc[0])
                
        kpis = {
            "total_students": len(raw['Students']['student_id'].unique()),
            "programs": len(raw['Programs']['program_id'].unique()),
            "courses": len(raw['Courses']['course_id'].unique()),
            "enrollments": len(enrollments),
            "avg_score": enrollments['assessment_score'].mean(),
            "avg_attendance": enrollments['attendance_percentage'].mean(),
            "pass_percentage": pass_pct,
            "academic_risk_count": academic_risk_count
        }
        
        # Dashboard charts data (aggregated for smaller payload)
        prog_perf = analytical.get('program_performance', pd.DataFrame())
        avg_score_by_program = prog_perf[['program_name', 'avg_assessment_score']] if not prog_perf.empty else pd.DataFrame()
        
        grade_dist = enrollments['grade'].value_counts().reset_index()
        grade_dist.columns = ['grade', 'count']
        
        trend = analytical.get('trend_data', pd.DataFrame())
        if not trend.empty:
            trend['period'] = trend['enrollment_year'].astype(str) + '-' + trend['enrollment_month'].astype(str).str.zfill(2)
            enrollment_trend = trend[['period', 'enrollment_count']]
        else:
            enrollment_trend = pd.DataFrame()
            
        # Sampling scatter plot data to avoid large payloads, or sending pre-binned data
        # For simplicity, sending a sample of 200 points for attendance vs score
        scatter_sample = enrollments[['attendance_percentage', 'assessment_score']].sample(min(200, len(enrollments)))
        
        return serialize_for_api({
            "last_updated": data["last_updated"],
            "kpis": kpis,
            "charts": {
                "avg_score_by_program": avg_score_by_program,
                "grade_distribution": grade_dist,
                "enrollment_trend": enrollment_trend,
                "attendance_vs_score": scatter_sample
            }
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from typing import Optional

@router.get("/data-quality")
def api_data_quality():
    try:
        report = get_data_quality_report()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/practical13")
def get_practical13_data(
    program: Optional[str] = None,
    course: Optional[str] = None,
    semester: Optional[str] = None,
    year: Optional[str] = None
):
    try:
        data = cache.get_data()
        analytical = data["analytical"]
        perf = analytical.get('student_course_performance')
        
        if perf is None or perf.empty:
            return {"data": []}
            
        # Get filter options before filtering
        def safe_unique(col):
            return ["All"] + sorted([str(x) for x in perf[col].dropna().unique()]) if col in perf.columns else ["All"]
            
        filter_options = {
            "programs": safe_unique('program_name'),
            "courses": safe_unique('course_name'),
            "semesters": safe_unique('semester'),
            "years": safe_unique('academic_year')
        }
        
        # Apply filters
        df = perf.copy()
        if program and program != "All" and 'program_name' in df.columns:
            df = df[df['program_name'] == program]
        if course and course != "All" and 'course_name' in df.columns:
            df = df[df['course_name'] == course]
        if semester and semester != "All" and 'semester' in df.columns:
            df = df[df['semester'].astype(str) == semester]
        if year and year != "All" and 'academic_year' in df.columns:
            df = df[df['academic_year'].astype(str) == year]
            
        charts = {}
        
        if not df.empty:
            # 1. Avg Assessment Score by Program
            if 'program_name' in df.columns:
                prog_agg = df.groupby('program_name')['assessment_score'].mean().dropna().reset_index()
                charts['avg_score_by_program'] = prog_agg
                
            # 2. Pass Percentage by Course
            if 'course_name' in df.columns:
                df_temp = df.copy()
                df_temp['is_pass'] = (df_temp['result_status'] == 'Pass').astype(int)
                course_pass = df_temp.groupby('course_name').agg(total=('enrollment_id', 'count'), passes=('is_pass', 'sum')).reset_index()
                course_pass['pass_percentage'] = (course_pass['passes'] / course_pass['total']) * 100
                charts['pass_pct_by_course'] = course_pass[['course_name', 'pass_percentage']]
                
            # 3. Assessment Score Trend
            if 'enrollment_year' in df.columns and 'enrollment_month' in df.columns:
                trend_df = df.groupby(['enrollment_year', 'enrollment_month'])['assessment_score'].mean().reset_index()
                if len(trend_df) > 1:
                    trend_df['period'] = trend_df['enrollment_year'].astype(str) + '-' + trend_df['enrollment_month'].astype(str).str.zfill(2)
                    charts['score_trend'] = trend_df[['period', 'assessment_score']]
                else:
                    charts['score_trend'] = []
                    
            # 4. Attendance by Program
            if 'program_name' in df.columns:
                att_agg = df.groupby('program_name')['attendance_percentage'].mean().dropna().reset_index()
                charts['attendance_by_program'] = att_agg
                
            # 5. Attendance vs Assessment Score
            att_df = df[['attendance_percentage', 'assessment_score']].dropna()
            charts['attendance_vs_score'] = att_df.sample(min(500, len(att_df))) if len(att_df) > 0 else []
            
            # 6. Study Hours vs Assessment Score
            if 'study_hours' in df.columns:
                sh_df = df[['study_hours', 'assessment_score']].dropna()
                charts['study_hours_vs_score'] = sh_df.sample(min(500, len(sh_df))) if len(sh_df) > 0 else []
                
            # 7. Course/Semester Heatmap
            if 'course_name' in df.columns and 'semester' in df.columns:
                pivot = df.pivot_table(index='course_name', columns='semester', values='assessment_score', aggfunc='mean')
                heatmap_data = []
                for course_val in pivot.index:
                    for sem_val in pivot.columns:
                        val = pivot.loc[course_val, sem_val]
                        if pd.notna(val):
                            heatmap_data.append({
                                'course_name': course_val,
                                'semester': str(sem_val),
                                'score': val
                            })
                charts['heatmap'] = heatmap_data
                
            # 8. Grade Distribution
            if 'grade' in df.columns:
                grade_counts = df['grade'].value_counts().sort_index().reset_index()
                grade_counts.columns = ['grade', 'count']
                charts['grade_distribution'] = grade_counts
                
            # 9. Credits Attempted vs Earned by Program
            if 'program_name' in df.columns:
                cred_agg = df.groupby('program_name')[['credits_attempted', 'credits_earned']].sum().reset_index()
                charts['credits_comparison'] = cred_agg
                
        # Handle credit anomalies message
        anomalies = (df['credits_earned'] > df['credits_attempted']).sum() if not df.empty else 0
        
        return serialize_for_api({
            "last_updated": data["last_updated"],
            "filter_options": filter_options,
            "charts": charts,
            "anomalies": int(anomalies)
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/practical14")
def get_practical14_data(
    program: Optional[str] = None,
    risk: Optional[str] = None,
    year: Optional[str] = None,
    res: Optional[str] = None,
    schol: Optional[str] = None
):
    try:
        data = cache.get_data()
        analytical = data["analytical"]
        perf = analytical.get('student_course_performance')
        
        if perf is None or perf.empty:
            return {"data": []}
            
        df = perf.copy()
        
        if 'scholarship_status' in df.columns:
            df['scholarship_status'] = df['scholarship_status'].fillna("Not Specified")
            
        # Get filter options before filtering
        def safe_unique(col):
            return ["All"] + sorted([str(x) for x in df[col].dropna().unique()]) if col in df.columns else ["All"]
            
        filter_options = {
            "programs": safe_unique('program_name'),
            "risks": safe_unique('academic_risk_level'),
            "years": safe_unique('year_of_study'),
            "residencies": safe_unique('residency'),
            "scholarships": safe_unique('scholarship_status')
        }
        
        # Apply filters
        if program and program != "All" and 'program_name' in df.columns:
            df = df[df['program_name'] == program]
        if risk and risk != "All" and 'academic_risk_level' in df.columns:
            df = df[df['academic_risk_level'] == risk]
        if year and year != "All" and 'year_of_study' in df.columns:
            df = df[df['year_of_study'].astype(str) == year]
        if res and res != "All" and 'residency' in df.columns:
            df = df[df['residency'] == res]
        if schol and schol != "All" and 'scholarship_status' in df.columns:
            df = df[df['scholarship_status'] == schol]
            
        charts = {}
        
        if not df.empty:
            df_students = df.drop_duplicates(subset=['student_id'])
            
            # 1. Academic Risk Distribution
            if 'academic_risk_level' in df_students.columns:
                risk_counts = df_students['academic_risk_level'].value_counts().reset_index()
                risk_counts.columns = ['risk_level', 'count']
                charts['risk_distribution'] = risk_counts
                
            # 2. Residency Distribution
            if 'residency' in df_students.columns:
                res_counts = df_students['residency'].value_counts().reset_index()
                res_counts.columns = ['residency', 'count']
                charts['residency_distribution'] = res_counts
                
            # 3. Scholarship Distribution
            if 'scholarship_status' in df_students.columns:
                schol_counts = df_students['scholarship_status'].value_counts().reset_index()
                schol_counts.columns = ['scholarship', 'count']
                charts['scholarship_distribution'] = schol_counts
                
            # 4. Engagement by Risk Level
            if 'academic_risk_level' in df.columns and 'engagement_score' in df.columns:
                eng_agg = df.groupby('academic_risk_level')['engagement_score'].mean().dropna().reset_index()
                charts['engagement_by_risk'] = eng_agg
                
            # 5. LMS Logins vs Assessment Score
            if 'lms_logins' in df.columns and 'assessment_score' in df.columns:
                lms_df = df[['lms_logins', 'assessment_score']].dropna()
                charts['lms_vs_score'] = lms_df.sample(min(500, len(lms_df))) if len(lms_df) > 0 else []
                
            # 6. Library Visits vs Assessment Score
            if 'library_visits' in df.columns and 'assessment_score' in df.columns:
                lib_df = df[['library_visits', 'assessment_score']].dropna()
                charts['library_vs_score'] = lib_df.sample(min(500, len(lib_df))) if len(lib_df) > 0 else []
                
            # 7. Video Learning vs Assessment Score
            if 'video_minutes' in df.columns and 'assessment_score' in df.columns:
                vid_df = df[['video_minutes', 'assessment_score']].dropna()
                charts['video_vs_score'] = vid_df.sample(min(500, len(vid_df))) if len(vid_df) > 0 else []
                
            # 8. Study Hours by Segment
            if 'study_hours' in df.columns:
                hours = df['study_hours'].dropna()
                if len(hours.unique()) > 3:
                    import numpy as np
                    p25, p50, p75 = np.percentile(hours, [25, 50, 75])
                    def get_segment(x):
                        if x <= p25: return 'Low'
                        elif x <= p50: return 'Mod-Low'
                        elif x <= p75: return 'Mod-High'
                        else: return 'High'
                    
                    df_temp = df.copy()
                    df_temp['study_segment'] = df_temp['study_hours'].apply(get_segment)
                    seg_order = ['Low', 'Mod-Low', 'Mod-High', 'High']
                    seg_counts = df_temp['study_segment'].value_counts().reindex(seg_order).fillna(0).reset_index()
                    seg_counts.columns = ['segment', 'count']
                    charts['study_hours_segment'] = seg_counts
                else:
                    charts['study_hours_segment'] = []
                    
            # 9. Attendance vs Assignment Completion
            if 'attendance_percentage' in df.columns and 'assignment_completion_rate' in df.columns:
                att_ass_df = df[['attendance_percentage', 'assignment_completion_rate']].dropna()
                charts['attendance_vs_assignment'] = att_ass_df.sample(min(500, len(att_ass_df))) if len(att_ass_df) > 0 else []

        return serialize_for_api({
            "last_updated": data["last_updated"],
            "filter_options": filter_options,
            "charts": charts
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/practical15")
def get_practical15_data(
    program: Optional[str] = None,
    course: Optional[str] = None,
    year: Optional[str] = None,
    sem: Optional[str] = None
):
    try:
        data = cache.get_data()
        analytical = data["analytical"]
        perf = analytical.get('student_course_performance')
        
        if perf is None or perf.empty:
            return {"data": []}
            
        df = perf.copy()
        
        # Get filter options before filtering
        def safe_unique(col):
            return ["All"] + sorted([str(x) for x in df[col].dropna().unique()]) if col in df.columns else ["All"]
            
        filter_options = {
            "programs": safe_unique('program_name'),
            "courses": safe_unique('course_name'),
            "years": safe_unique('year_of_study'),
            "sems": safe_unique('semester')
        }
        
        # Apply filters
        if program and program != "All" and 'program_name' in df.columns:
            df = df[df['program_name'].astype(str) == program]
        if course and course != "All" and 'course_name' in df.columns:
            df = df[df['course_name'].astype(str) == course]
        if year and year != "All" and 'year_of_study' in df.columns:
            df = df[df['year_of_study'].astype(str) == year]
        if sem and sem != "All" and 'semester' in df.columns:
            df = df[df['semester'].astype(str) == sem]
            
        charts = {}
        
        if not df.empty:
            # Prepare Year-Month
            if 'enrollment_date' in df.columns:
                df['enrollment_date'] = pd.to_datetime(df['enrollment_date'], errors='coerce', dayfirst=True)
                df['Year-Month'] = df['enrollment_date'].dt.to_period('M').astype(str)
                
            trend_df = df.dropna(subset=['Year-Month']).sort_values('Year-Month')
            trend_agg = trend_df.groupby('Year-Month')
            unique_periods = trend_df['Year-Month'].nunique()
            
            # 1. Enrollment Trend
            if unique_periods > 0:
                enroll_trend = trend_agg.size().reset_index()
                enroll_trend.columns = ['period', 'count']
                charts['enrollment_trend'] = enroll_trend
                
            # 2. Assessment Score Trend
            if unique_periods > 1 and 'assessment_score' in trend_df.columns:
                score_trend = trend_agg['assessment_score'].mean().reset_index()
                score_trend.columns = ['period', 'score']
                charts['assessment_score_trend'] = score_trend
                
            # 3. Pass Percentage Trend
            if unique_periods > 1 and 'result_status' in trend_df.columns:
                trend_df_pass = trend_df.copy()
                trend_df_pass['is_pass'] = (trend_df_pass['result_status'] == 'Pass').astype(int)
                pass_trend = (trend_df_pass.groupby('Year-Month')['is_pass'].mean() * 100).reset_index()
                pass_trend.columns = ['period', 'pass_percent']
                charts['pass_percentage_trend'] = pass_trend
                
            # 4. Attendance Trend
            if unique_periods > 1 and 'attendance_percentage' in trend_df.columns:
                att_trend = trend_agg['attendance_percentage'].mean().reset_index()
                att_trend.columns = ['period', 'attendance']
                charts['attendance_trend'] = att_trend
                
            # 5. Credits Earned Trend
            if unique_periods > 1 and 'credits_earned' in trend_df.columns:
                credit_trend = trend_agg['credits_earned'].sum().reset_index()
                credit_trend.columns = ['period', 'credits']
                charts['credits_earned_trend'] = credit_trend
                
            # 6. Enrollment by Program
            if 'program_name' in df.columns:
                prog_counts = df['program_name'].value_counts().sort_values(ascending=False).reset_index()
                prog_counts.columns = ['program', 'count']
                charts['enrollment_by_program'] = prog_counts
                
            # 7. Enrollment by Course
            if 'course_name' in df.columns:
                course_counts = df['course_name'].value_counts().sort_values(ascending=True).reset_index()
                course_counts.columns = ['course', 'count']
                charts['enrollment_by_course'] = course_counts
                
            # 8. Monthly Enrollment
            if 'enrollment_date' in df.columns:
                df_monthly = df.copy()
                df_monthly['Month'] = df_monthly['enrollment_date'].dt.month_name()
                months_order = ['January', 'February', 'March', 'April', 'May', 'June', 
                                'July', 'August', 'September', 'October', 'November', 'December']
                month_counts = df_monthly['Month'].value_counts().reindex(months_order).fillna(0).reset_index()
                month_counts.columns = ['month', 'count']
                charts['monthly_enrollment'] = month_counts
                
            # 9. Enrollment Forecast
            if unique_periods >= 3:
                import numpy as np
                enroll_trend = trend_agg.size()
                x_vals = np.arange(len(enroll_trend))
                y_vals = enroll_trend.values
                
                horizon = 3
                forecast_x = np.arange(len(enroll_trend), len(enroll_trend) + horizon)
                
                if unique_periods >= 4:
                    method = "Linear Regression"
                    slope, intercept = np.polyfit(x_vals, y_vals, 1)
                    forecast_y = slope * forecast_x + intercept
                else:
                    method = "Simple Moving Average"
                    sma = np.mean(y_vals[-2:])
                    forecast_y = np.full(horizon, sma)
                    
                # Format dates
                last_date = pd.to_datetime(enroll_trend.index[-1])
                # Note: original implementation uses pd.DateOffset(months=i).
                # We need to compute the period labels properly.
                future_dates = [last_date + pd.DateOffset(months=i) for i in range(1, horizon + 1)]
                future_labels = [d.strftime('%Y-%m') for d in future_dates]
                
                forecast_data = []
                # Historical
                for i, period in enumerate(enroll_trend.index):
                    forecast_data.append({
                        "period": period,
                        "historical": int(y_vals[i]),
                        "forecast": None
                    })
                # Add the connection point (last historical is also first forecast for plotting continuity)
                # But in Recharts, it's easier to just have the last historical point have BOTH values or just keep them separate lines connected.
                # Actually, setting the forecast value of the last historical point ensures connected lines.
                forecast_data[-1]["forecast"] = int(y_vals[-1])
                
                # Forecast
                for i, period in enumerate(future_labels):
                    forecast_data.append({
                        "period": period,
                        "historical": None,
                        "forecast": float(forecast_y[i])
                    })
                
                charts['enrollment_forecast'] = {
                    "method": method,
                    "horizon": horizon,
                    "data": forecast_data
                }

        return serialize_for_api({
            "last_updated": data["last_updated"],
            "filter_options": filter_options,
            "charts": charts
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/live/status")
def get_live_status():
    return get_status()

def require_admin(x_role: Optional[str] = Header(None)):
    if x_role != "Admin":
        raise HTTPException(status_code=403, detail="Simulation controls require Admin role.")
    return True

@router.post("/live/start")
async def api_live_start(interval_ms: int = 10000, x_role: Optional[str] = Header(None)):
    require_admin(x_role)
    start_simulation(interval_ms)
    return {"message": "Simulation started."}

@router.post("/live/stop")
async def api_live_stop(x_role: Optional[str] = Header(None)):
    require_admin(x_role)
    stop_simulation()
    return {"message": "Simulation stopped."}

@router.post("/live/update")
def api_live_update(x_role: Optional[str] = Header(None)):
    require_admin(x_role)
    try:
        log = perform_one_update()
        return {"message": "Update performed.", "log": log.dict() if log else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/live/reset")
async def api_live_reset(x_role: Optional[str] = Header(None)):
    require_admin(x_role)
    try:
        reset_dataset()
        return {"status": "success", "message": "Live dataset reset to original baseline"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
