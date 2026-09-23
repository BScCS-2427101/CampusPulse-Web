from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router
from app.api.export_endpoints import router as export_router
from app.services.cache import DataCache

app = FastAPI(title="CampusPulse API", description="Backend for CampusPulse Web Analytics Dashboard")

# Configure CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Request, HTTPException

app.include_router(router, prefix="/api")
app.include_router(export_router, prefix="/api/exports")

# Serve React Frontend
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str, request: Request):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        
        # Check if it's a known public file like favicon.svg
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "Frontend build not found"}

@app.on_event("startup")
def startup_event():
    # Pre-warm the cache on startup
    print("Pre-warming data cache...")
    cache = DataCache()
    try:
        cache.load_and_process()
        print("Cache pre-warmed successfully.")
    except Exception as e:
        print(f"Error pre-warming cache: {e}")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
