import io
import zipfile
import pandas as pd
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional

from app.services.cache import DataCache
from app.services.data_quality_service import get_data_quality_report

router = APIRouter()
cache = DataCache()

def create_excel_response(data_frames_dict: dict, filename_prefix: str):
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        for sheet_name, df in data_frames_dict.items():
            df.to_excel(writer, sheet_name=sheet_name, index=False)
            
    output.seek(0)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M")
    filename = f"CampusPulse_{filename_prefix}_{timestamp}.xlsx"
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        output, 
        headers=headers,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

def create_csv_response(df: pd.DataFrame, filename_prefix: str):
    output = io.BytesIO()
    df.to_csv(output, index=False)
    output.seek(0)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M")
    filename = f"CampusPulse_{filename_prefix}_{timestamp}.csv"
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        output, 
        headers=headers,
        media_type='text/csv'
    )

def create_csv_zip_response(data_frames_dict: dict, filename_prefix: str):
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        for sheet_name, df in data_frames_dict.items():
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False)
            zip_file.writestr(f"{sheet_name}.csv", csv_buffer.getvalue())
            
    zip_buffer.seek(0)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M")
    filename = f"CampusPulse_{filename_prefix}_{timestamp}.zip"
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        zip_buffer, 
        headers=headers,
        media_type='application/zip'
    )

@router.get("/dataset")
def export_dataset(format: str = 'xlsx'):
    data = cache.get_data()
    raw = data.get("raw", {})
    
    if format == 'xlsx':
        return create_excel_response(raw, "Dataset")
    elif format == 'csv':
        return create_csv_zip_response(raw, "Dataset")
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use xlsx or csv.")

@router.get("/practical13")
def export_practical13(
    format: str = 'xlsx',
    program: Optional[str] = None,
    course: Optional[str] = None,
    semester: Optional[str] = None,
    year: Optional[str] = None
):
    data = cache.get_data()
    perf = data["analytical"].get('student_course_performance', pd.DataFrame())
    df = perf.copy()
    if not df.empty:
        if program and program != "All" and 'program_name' in df.columns:
            df = df[df['program_name'] == program]
        if course and course != "All" and 'course_name' in df.columns:
            df = df[df['course_name'] == course]
        if semester and semester != "All" and 'semester' in df.columns:
            df = df[df['semester'].astype(str) == semester]
        if year and year != "All" and 'academic_year' in df.columns:
            df = df[df['academic_year'].astype(str) == year]

    if format == 'xlsx':
        return create_excel_response({"Practical13": df}, "Practical13")
    elif format == 'csv':
        return create_csv_response(df, "Practical13")
    else:
        raise HTTPException(status_code=400, detail="Invalid format.")

@router.get("/practical14")
def export_practical14(
    format: str = 'xlsx',
    program: Optional[str] = None,
    risk: Optional[str] = None,
    year: Optional[str] = None,
    res: Optional[str] = None,
    schol: Optional[str] = None
):
    data = cache.get_data()
    perf = data["analytical"].get('student_course_performance', pd.DataFrame())
    df = perf.copy()
    if not df.empty:
        if 'scholarship_status' in df.columns:
            df['scholarship_status'] = df['scholarship_status'].fillna("Not Specified")
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

    if format == 'xlsx':
        return create_excel_response({"Practical14": df}, "Practical14")
    elif format == 'csv':
        return create_csv_response(df, "Practical14")
    else:
        raise HTTPException(status_code=400, detail="Invalid format.")

@router.get("/practical15")
def export_practical15(
    format: str = 'xlsx',
    program: Optional[str] = None,
    course: Optional[str] = None,
    year: Optional[str] = None,
    sem: Optional[str] = None
):
    data = cache.get_data()
    perf = data["analytical"].get('student_course_performance', pd.DataFrame())
    df = perf.copy()
    if not df.empty:
        if program and program != "All" and 'program_name' in df.columns:
            df = df[df['program_name'].astype(str) == program]
        if course and course != "All" and 'course_name' in df.columns:
            df = df[df['course_name'].astype(str) == course]
        if year and year != "All" and 'year_of_study' in df.columns:
            df = df[df['year_of_study'].astype(str) == year]
        if sem and sem != "All" and 'semester' in df.columns:
            df = df[df['semester'].astype(str) == sem]
    
    # Calculate forecast
    if 'enrollment_date' in df:
        df_copy = df.copy()
        df_copy['enrollment_date'] = pd.to_datetime(df_copy['enrollment_date'], errors='coerce', dayfirst=True)
        df_copy['Year-Month'] = df_copy['enrollment_date'].dt.to_period('M').astype(str)
        trend_df = df_copy.dropna(subset=['Year-Month']).sort_values('Year-Month')
        trend_agg = trend_df.groupby('Year-Month').size()
        
        forecast_df = pd.DataFrame({'Year-Month': trend_agg.index, 'Historical_Enrollment': trend_agg.values})
        forecast_df['Forecast_Enrollment'] = None
        forecast_df['Method'] = "Historical"
        
        unique_periods = len(trend_agg)
        horizon = 3
        
        if unique_periods >= 3:
            y_vals = trend_agg.values
            import numpy as np
            if unique_periods >= 4:
                x_vals = np.arange(len(y_vals))
                slope, intercept = np.polyfit(x_vals, y_vals, 1)
                forecast_x = np.arange(len(y_vals), len(y_vals) + horizon)
                forecast_y = slope * forecast_x + intercept
                method = "Linear Regression"
            else:
                sma = np.mean(y_vals[-2:])
                forecast_y = np.full(horizon, sma)
                method = "Simple Moving Average"
            
            last_date = pd.to_datetime(trend_agg.index[-1])
            future_dates = [last_date + pd.DateOffset(months=i) for i in range(1, horizon + 1)]
            future_labels = [d.strftime('%Y-%m') for d in future_dates]
            
            new_rows = pd.DataFrame({
                'Year-Month': future_labels,
                'Historical_Enrollment': [None] * horizon,
                'Forecast_Enrollment': forecast_y,
                'Method': [method] * horizon
            })
            forecast_df = pd.concat([forecast_df, new_rows], ignore_index=True)
            
        export_dict = {
            "Historical_Data": df,
            "Forecast": forecast_df
        }
        
        if format == 'xlsx':
            return create_excel_response(export_dict, "Practical15")
        elif format == 'csv':
            # For CSV, zip both
            return create_csv_zip_response(export_dict, "Practical15")
    else:
        if format == 'xlsx':
            return create_excel_response({"Historical_Data": df}, "Practical15")
        elif format == 'csv':
            return create_csv_response(df, "Practical15")

@router.get("/data-quality")
def export_data_quality(format: str = 'xlsx'):
    report = get_data_quality_report()
    
    # Flatten JSON into tabular forms
    sheets_df = pd.DataFrame([
        {"Sheet": k, "Rows": v["rows"], "Columns": v["columns"]} 
        for k, v in report["sheets"].items()
    ])
    missing_df = pd.DataFrame(report["missing_values"]) if report["missing_values"] else pd.DataFrame(columns=["sheet", "column", "count", "status"])
    dupes_df = pd.DataFrame(report["duplicates"]) if report["duplicates"] else pd.DataFrame(columns=["sheet", "id_column", "count", "status"])
    integ_df = pd.DataFrame(report["referential_integrity"]) if report["referential_integrity"] else pd.DataFrame(columns=["relationship", "orphan_count", "status"])
    anom_df = pd.DataFrame(report["anomalies"]) if report["anomalies"] else pd.DataFrame(columns=["sheet", "field", "explanation", "count", "status"])
    
    export_dict = {
        "Sheets": sheets_df,
        "Missing_Values": missing_df,
        "Duplicates": dupes_df,
        "Referential_Integrity": integ_df,
        "Anomalies": anom_df
    }
    
    if format == 'xlsx':
        return create_excel_response(export_dict, "DataQuality")
    elif format == 'csv':
        return create_csv_zip_response(export_dict, "DataQuality")
    else:
        raise HTTPException(status_code=400, detail="Invalid format.")
