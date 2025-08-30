"""
API Router for version 1 of the Steganography API.

This module handles all v1 API routes and endpoints.
"""

from fastapi import APIRouter

# Create the main API router for v1
api_router = APIRouter()

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