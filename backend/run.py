# pyrefly: ignore [missing-import]
import uvicorn
import sys
import os

# Add parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.seed import seed_db

if __name__ == "__main__":
    print("Checking and seeding database...")
    seed_db()
    print("Starting FastAPI Backend Server on http://127.0.0.1:8000 ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
