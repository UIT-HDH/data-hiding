"""
API Router for version 1 of the Steganography API.

Focus: Tab "Embed" functionality only for academic project.
"""

from fastapi import APIRouter
from app.api.v1.endpoints import embed

# Create the main API router for v1
api_router = APIRouter()

# Include only embed endpoint router for Tab "Embed" functionality
api_router.include_router(embed.router, tags=["embed"])

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is running.
    
    Returns:
        dict: Health status information
    """
    return {
        "status": "healthy",
        "message": "Steganography API is running",
        "version": "1.0.0"
    }

# Root endpoint
@api_router.get("/")
async def root():
    """
    Root endpoint with basic API information.
    
    Returns:
        dict: API welcome message and information
    """
    return {
        "message": "Welcome to the Steganography API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }