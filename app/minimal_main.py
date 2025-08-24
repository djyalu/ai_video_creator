"""
Minimal FastAPI app for deployment testing
"""
from fastapi import FastAPI
import time

# Create minimal app
app = FastAPI(title="AI Video Creator - Minimal Test")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Minimal app is running"}

@app.get("/ping")
async def ping():
    return {
        "status": "alive", 
        "timestamp": int(time.time()),
        "message": "Minimal ping successful"
    }

@app.get("/health")  
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)