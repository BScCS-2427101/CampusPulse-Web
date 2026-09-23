import pytest
from fastapi.testclient import TestClient
import os
import hashlib

from app.main import app
from app.services.data_loader import DataLoader
from app.services.cache import DataCache

client = TestClient(app)

def get_file_hash(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "CampusPulse Backend is running"}

def test_dataset_loading_and_protection():
    loader = DataLoader()
    
    # Verify original file exists
    assert os.path.exists(loader.original_file)
    
    # Record original file hash
    original_hash_before = get_file_hash(loader.original_file)
    
    # Load dataset
    dataframes = loader.load_data()
    
    # Verify required sheets are loaded
    assert all(sheet in dataframes for sheet in loader.required_sheets)
    assert not dataframes['Students'].empty
    
    # Verify original file hash hasn't changed
    original_hash_after = get_file_hash(loader.original_file)
    assert original_hash_before == original_hash_after
    
    # Verify live dataset is created and exists
    assert os.path.exists(loader.live_file)

def test_dashboard_endpoint():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "charts" in data
    
    kpis = data["kpis"]
    assert "total_students" in kpis
    assert "pass_percentage" in kpis
    assert kpis["total_students"] > 0
    
def test_practical13_endpoint():
    response = client.get("/api/practical13")
    assert response.status_code == 200
    data = response.json()
    assert "charts" in data
    assert len(data["charts"]) > 0

def test_practical14_endpoint():
    response = client.get("/api/practical14")
    assert response.status_code == 200
    data = response.json()
    assert "charts" in data
    assert len(data["charts"]) > 0
    # verify filter options have 'Not Specified' in scholarships if available
    if "scholarships" in data.get("filter_options", {}):
        assert len(data["filter_options"]["scholarships"]) > 0

def test_practical15_endpoint():
    response = client.get("/api/practical15")
    assert response.status_code == 200
    data = response.json()
    assert "charts" in data
    assert len(data["charts"]) > 0
    if "enrollment_forecast" in data["charts"]:
        forecast = data["charts"]["enrollment_forecast"]
        assert "method" in forecast
        assert "horizon" in forecast
        assert len(forecast["data"]) > 0

def test_live_dataset_reset():
    loader = DataLoader()
    original_hash = get_file_hash(loader.original_file)
    
    response = client.post("/api/live/reset", headers={"X-Role": "Admin"})
    assert response.status_code == 200
    
    # The live dataset hash should now exactly match the original dataset hash
    live_hash = get_file_hash(loader.live_file)
    assert live_hash == original_hash
    
    # Verify original hash remains unchanged
    assert get_file_hash(loader.original_file) == original_hash

def test_live_viewer_rejection():
    response = client.post("/api/live/reset", headers={"X-Role": "Viewer"})
    assert response.status_code == 403
    
    response2 = client.post("/api/live/update", headers={"X-Role": "Viewer"})
    assert response2.status_code == 403

def test_data_quality():
    response = client.get("/api/data-quality")
    assert response.status_code == 200
    data = response.json()
    assert "dataset" in data
    assert "sheets" in data
    assert "Students" in data["sheets"]
    assert "missing_values" in data
    assert "duplicates" in data
    assert "referential_integrity" in data
    assert "anomalies" in data
    assert "overall_status" in data

def test_export_dataset_xlsx():
    response = client.get("/api/exports/dataset?format=xlsx")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert "attachment; filename=\"CampusPulse_Dataset_" in response.headers["content-disposition"]
    # Check it's non-empty
    assert len(response.content) > 0

def test_export_dataset_csv_zip():
    response = client.get("/api/exports/dataset?format=csv")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    assert len(response.content) > 0

def test_export_practical13_csv():
    response = client.get("/api/exports/practical13?format=csv")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert len(response.content) > 0

def test_export_practical14_csv():
    response = client.get("/api/exports/practical14?format=csv")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert len(response.content) > 0

def test_export_practical15_xlsx():
    response = client.get("/api/exports/practical15?format=xlsx")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert len(response.content) > 0

def test_export_data_quality_xlsx():
    response = client.get("/api/exports/data-quality?format=xlsx")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert len(response.content) > 0
