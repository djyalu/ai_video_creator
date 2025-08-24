"""
Health check endpoints
"""
from fastapi import APIRouter
from typing import Dict, Any
import time
import sys
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for monitoring and load balancers
    """
    return {
        "status": "healthy",
        "timestamp": int(time.time()),
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    }


@router.get("/health/ready")
async def readiness_check() -> Dict[str, Any]:
    """
    Readiness check for Kubernetes/container orchestration
    """
    # Add database connectivity check, Redis check, etc.
    try:
        # TODO: Add actual service checks
        # - Database connection
        # - Redis connection
        # - External API availability
        
        return {
            "status": "ready",
            "timestamp": int(time.time()),
            "services": {
                "database": "ready",  # TODO: Implement actual check
                "redis": "ready",     # TODO: Implement actual check
                "ai_services": "ready"  # TODO: Implement actual check
            }
        }
    except Exception as e:
        return {
            "status": "not_ready",
            "timestamp": int(time.time()),
            "error": str(e)
        }


@router.get("/health/live")
async def liveness_check() -> Dict[str, Any]:
    """
    Liveness check for Kubernetes/container orchestration
    """
    return {
        "status": "alive",
        "timestamp": int(time.time())
    }