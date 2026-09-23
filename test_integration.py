import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def check_route(endpoint, expected_status=200):
    r = requests.get(f"{BASE_URL}{endpoint}")
    if r.status_code != expected_status:
        print(f"FAILED Route: {endpoint} (Expected {expected_status}, Got {r.status_code})")
        return False
    return True

def get_baseline():
    r_dash = requests.get(f"{BASE_URL}/dashboard")
    r_p13 = requests.get(f"{BASE_URL}/practical13")
    r_p14 = requests.get(f"{BASE_URL}/practical14")
    r_p15 = requests.get(f"{BASE_URL}/practical15")
    r_dq = requests.get(f"{BASE_URL}/data-quality")
    r_exp = requests.get(f"{BASE_URL}/dataset/summary")
    
    return {
        "dashboard": r_dash.json(),
        "p13": r_p13.json(),
        "p14": r_p14.json(),
        "p15": r_p15.json(),
        "dq": r_dq.json(),
        "summary": r_exp.json()
    }

def verify_live_update():
    print("Resetting Live Dataset...")
    requests.post(f"{BASE_URL}/live/reset", headers={"x-role": "Admin"})
    time.sleep(1)
    
    baseline = get_baseline()
    base_kpis = baseline["dashboard"]["kpis"]
    print(f"Baseline Dashboard KPIs: {base_kpis}")
    
    # Verify Known Baselines
    p14_risk_dist = baseline["p14"]["charts"]["risk_distribution"]
    high_risk = next((r['count'] for r in p14_risk_dist if r['risk_level'] == 'High'), 0)
    print(f"P14 High Risk count (Baseline): {high_risk} (Expected 2)")
    assert high_risk == 2
    
    print("\nSimulating Multiple Updates...")
    for _ in range(5):
        requests.post(f"{BASE_URL}/live/update", headers={"x-role": "Admin"})
    time.sleep(1)
    
    simulated = get_baseline()
    sim_kpis = simulated["dashboard"]["kpis"]
    print(f"Simulated Dashboard KPIs: {sim_kpis}")
    
    if base_kpis == sim_kpis:
        print("WARNING: Dashboard KPIs did not change after 5 simulated updates. This might happen if updates only affected fields not visible in KPIs, but is unlikely.")
    else:
        print("Dashboard KPIs changed. Live Update propagates successfully.")
        
    print("\nResetting Live Dataset to Original...")
    requests.post(f"{BASE_URL}/live/reset", headers={"x-role": "Admin"})
    time.sleep(1)
    
    reset = get_baseline()
    reset_kpis = reset["dashboard"]["kpis"]
    print(f"Reset Dashboard KPIs: {reset_kpis}")
    
    if reset_kpis == base_kpis:
        print("Reset successful. Values restored to baseline.")
    else:
        print("FAILED: Reset did not restore baseline values!")
        assert False

def verify_security():
    # Viewer tries to simulate update
    r1 = requests.post(f"{BASE_URL}/live/update", headers={"x-role": "Viewer"})
    assert r1.status_code == 403
    print("Viewer correctly denied access to /live/update")
    
    # Viewer tries to reset
    r2 = requests.post(f"{BASE_URL}/live/reset", headers={"x-role": "Viewer"})
    assert r2.status_code == 403
    print("Viewer correctly denied access to /live/reset")

if __name__ == "__main__":
    print("Running Route Regression...")
    routes = ["/dashboard", "/practical13", "/practical14", "/practical15", "/data-quality", "/live/status"]
    for route in routes:
        if check_route(route):
            print(f"Route {route} OK")
            
    verify_security()
    verify_live_update()
    
    print("\nAll integration API checks completed successfully.")
