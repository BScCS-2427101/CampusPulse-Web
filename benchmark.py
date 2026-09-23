import requests
import time
import statistics
import sys

BASE_URL = "http://127.0.0.1:8000/api"

endpoints = [
    "/health",
    "/dataset/summary",
    "/dashboard",
    "/practical13",
    "/practical14",
    "/practical15",
    "/data-quality",
    "/live/status",
    "/exports/dataset?format=csv",
    "/exports/dataset?format=xlsx"
]

def benchmark_endpoint(endpoint, iterations=5):
    url = f"{BASE_URL}{endpoint}"
    times = []
    
    # Warmup
    try:
        requests.get(url, timeout=5)
    except:
        pass
        
    for _ in range(iterations):
        start_time = time.time()
        r = requests.get(url, timeout=10)
        end_time = time.time()
        if r.status_code == 200:
            times.append((end_time - start_time) * 1000) # milliseconds
        
    if not times:
        return None, None, None
        
    return min(times), statistics.mean(times), max(times)

def main():
    print("--- API PERFORMANCE BENCHMARK ---")
    for ep in endpoints:
        print(f"Benchmarking {ep}...")
        min_t, avg_t, max_t = benchmark_endpoint(ep)
        if min_t is not None:
            print(f"  Min: {min_t:.2f}ms | Avg: {avg_t:.2f}ms | Max: {max_t:.2f}ms")
        else:
            print(f"  FAILED to reach endpoint.")

if __name__ == "__main__":
    main()
