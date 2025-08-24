"""
Main FastAPI application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager
import logging
import uvicorn

from .api.endpoints import video, status, health
from .core.config import settings
from .database import init_db
from .middleware.error_handler import (
    ErrorHandlerMiddleware,
    APIError,
    validation_exception_handler,
    http_exception_handler,
    starlette_http_exception_handler,
    api_exception_handler
)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME}")
    await init_db()
    logger.info("Database initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered video generation service using Google AI Studio and Kling AI",
    version="1.0.0",
    lifespan=lifespan
)

# Add global error handling middleware
app.add_middleware(ErrorHandlerMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else ["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(StarletteHTTPException, starlette_http_exception_handler)
app.add_exception_handler(APIError, api_exception_handler)

# Mount static files for serving generated videos (if using local storage)
if settings.UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")
if settings.OUTPUT_DIR.exists():
    app.mount("/outputs", StaticFiles(directory=str(settings.OUTPUT_DIR)), name="outputs")

# Include API routers
app.include_router(health.router, tags=["health"])
app.include_router(video.router, prefix="/api/v1/video", tags=["video"])
app.include_router(status.router, prefix="/api/v1/status", tags=["status"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info"
    )