"""
Pydantic models for API response schemas.

This module defines all response models returned by the FastAPI endpoints
for steganography operations with comprehensive data structures for
results, metrics, and error information.
"""

from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class ProcessingStatus(str, Enum):
    """Processing status enumeration."""
    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"
    CANCELLED = "cancelled"


class DataType(str, Enum):
    """Types of extracted data."""
    TEXT = "text"
    BINARY = "binary"
    IMAGE = "image"
    DOCUMENT = "document"
    UNKNOWN = "unknown"


# Base response models

class BaseResponse(BaseModel):
    """Base response model with common fields."""
    
    success: bool = Field(
        ...,
        description="Whether the operation was successful"
    )
    
    message: str = Field(
        ...,
        description="Human-readable status message"
    )
    
    request_id: Optional[str] = Field(
        None,
        description="Request identifier for tracking"
    )
    
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Response timestamp"
    )
    
    processing_time: float = Field(
        ...,
        description="Processing time in seconds",
        ge=0.0
    )
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ErrorResponse(BaseResponse):
    """Error response model."""
    
    success: bool = Field(False, const=True)
    
    error_code: str = Field(
        ...,
        description="Machine-readable error code"
    )
    
    error_type: str = Field(
        ...,
        description="Type of error that occurred"
    )
    
    details: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional error details"
    )
    
    suggestions: Optional[List[str]] = Field(
        None,
        description="Suggestions for fixing the error"
    )


# Metrics and analysis models

class EmbeddingMetrics(BaseModel):
    """Metrics for embedding operations."""
    
    original_size: int = Field(
        ...,
        description="Original image size in bytes",
        ge=0
    )
    
    stego_size: int = Field(
        ...,
        description="Steganography image size in bytes",
        ge=0
    )
    
    payload_size: int = Field(
        ...,
        description="Secret data size in bytes",
        ge=0
    )
    
    capacity_used: float = Field(
        ...,
        description="Percentage of image capacity used (0-100)",
        ge=0.0,
        le=100.0
    )
    
    total_capacity: int = Field(
        ...,
        description="Total embedding capacity in bytes",
        ge=0
    )
    
    compression_ratio: float = Field(
        ...,
        description="Data compression ratio achieved",
        ge=0.0
    )
    
    quality_score: float = Field(
        ...,
        description="Image quality score after embedding (0-100)",
        ge=0.0,
        le=100.0
    )
    
    psnr: Optional[float] = Field(
        None,
        description="Peak Signal-to-Noise Ratio in dB",
        ge=0.0
    )
    
    mse: Optional[float] = Field(
        None,
        description="Mean Squared Error",
        ge=0.0
    )
    
    ssim: Optional[float] = Field(
        None,
        description="Structural Similarity Index (0-1)",
        ge=0.0,
        le=1.0
    )
    
    histogram_similarity: Optional[float] = Field(
        None,
        description="Histogram similarity score (0-1)",
        ge=0.0,
        le=1.0
    )


class ExtractionMetrics(BaseModel):
    """Metrics for extraction operations."""
    
    extracted_size: int = Field(
        ...,
        description="Size of extracted data in bytes",
        ge=0
    )
    
    confidence_score: float = Field(
        ...,
        description="Confidence in extraction accuracy (0-1)",
        ge=0.0,
        le=1.0
    )
    
    integrity_verified: bool = Field(
        ...,
        description="Whether data integrity was verified"
    )
    
    checksum_valid: Optional[bool] = Field(
        None,
        description="Whether checksum validation passed"
    )
    
    data_type: DataType = Field(
        ...,
        description="Type of extracted data"
    )
    
    compression_detected: Optional[str] = Field(
        None,
        description="Detected compression method"
    )
    
    encryption_detected: Optional[str] = Field(
        None,
        description="Detected encryption method"
    )
    
    error_correction_used: bool = Field(
        False,
        description="Whether error correction was applied"
    )
    
    bit_error_rate: Optional[float] = Field(
        None,
        description="Estimated bit error rate (0-1)",
        ge=0.0,
        le=1.0
    )


class ComplexityMap(BaseModel):
    """Complexity map data structure."""
    
    type: str = Field(
        ...,
        description="Type of complexity map"
    )
    
    data: str = Field(
        ...,
        description="Base64 encoded map image"
    )
    
    width: int = Field(
        ...,
        description="Map width in pixels",
        ge=1
    )
    
    height: int = Field(
        ...,
        description="Map height in pixels",
        ge=1
    )
    
    min_value: float = Field(
        ...,
        description="Minimum complexity value"
    )
    
    max_value: float = Field(
        ...,
        description="Maximum complexity value"
    )
    
    mean_value: float = Field(
        ...,
        description="Mean complexity value"
    )
    
    std_value: float = Field(
        ...,
        description="Standard deviation of complexity values"
    )
    
    normalized: bool = Field(
        ...,
        description="Whether values are normalized to 0-1 range"
    )


class ComplexityStatistics(BaseModel):
    """Statistical analysis of image complexity."""
    
    entropy: float = Field(
        ...,
        description="Image entropy value",
        ge=0.0
    )
    
    gradient_magnitude: float = Field(
        ...,
        description="Average gradient magnitude",
        ge=0.0
    )
    
    texture_energy: float = Field(
        ...,
        description="Texture energy measure",
        ge=0.0
    )
    
    edge_density: float = Field(
        ...,
        description="Edge density (0-1)",
        ge=0.0,
        le=1.0
    )
    
    spatial_frequency: float = Field(
        ...,
        description="Spatial frequency measure",
        ge=0.0
    )
    
    color_diversity: float = Field(
        ...,
        description="Color diversity index",
        ge=0.0
    )
    
    homogeneity: float = Field(
        ...,
        description="Homogeneity measure (0-1)",
        ge=0.0,
        le=1.0
    )
    
    contrast: float = Field(
        ...,
        description="Contrast measure",
        ge=0.0
    )
    
    correlation: float = Field(
        ...,
        description="Correlation coefficient",
        ge=-1.0,
        le=1.0
    )
    
    embedding_capacity: int = Field(
        ...,
        description="Estimated embedding capacity in bytes",
        ge=0
    )
    
    recommended_algorithm: str = Field(
        ...,
        description="Recommended steganography algorithm"
    )


# Main API response models

class EmbedResponse(BaseResponse):
    """Response model for the /embed endpoint."""
    
    stego_image: str = Field(
        ...,
        description="Base64 encoded steganography image"
    )
    
    metrics: Optional[EmbeddingMetrics] = Field(
        None,
        description="Embedding operation metrics"
    )
    
    complexity_maps: Optional[List[ComplexityMap]] = Field(
        None,
        description="Complexity and embedding maps"
    )
    
    log_entries: Optional[List[str]] = Field(
        None,
        description="Processing log entries"
    )
    
    algorithm_used: str = Field(
        ...,
        description="Steganography algorithm used"
    )
    
    parameters_used: Dict[str, Any] = Field(
        ...,
        description="Final parameters used for embedding"
    )
    
    warnings: Optional[List[str]] = Field(
        None,
        description="Warning messages during processing"
    )


class ExtractedData(BaseModel):
    """Model for extracted secret data."""
    
    content: str = Field(
        ...,
        description="Extracted content (text or base64 encoded)"
    )
    
    data_type: DataType = Field(
        ...,
        description="Type of extracted data"
    )
    
    is_binary: bool = Field(
        ...,
        description="Whether content is binary data"
    )
    
    filename: Optional[str] = Field(
        None,
        description="Original filename (if available)"
    )
    
    size: int = Field(
        ...,
        description="Size of extracted data in bytes",
        ge=0
    )
    
    checksum: Optional[str] = Field(
        None,
        description="Data checksum for integrity verification"
    )
    
    compression_used: Optional[str] = Field(
        None,
        description="Compression method used"
    )
    
    encryption_used: Optional[str] = Field(
        None,
        description="Encryption method used"
    )


class ExtractResponse(BaseResponse):
    """Response model for the /extract endpoint."""
    
    extracted_data: Optional[ExtractedData] = Field(
        None,
        description="Extracted secret data"
    )
    
    integrity: Optional[ExtractionMetrics] = Field(
        None,
        description="Data integrity and extraction metrics"
    )
    
    log_entries: Optional[List[str]] = Field(
        None,
        description="Processing log entries"
    )
    
    algorithm_used: str = Field(
        ...,
        description="Extraction algorithm used"
    )
    
    parameters_used: Dict[str, Any] = Field(
        ...,
        description="Parameters used for extraction"
    )
    
    warnings: Optional[List[str]] = Field(
        None,
        description="Warning messages during processing"
    )


class BatchResult(BaseModel):
    """Result for individual batch item."""
    
    id: str = Field(
        ...,
        description="Item identifier"
    )
    
    status: ProcessingStatus = Field(
        ...,
        description="Processing status"
    )
    
    stego_image: Optional[str] = Field(
        None,
        description="Base64 encoded result image"
    )
    
    metrics: Optional[EmbeddingMetrics] = Field(
        None,
        description="Embedding metrics for this item"
    )
    
    error: Optional[str] = Field(
        None,
        description="Error message (if failed)"
    )
    
    error_code: Optional[str] = Field(
        None,
        description="Error code (if failed)"
    )
    
    processing_time: float = Field(
        ...,
        description="Processing time for this item in seconds",
        ge=0.0
    )
    
    warnings: Optional[List[str]] = Field(
        None,
        description="Warning messages for this item"
    )


class BatchSummary(BaseModel):
    """Summary statistics for batch processing."""
    
    total_items: int = Field(
        ...,
        description="Total number of items processed",
        ge=0
    )
    
    successful_items: int = Field(
        ...,
        description="Number of successfully processed items",
        ge=0
    )
    
    failed_items: int = Field(
        ...,
        description="Number of failed items",
        ge=0
    )
    
    success_rate: float = Field(
        ...,
        description="Success rate as percentage (0-100)",
        ge=0.0,
        le=100.0
    )
    
    total_processing_time: float = Field(
        ...,
        description="Total processing time in seconds",
        ge=0.0
    )
    
    average_processing_time: float = Field(
        ...,
        description="Average processing time per item in seconds",
        ge=0.0
    )
    
    total_payload_size: int = Field(
        ...,
        description="Total size of all payloads in bytes",
        ge=0
    )
    
    total_output_size: int = Field(
        ...,
        description="Total size of all output images in bytes",
        ge=0
    )


class BatchEmbedResponse(BaseResponse):
    """Response model for the /batch/embed endpoint."""
    
    results: List[BatchResult] = Field(
        ...,
        description="Results for each processed item"
    )
    
    summary: BatchSummary = Field(
        ...,
        description="Batch processing summary"
    )
    
    config_used: Dict[str, Any] = Field(
        ...,
        description="Configuration used for batch processing"
    )
    
    log_entries: Optional[List[str]] = Field(
        None,
        description="Global processing log entries"
    )
    
    warnings: Optional[List[str]] = Field(
        None,
        description="Global warning messages"
    )


class ComplexityAnalysisResponse(BaseResponse):
    """Response model for the /analysis/complexity endpoint."""
    
    complexity_maps: Optional[List[ComplexityMap]] = Field(
        None,
        description="Generated complexity maps"
    )
    
    normalized_maps: Optional[List[ComplexityMap]] = Field(
        None,
        description="Normalized complexity maps"
    )
    
    statistics: Optional[ComplexityStatistics] = Field(
        None,
        description="Statistical analysis results"
    )
    
    analysis_types: List[str] = Field(
        ...,
        description="Types of analysis performed"
    )
    
    image_properties: Dict[str, Any] = Field(
        ...,
        description="Basic image properties"
    )
    
    recommendations: Optional[List[str]] = Field(
        None,
        description="Recommendations based on analysis"
    )
    
    log_entries: Optional[List[str]] = Field(
        None,
        description="Analysis log entries"
    )
    
    warnings: Optional[List[str]] = Field(
        None,
        description="Warning messages during analysis"
    )


# Utility response models

class HealthResponse(BaseModel):
    """Health check response."""
    
    status: str = Field(
        ...,
        description="Service health status"
    )
    
    service: str = Field(
        ...,
        description="Service name"
    )
    
    version: str = Field(
        ...,
        description="Service version"
    )
    
    environment: str = Field(
        ...,
        description="Current environment"
    )
    
    timestamp: float = Field(
        ...,
        description="Current timestamp"
    )
    
    uptime: float = Field(
        ...,
        description="Service uptime in seconds"
    )


class InfoResponse(BaseModel):
    """API information response."""
    
    message: str = Field(
        ...,
        description="Welcome message"
    )
    
    version: str = Field(
        ...,
        description="API version"
    )
    
    description: str = Field(
        ...,
        description="API description"
    )
    
    docs_url: Optional[str] = Field(
        None,
        description="Documentation URL"
    )
    
    health_url: str = Field(
        ...,
        description="Health check URL"
    )
    
    api_prefix: str = Field(
        ...,
        description="API prefix"
    )
    
    endpoints: Dict[str, str] = Field(
        ...,
        description="Available endpoints"
    )