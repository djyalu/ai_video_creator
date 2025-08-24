"""
Ultra-simple FastAPI app for Render deployment testing
"""
from fastapi import FastAPI
import uvicorn
import os

# Create FastAPI app
app = FastAPI(title="AI Video Creator")

@app.get("/")
def root():
    return {
        "status": "ok", 
        "message": "AI Video Creator is running!",
        "port": os.environ.get("PORT", "unknown")
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/ping")
def ping():
    return {"status": "pong"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)