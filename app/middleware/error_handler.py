"""
Global error handling middleware and custom exception handlers
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging
import traceback
from typing import Any, Dict

logger = logging.getLogger(__name__)


class APIError(Exception):
    """Custom API exception"""
    def __init__(self, message: str, status_code: int = 500, details: Dict[str, Any] = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Global error handling middleware
    """
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            logger.error(f"Unhandled exception: {str(e)}")
            logger.error(traceback.format_exc())
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "message": "An unexpected error occurred",
                    "type": "internal_error"
                }
            )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    logger.warning(f"Validation error on {request.method} {request.url}: {exc.errors()}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation error",
            "message": "Request validation failed",
            "type": "validation_error",
            "details": exc.errors()
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle FastAPI HTTP exceptions"""
    logger.warning(f"HTTP {exc.status_code} on {request.method} {request.url}: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": f"HTTP {exc.status_code}",
            "message": exc.detail,
            "type": "http_error"
        }
    )


async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle Starlette HTTP exceptions"""
    logger.warning(f"Starlette HTTP {exc.status_code} on {request.method} {request.url}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": f"HTTP {exc.status_code}",
            "message": exc.detail if hasattr(exc, 'detail') else "HTTP error occurred",
            "type": "http_error"
        }
    )


async def api_exception_handler(request: Request, exc: APIError):
    """Handle custom API exceptions"""
    logger.error(f"API Error {exc.status_code} on {request.method} {request.url}: {exc.message}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "API Error",
            "message": exc.message,
            "type": "api_error",
            "details": exc.details
        }
    )