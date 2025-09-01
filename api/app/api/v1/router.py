"""
API Router for v1 endpoints - Academic Project.

Đồ án môn học: Data Hiding với Adaptive LSB Steganography
"""

from fastapi import APIRouter
from app.api.v1.endpoints import embed

# Create the main API router for v1
api_router = APIRouter()

# Include embed router (main functionality)
api_router.include_router(embed.router, tags=["steganography"])

# Health check for the API
@api_router.get("/health")
async def api_health():
    """API health check endpoint"""
    return {
        "status": "healthy",
        "api_version": "v1",
        "algorithm": "Adaptive LSB with Sobel Edge Detection",
        "available_endpoints": ["/embed", "/extract", "/health"]
    }