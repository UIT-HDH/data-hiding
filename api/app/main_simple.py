"""
FastAPI Steganography Backend - Academic Project

Đồ án môn học: Data Hiding với Adaptive LSB Steganography
Thuật toán: Sobel Edge Detection + Adaptive LSB (1-2 bit)

Features:
- POST /api/v1/embed: Embed text into image
- POST /api/v1/extract: Extract text from stego image
- GET /api/v1/health: Health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.simple_settings import get_settings
from app.api.v1.router import api_router


# Settings
settings = get_settings()

# Create FastAPI application
app = FastAPI(
    title="Steganography API - Academic Project",
    description="Đồ án môn học: Data Hiding với Adaptive LSB Steganography",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.api_prefix)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Steganography API - Academic Project",
        "description": "Đồ án môn học: Data Hiding với Adaptive LSB Steganography",
        "algorithm": "Sobel Edge Detection + Adaptive LSB",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
        "endpoints": {
            "embed": "POST /api/v1/embed",
            "extract": "POST /api/v1/extract"
        }
    }


# Health check endpoint
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "steganography-api",
        "version": "1.0.0",
        "algorithm": "Adaptive LSB with Sobel Edge Detection"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
