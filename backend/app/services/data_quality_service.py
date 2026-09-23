import pandas as pd
from app.services.cache import DataCache

cache = DataCache()

def get_data_quality_report():
    data = cache.get_data()
    raw = data["raw"]
    
    # Safely get dataframes
    students = raw.get('Students', pd.DataFrame())
    programs = raw.get('Programs', pd.DataFrame())
    courses = raw.get('Courses', pd.DataFrame())
    enrollments = raw.get('Enrollments', pd.DataFrame())
    learning = raw.get('Learning_Activity', pd.DataFrame())
    
    report = {
        "dataset": {
            "name": "CampusPulse Live Data",
            "last_updated": data["last_updated"]
        },
        "sheets": {},
        "missing_values": [],
        "duplicates": [],
        "referential_integrity": [],
        "anomalies": [],
        "overall_status": "Valid"
    }
    
    # 1. Sheets Overview
    for sheet_name, df in raw.items():
        report["sheets"][sheet_name] = {
            "rows": len(df),
            "columns": len(df.columns)
        }
        
    has_issues = False
    has_warnings = False
    
    # 2. Missing Values (Focusing on the documented ones and others)
    # The desktop implementation specifically calls out scholarship_status and prerequisite_course.
    missing_schol = students['scholarship_status'].isna().sum() if 'scholarship_status' in students else 0
    if missing_schol > 0:
        report["missing_values"].append({
            "sheet": "Students",
            "column": "scholarship_status",
            "count": int(missing_schol),
            "status": "Warning"
        })
        has_warnings = True

    missing_prereq = courses['prerequisite_course'].isna().sum() if 'prerequisite_course' in courses else 0
    if missing_prereq > 0:
        report["missing_values"].append({
            "sheet": "Courses",
            "column": "prerequisite_course",
            "count": int(missing_prereq),
            "status": "Warning"
        })
        has_warnings = True
        
    # Check general missing values to match data_validator.py behavior
    for sheet_name, df in raw.items():
        missing = df.isnull().sum()
        missing = missing[missing > 0]
        for col, count in missing.items():
            if (sheet_name == "Students" and col == "scholarship_status") or \
               (sheet_name == "Courses" and col == "prerequisite_course"):
                continue # Already handled
            report["missing_values"].append({
                "sheet": sheet_name,
                "column": col,
                "count": int(count),
                "status": "Warning"
            })
            has_warnings = True
            
    # 3. Duplicate IDs
    id_columns = {
        'Students': 'student_id',
        'Programs': 'program_id',
        'Courses': 'course_id',
        'Enrollments': 'enrollment_id',
        'Learning_Activity': 'activity_id'
    }
    
    for sheet_name, id_col in id_columns.items():
        if sheet_name in raw and id_col in raw[sheet_name].columns:
            dups = raw[sheet_name].duplicated(subset=[id_col]).sum()
            if dups > 0:
                report["duplicates"].append({
                    "sheet": sheet_name,
                    "id_column": id_col,
                    "count": int(dups),
                    "status": "Issue"
                })
                has_issues = True
            else:
                report["duplicates"].append({
                    "sheet": sheet_name,
                    "id_column": id_col,
                    "count": 0,
                    "status": "Valid"
                })

    # 4. Referential Integrity
    def check_fk(child_df, child_col, parent_df, parent_col, name):
        if child_df.empty or parent_df.empty:
            return
        if child_col not in child_df.columns or parent_col not in parent_df.columns:
            return
        orphans = child_df[~child_df[child_col].isin(parent_df[parent_col])]
        orphan_count = len(orphans)
        if orphan_count > 0:
            report["referential_integrity"].append({
                "relationship": name,
                "orphan_count": orphan_count,
                "status": "Issue"
            })
            nonlocal has_issues
            has_issues = True
        else:
            report["referential_integrity"].append({
                "relationship": name,
                "orphan_count": 0,
                "status": "Valid"
            })

    check_fk(enrollments, 'student_id', students, 'student_id', 'Students → Enrollments')
    check_fk(enrollments, 'course_id', courses, 'course_id', 'Courses → Enrollments')
    check_fk(learning, 'student_id', students, 'student_id', 'Students → Learning_Activity')
    check_fk(learning, 'course_id', courses, 'course_id', 'Courses → Learning_Activity')
    check_fk(courses, 'program_id', programs, 'program_id', 'Programs → Courses')

    # 5. Anomalies
    credit_anomalies = 0
    if not enrollments.empty and 'credits_earned' in enrollments.columns and 'credits_attempted' in enrollments.columns:
        credit_anomalies = len(enrollments[enrollments['credits_earned'] > enrollments['credits_attempted']])
    elif not enrollments.empty and 'credits_earned' in enrollments.columns:
        credit_anomalies = len(enrollments[enrollments['credits_earned'] > 100]) # Fallback from desktop logic
        
    if credit_anomalies > 0:
        report["anomalies"].append({
            "sheet": "Enrollments",
            "field": "credits_earned",
            "count": int(credit_anomalies),
            "explanation": "Credits earned > credits attempted",
            "status": "Issue"
        })
        has_issues = True
        
    if has_issues:
        report["overall_status"] = "Issue"
    elif has_warnings:
        report["overall_status"] = "Warning"
    else:
        report["overall_status"] = "Valid"

    return report
