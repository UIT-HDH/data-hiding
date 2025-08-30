"""
FastAPI Steganography Backend - Main Application

This is the main entry point for the FastAPI application providing
steganography services including image embedding, extraction, batch processing,
and complexity analysis.

Features:
- Image steganography embedding and extraction
- Batch processing capabilities
- Complexity analysis and mapping
- Comprehensive error handling
- Request logging and monitoring
- File validation and security
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import time
import uuid
from typing import Dict, Any

from app.config.settings import get_settings
from app.core.exceptions import (
    SteganographyException,
    FileValidationError,
    ProcessingError,
    PayloadTooLargeError
)
from app.core.middleware import (
    RequestLoggingMiddleware,
    SecurityMiddleware,
    RateLimitMiddleware
)
from app.core.logging import setup_logging, get_logger
from app.api.v1.router import api_router


settings = get_settings()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events.
    
    Args:
        app: FastAPI application instance
    """
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.is_debug}")
    
    # Initialize logging
    setup_logging()
    
    # Create necessary directories
    settings.create_directories()
    
    logger.info("Application startup completed")
    
    yield
    
    # Shutdown
    logger.info("Application shutdown initiated")
    logger.info("Application shutdown completed")


# Create FastAPI application instance
app = FastAPI(
    title=settings.app_name,
    description="""
    **FastAPI Steganography Backend**
    
    A comprehensive API for image steganography operations including:
    
    ## Features
    * **Image Embedding** - Hide secret data within images
    * **Data Extraction** - Extract hidden data from steganography images
    * **Batch Processing** - Process multiple images simultaneously
    * **Complexity Analysis** - Generate complexity maps and statistics
    * **Security** - Input validation and sanitization
    * **Monitoring** - Request logging and performance tracking
    
    ## Supported Formats
    * **Input Images**: PNG, JPG, JPEG, BMP, TIFF
    * **Output Formats**: Base64 encoded images, JSON, CSV
    * **Secret Data**: Text strings, binary files
    
    ## API Endpoints
    * `POST /embed` - Embed secret data into images
    * `POST /extract` - Extract secret data from images  
    * `POST /batch/embed` - Batch embedding operations
    * `POST /analysis/complexity` - Complexity analysis
    
    ## Error Handling
    All endpoints provide detailed error responses with specific error codes
    and messages for debugging and monitoring purposes.
    """,
    version=settings.app_version,
    docs_url="/docs" if settings.is_debug else None,
    redoc_url="/redoc" if settings.is_debug else None,
    openapi_url="/openapi.json" if settings.is_debug else None,
    lifespan=lifespan,
)


# Add middleware in correct order (last added = first executed)

# Compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=settings.cors_methods,
    allow_headers=settings.cors_headers,
    expose_headers=["X-Request-ID", "X-Process-Time"],
)

# Custom middleware
app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityMiddleware)
app.add_middleware(RequestLoggingMiddleware)


# Include API router
app.include_router(
    api_router,
    prefix=settings.api_prefix,
    tags=["steganography"]
)


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for monitoring and load balancing.
    
    Returns:
        Dict[str, Any]: Health status information
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "timestamp": time.time(),
        "uptime": time.time() - app.state.start_time if hasattr(app.state, 'start_time') else 0
    }


# Root endpoint
@app.get("/", tags=["root"])
async def root() -> Dict[str, Any]:
    """
    Root endpoint providing API information.
    
    Returns:
        Dict[str, Any]: API information and links
    """
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "description": "FastAPI backend for steganography operations",
        "docs_url": f"{settings.api_prefix}/docs" if settings.is_debug else None,
        "health_url": "/health",
        "api_prefix": settings.api_prefix,
        "endpoints": {
            "embed": f"{settings.api_prefix}/embed",
            "extract": f"{settings.api_prefix}/extract",
            "batch_embed": f"{settings.api_prefix}/batch/embed",
            "complexity_analysis": f"{settings.api_prefix}/analysis/complexity"
        }
    }


# Global exception handlers

@app.exception_handler(SteganographyException)
async def steganography_exception_handler(request: Request, exc: SteganographyException):
    """Handle custom steganography exceptions."""
    request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
    
    logger.error(
        f"Steganography error occurred",
        extra={
            "request_id": request_id,
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "error_code": exc.error_code,
            "url": str(request.url),
            "method": request.method,
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "error_code": exc.error_code,
            "error_type": type(exc).__name__,
            "message": str(exc),
            "request_id": request_id,
            "timestamp": time.time(),
        },
        headers={"X-Request-ID": request_id}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
    
    logger.warning(
        f"Validation error occurred",
        extra={
            "request_id": request_id,
            "validation_errors": exc.errors(),
            "url": str(request.url),
            "method": request.method,
        }
    )
    
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "error_code": "VALIDATION_ERROR",
            "error_type": "RequestValidationError",
            "message": "Request validation failed",
            "details": exc.errors(),
            "request_id": request_id,
            "timestamp": time.time(),
        },
        headers={"X-Request-ID": request_id}
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions."""
    request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
    
    logger.warning(
        f"HTTP exception occurred",
        extra={
            "request_id": request_id,
            "status_code": exc.status_code,
            "detail": exc.detail,
            "url": str(request.url),
            "method": request.method,
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "error_code": f"HTTP_{exc.status_code}",
            "error_type": "HTTPException",
            "message": exc.detail,
            "request_id": request_id,
            "timestamp": time.time(),
        },
        headers={"X-Request-ID": request_id}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
    
    logger.error(
        f"Unexpected error occurred",
        extra={
            "request_id": request_id,
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "url": str(request.url),
            "method": request.method,
        },
        exc_info=True
    )
    
    # Don't expose internal errors in production
    if settings.is_production:
        message = "An internal server error occurred"
        details = None
    else:
        message = str(exc)
        details = {
            "error_type": type(exc).__name__,
            "traceback": repr(exc)
        }
    
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "error_code": "INTERNAL_SERVER_ERROR",
            "error_type": "InternalServerError",
            "message": message,
            "details": details,
            "request_id": request_id,
            "timestamp": time.time(),
        },
        headers={"X-Request-ID": request_id}
    )


# Store startup time for uptime calculation
@app.on_event("startup")
async def store_startup_time():
    """Store application startup time."""
    app.state.start_time = time.time()


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.is_debug,
        workers=settings.workers if not settings.is_debug else 1,
        log_level=settings.log_level,
        access_log=True,
    )