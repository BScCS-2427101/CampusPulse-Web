import requests
import zipfile
import io
import pandas as pd
import json

BASE_URL = "http://127.0.0.1:8000/api/exports"

def test_xlsx():
    print("Testing XLSX export...")
    # Dataset
    r = requests.get(f"{BASE_URL}/dataset?format=xlsx")
    assert r.status_code == 200
    with io.BytesIO(r.content) as f:
        xls = pd.ExcelFile(f, engine='openpyxl')
        sheets = xls.sheet_names
        print("Live Dataset XLSX Sheets:", sheets)
        assert set(sheets) == {"Students", "Programs", "Courses", "Enrollments", "Learning_Activity"}
        
    # Practical 13
    r = requests.get(f"{BASE_URL}/practical13?format=xlsx")
    assert r.status_code == 200
    with io.BytesIO(r.content) as f:
        xls = pd.ExcelFile(f, engine='openpyxl')
        print("Practical 13 XLSX Sheets:", xls.sheet_names)
        df = pd.read_excel(xls, "Practical13")
        print("Practical 13 Rows:", len(df))
        assert len(df) > 0
        
    # Data Quality
    r = requests.get(f"{BASE_URL}/data-quality?format=xlsx")
    assert r.status_code == 200
    with io.BytesIO(r.content) as f:
        xls = pd.ExcelFile(f, engine='openpyxl')
        print("Data Quality XLSX Sheets:", xls.sheet_names)
        assert "Sheets" in xls.sheet_names
        
def test_csv_zip():
    print("Testing CSV/ZIP export...")
    r = requests.get(f"{BASE_URL}/dataset?format=csv")
    assert r.status_code == 200
    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
        files = z.namelist()
        print("Live Dataset ZIP contents:", files)
        assert set(files) == {"Students.csv", "Programs.csv", "Courses.csv", "Enrollments.csv", "Learning_Activity.csv"}
        for f in files:
            with z.open(f) as csv_file:
                df = pd.read_csv(csv_file)
                assert len(df) > 0
                assert len(df.columns) > 0
                print(f"  {f}: {len(df)} rows, headers: {list(df.columns)}")

def test_filter_aware():
    print("Testing Filter-Aware export (Practical 14)...")
    r_unfiltered = requests.get(f"{BASE_URL}/practical14?format=csv")
    df_unfiltered = pd.read_csv(io.BytesIO(r_unfiltered.content))
    print("  Unfiltered Rows:", len(df_unfiltered))
    
    r_filtered = requests.get(f"{BASE_URL}/practical14?format=csv&risk=High")
    df_filtered = pd.read_csv(io.BytesIO(r_filtered.content))
    print("  Filtered (Risk=High) Rows:", len(df_filtered))
    
    assert len(df_filtered) < len(df_unfiltered)
    assert all(df_filtered['academic_risk_level'] == 'High')
    print("  Filter awareness verified.")

def test_live_data_sim():
    print("Testing Live Data Simulation boundaries...")
    # Baseline
    r1 = requests.get(f"{BASE_URL}/dataset?format=xlsx")
    xls1 = pd.ExcelFile(io.BytesIO(r1.content), engine='openpyxl')
    df_base = pd.read_excel(xls1, "Enrollments")
    base_sum = df_base['assessment_score'].sum() + df_base['attendance_percentage'].sum()
    
    # Simulate
    requests.post("http://127.0.0.1:8000/api/live/update", headers={"x-role": "Admin"})
    requests.post("http://127.0.0.1:8000/api/live/update", headers={"x-role": "Admin"})
    requests.post("http://127.0.0.1:8000/api/live/update", headers={"x-role": "Admin"})
    
    r2 = requests.get(f"{BASE_URL}/dataset?format=xlsx")
    xls2 = pd.ExcelFile(io.BytesIO(r2.content), engine='openpyxl')
    df_sim = pd.read_excel(xls2, "Enrollments")
    sim_sum = df_sim['assessment_score'].sum() + df_sim['attendance_percentage'].sum()
    
    # It might update Learning_Activity, so let's also check that
    la_base_sum = pd.read_excel(xls1, "Learning_Activity")['engagement_score'].sum()
    la_sim_sum = pd.read_excel(xls2, "Learning_Activity")['engagement_score'].sum()
    
    print(f"  Base Sum: {base_sum} {la_base_sum}, Sim Sum: {sim_sum} {la_sim_sum}")
    assert base_sum != sim_sum or la_base_sum != la_sim_sum
    
    # Reset
    requests.post("http://127.0.0.1:8000/api/live/reset", headers={"x-role": "Admin"})
    
    r3 = requests.get(f"{BASE_URL}/dataset?format=xlsx")
    xls3 = pd.ExcelFile(io.BytesIO(r3.content), engine='openpyxl')
    df_reset = pd.read_excel(xls3, "Enrollments")
    reset_sum = df_reset['assessment_score'].sum() + df_reset['attendance_percentage'].sum()
    
    print(f"  After Reset Sum: {reset_sum}")
    assert reset_sum == base_sum
    print("  Live Data Simulation and Reset verified.")

if __name__ == "__main__":
    test_xlsx()
    test_csv_zip()
    test_filter_aware()
    test_live_data_sim()
    print("All backend structured data verification passed.")
