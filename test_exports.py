import zipfile
import io
import os
import sys
import pandas as pd
import json

# Add backend to path for direct TestClient
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.services.data_loader import DataLoader

# Ensure dataset is loaded
DataLoader().load_data()
client = TestClient(app)
BASE_URL = "/api/exports"

def test_xlsx():
    print("Testing XLSX export...")
    # Dataset
    r = client.get(f"{BASE_URL}/dataset?format=xlsx")
    assert r.status_code == 200
    with io.BytesIO(r.content) as f:
        xls = pd.ExcelFile(f, engine='openpyxl')
        sheets = xls.sheet_names
        print("Live Dataset XLSX Sheets:", sheets)
        assert set(sheets) == {"Students", "Programs", "Courses", "Enrollments", "Learning_Activity"}
        
    # Practical 13
    r = client.get(f"{BASE_URL}/practical13?format=xlsx")
    assert r.status_code == 200
    with io.BytesIO(r.content) as f:
        xls = pd.ExcelFile(f, engine='openpyxl')
        print("Practical 13 XLSX Sheets:", xls.sheet_names)
        df = pd.read_excel(xls, "Practical13")
        print("Practical 13 Rows:", len(df))
        assert len(df) > 0
        
    # Data Quality
    r = client.get(f"{BASE_URL}/data-quality?format=xlsx")
    assert r.status_code == 200
    with io.BytesIO(r.content) as f:
        xls = pd.ExcelFile(f, engine='openpyxl')
        print("Data Quality XLSX Sheets:", xls.sheet_names)
        assert "Sheets" in xls.sheet_names
        
def test_csv_zip():
    print("Testing CSV/ZIP export...")
    r = client.get(f"{BASE_URL}/dataset?format=csv")
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
    r_unfiltered = client.get(f"{BASE_URL}/practical14?format=csv")
    df_unfiltered = pd.read_csv(io.BytesIO(r_unfiltered.content))
    print("  Unfiltered Rows:", len(df_unfiltered))
    
    r_filtered = client.get(f"{BASE_URL}/practical14?format=csv&risk=High")
    df_filtered = pd.read_csv(io.BytesIO(r_filtered.content))
    print("  Filtered (Risk=High) Rows:", len(df_filtered))
    
    assert len(df_filtered) < len(df_unfiltered)
    assert all(df_filtered['academic_risk_level'] == 'High')
    print("  Filter awareness verified.")

def test_live_data_sim():
    print("Testing Live Data Simulation boundaries...")
    # Baseline
    r1 = client.get(f"{BASE_URL}/dataset?format=xlsx")
    xls1 = pd.ExcelFile(io.BytesIO(r1.content), engine='openpyxl')
    df_base_enr = pd.read_excel(xls1, "Enrollments")
    df_base_act = pd.read_excel(xls1, "Learning_Activity")
    
    # Simulate
    logs = []
    for _ in range(5):
        resp = client.post("/api/live/update", headers={"x-role": "Admin"})
        assert resp.status_code == 200
        logs.append(resp.json().get("log"))
    
    # Verify update log was populated
    assert any(logs), "At least one log entry should be generated"
    print(f"  Generated simulation logs: {[l['field_changed'] for l in logs if l]}")
    
    r2 = client.get(f"{BASE_URL}/dataset?format=xlsx")
    xls2 = pd.ExcelFile(io.BytesIO(r2.content), engine='openpyxl')
    df_sim_enr = pd.read_excel(xls2, "Enrollments")
    df_sim_act = pd.read_excel(xls2, "Learning_Activity")
    
    has_changed = (not df_base_enr.equals(df_sim_enr)) or (not df_base_act.equals(df_sim_act))
    print(f"  Datasets changed after simulation: {has_changed}")
    assert has_changed, "Simulation should have modified Enrollments or Learning_Activity"
    
    # Reset
    res = client.post("/api/live/reset", headers={"x-role": "Admin"})
    assert res.status_code == 200
    
    r3 = client.get(f"{BASE_URL}/dataset?format=xlsx")
    xls3 = pd.ExcelFile(io.BytesIO(r3.content), engine='openpyxl')
    df_reset_enr = pd.read_excel(xls3, "Enrollments")
    df_reset_act = pd.read_excel(xls3, "Learning_Activity")
    
    assert df_reset_enr['assessment_score'].sum() == df_base_enr['assessment_score'].sum()
    print("  Live Data Simulation and Reset verified.")

if __name__ == "__main__":
    test_xlsx()
    test_csv_zip()
    test_filter_aware()
    test_live_data_sim()
    print("All backend structured data verification passed.")
