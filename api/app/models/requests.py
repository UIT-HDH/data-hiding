"""
Pydantic models for API request validation.

This module defines all request models used by the FastAPI endpoints
for steganography operations including embedding, extraction, batch
processing, and analysis with comprehensive validation.
"""

from typing import Optional, List, Dict, Any, Union
from enum import Enum
from pydantic import BaseModel, Field, validator, root_validator
import base64


class AlgorithmType(str, Enum):
    """Supported steganography algorithms."""
    LSB = "lsb"                    # Least Significant Bit
    LSB_ENHANCED = "lsb_enhanced"  # Enhanced LSB with better security
    DCT = "dct"                    # Discrete Cosine Transform
    DWT = "dwt"                    # Discrete Wavelet Transform
    PVD = "pvd"                    # Pixel Value Differencing
    EDGE_ADAPTIVE = "edge_adaptive" # Edge Adaptive


class ColorChannel(str, Enum):
    """Color channels for embedding."""
    RED = "red"
    GREEN = "green"
    BLUE = "blue"
    ALL = "all"
    AUTO = "auto"  # Automatically select best channel


class OutputFormat(str, Enum):
    """Output format options."""
    BASE64 = "base64"
    JSON = "json"
    BINARY = "binary"


class CompressionType(str, Enum):
    """Data compression options."""
    NONE = "none"
    GZIP = "gzip"
    LZMA = "lzma"
    BZIP2 = "bzip2"


class EncryptionType(str, Enum):
    """Encryption options for secret data."""
    NONE = "none"
    AES = "aes"
    CHACHA20 = "chacha20"
    FERNET = "fernet"


# Base request models

class BaseRequest(BaseModel):
    """Base request model with common fields."""
    
    request_id: Optional[str] = Field(
        None,
        description="Optional request identifier for tracking"
    )
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        validate_assignment = True
        extra = "forbid"


class ImageData(BaseModel):
    """Model for image data input."""
    
    data: str = Field(
        ...,
        description="Base64 encoded image data",
        min_length=1
    )
    
    filename: Optional[str] = Field(
        None,
        description="Original filename",
        max_length=255
    )
    
    format: Optional[str] = Field(
        None,
        description="Image format (png, jpg, etc.)",
        regex=r"^(png|jpg|jpeg|bmp|tiff|gif|webp)$"
    )
    
    @validator("data")
    def validate_base64(cls, v):
        """Validate base64 encoded data."""
        try:
            # Check if it's valid base64
            base64.b64decode(v, validate=True)
            return v
        except Exception:
            raise ValueError("Invalid base64 encoded data")
    
    @validator("filename")
    def validate_filename(cls, v):
        """Validate filename format."""
        if v is None:
            return v
        
        # Check for dangerous characters
        dangerous_chars = ["../", "..\\", "<", ">", ":", "\"", "|", "?", "*"]
        for char in dangerous_chars:
            if char in v:
                raise ValueError(f"Invalid character '{char}' in filename")
        
        return v


class SecretData(BaseModel):
    """Model for secret data to be embedded."""
    
    content: str = Field(
        ...,
        description="Secret data content (text or base64 encoded binary)",
        min_length=1
    )
    
    is_binary: bool = Field(
        False,
        description="Whether content is base64 encoded binary data"
    )
    
    filename: Optional[str] = Field(
        None,
        description="Filename for binary data",
        max_length=255
    )
    
    compression: CompressionType = Field(
        CompressionType.NONE,
        description="Compression method for secret data"
    )
    
    encryption: EncryptionType = Field(
        EncryptionType.NONE,
        description="Encryption method for secret data"
    )
    
    password: Optional[str] = Field(
        None,
        description="Password for encryption (if encryption is enabled)",
        min_length=8,
        max_length=256
    )
    
    @root_validator
    def validate_encryption_password(cls, values):
        """Validate encryption and password requirements."""
        encryption = values.get("encryption")
        password = values.get("password")
        
        if encryption and encryption != EncryptionType.NONE:
            if not password:
                raise ValueError("Password is required when encryption is enabled")
        
        return values
    
    @validator("content")
    def validate_content_size(cls, v):
        """Validate content size limits."""
        # Basic size check (before compression/encryption)
        if len(v) > 10 * 1024 * 1024:  # 10MB limit
            raise ValueError("Secret data too large (max 10MB)")
        
        return v


class EmbeddingParameters(BaseModel):
    """Parameters for steganography embedding."""
    
    algorithm: AlgorithmType = Field(
        AlgorithmType.LSB,
        description="Steganography algorithm to use"
    )
    
    color_channel: ColorChannel = Field(
        ColorChannel.AUTO,
        description="Color channel(s) to use for embedding"
    )
    
    quality: int = Field(
        80,
        description="Output quality (1-100, higher = better quality)",
        ge=1,
        le=100
    )
    
    randomize: bool = Field(
        True,
        description="Use random embedding pattern for security"
    )
    
    seed: Optional[int] = Field(
        None,
        description="Random seed for reproducible embedding",
        ge=0
    )
    
    capacity_check: bool = Field(
        True,
        description="Check image capacity before embedding"
    )
    
    preserve_metadata: bool = Field(
        False,
        description="Preserve original image metadata"
    )
    
    # Algorithm-specific parameters
    lsb_bits: int = Field(
        1,
        description="Number of LSB bits to use (1-8)",
        ge=1,
        le=8
    )
    
    dct_quality: int = Field(
        90,
        description="DCT compression quality",
        ge=1,
        le=100
    )
    
    wavelet_type: str = Field(
        "haar",
        description="Wavelet type for DWT algorithm",
        regex=r"^(haar|db\d+|bior\d+\.\d+|coif\d+|dmey)$"
    )
    
    edge_threshold: float = Field(
        0.1,
        description="Edge detection threshold (0.0-1.0)",
        ge=0.0,
        le=1.0
    )


class ExtractionParameters(BaseModel):
    """Parameters for steganography extraction."""
    
    algorithm: AlgorithmType = Field(
        AlgorithmType.LSB,
        description="Steganography algorithm used for embedding"
    )
    
    color_channel: ColorChannel = Field(
        ColorChannel.AUTO,
        description="Color channel(s) used for embedding"
    )
    
    seed: Optional[int] = Field(
        None,
        description="Random seed used during embedding",
        ge=0
    )
    
    password: Optional[str] = Field(
        None,
        description="Password for decryption (if data was encrypted)",
        min_length=8,
        max_length=256
    )
    
    verify_integrity: bool = Field(
        True,
        description="Verify data integrity after extraction"
    )
    
    # Algorithm-specific parameters
    lsb_bits: int = Field(
        1,
        description="Number of LSB bits used (1-8)",
        ge=1,
        le=8
    )
    
    wavelet_type: str = Field(
        "haar",
        description="Wavelet type for DWT algorithm",
        regex=r"^(haar|db\d+|bior\d+\.\d+|coif\d+|dmey)$"
    )
    
    edge_threshold: float = Field(
        0.1,
        description="Edge detection threshold (0.0-1.0)",
        ge=0.0,
        le=1.0
    )


# Main API request models

class EmbedRequest(BaseRequest):
    """Request model for the /embed endpoint."""
    
    cover_image: ImageData = Field(
        ...,
        description="Cover image for steganography embedding"
    )
    
    secret_data: SecretData = Field(
        ...,
        description="Secret data to embed in the image"
    )
    
    parameters: EmbeddingParameters = Field(
        default_factory=EmbeddingParameters,
        description="Embedding algorithm parameters"
    )
    
    output_format: OutputFormat = Field(
        OutputFormat.BASE64,
        description="Output format for stego image"
    )
    
    include_metrics: bool = Field(
        True,
        description="Include embedding metrics in response"
    )
    
    include_maps: bool = Field(
        False,
        description="Include complexity/embedding maps in response"
    )


class ExtractRequest(BaseRequest):
    """Request model for the /extract endpoint."""
    
    stego_image: ImageData = Field(
        ...,
        description="Steganography image containing hidden data"
    )
    
    parameters: ExtractionParameters = Field(
        default_factory=ExtractionParameters,
        description="Extraction algorithm parameters"
    )
    
    output_format: OutputFormat = Field(
        OutputFormat.JSON,
        description="Output format for extracted data"
    )
    
    include_integrity: bool = Field(
        True,
        description="Include integrity check results"
    )


class BatchConfig(BaseModel):
    """Configuration for batch processing."""
    
    parameters: EmbeddingParameters = Field(
        default_factory=EmbeddingParameters,
        description="Default embedding parameters for all images"
    )
    
    output_format: OutputFormat = Field(
        OutputFormat.JSON,
        description="Output format for results"
    )
    
    fail_fast: bool = Field(
        False,
        description="Stop processing on first failure"
    )
    
    include_metrics: bool = Field(
        True,
        description="Include metrics for each processed image"
    )
    
    parallel_processing: bool = Field(
        True,
        description="Enable parallel processing of images"
    )
    
    max_workers: int = Field(
        4,
        description="Maximum number of worker threads",
        ge=1,
        le=16
    )


class BatchItem(BaseModel):
    """Individual item in batch processing."""
    
    id: str = Field(
        ...,
        description="Unique identifier for this item",
        min_length=1,
        max_length=100
    )
    
    cover_image: ImageData = Field(
        ...,
        description="Cover image for this item"
    )
    
    secret_data: SecretData = Field(
        ...,
        description="Secret data for this item"
    )
    
    parameters: Optional[EmbeddingParameters] = Field(
        None,
        description="Override parameters for this item"
    )


class BatchEmbedRequest(BaseRequest):
    """Request model for the /batch/embed endpoint."""
    
    items: List[BatchItem] = Field(
        ...,
        description="List of items to process",
        min_items=1,
        max_items=100
    )
    
    config: BatchConfig = Field(
        default_factory=BatchConfig,
        description="Batch processing configuration"
    )
    
    @validator("items")
    def validate_unique_ids(cls, v):
        """Ensure all item IDs are unique."""
        ids = [item.id for item in v]
        if len(ids) != len(set(ids)):
            raise ValueError("All item IDs must be unique")
        return v


class ComplexityAnalysisRequest(BaseRequest):
    """Request model for the /analysis/complexity endpoint."""
    
    image: ImageData = Field(
        ...,
        description="Image to analyze"
    )
    
    analysis_types: List[str] = Field(
        ["entropy", "gradient", "texture", "edges"],
        description="Types of complexity analysis to perform"
    )
    
    generate_maps: bool = Field(
        True,
        description="Generate visual complexity maps"
    )
    
    map_resolution: int = Field(
        256,
        description="Resolution for generated maps",
        ge=64,
        le=2048
    )
    
    include_statistics: bool = Field(
        True,
        description="Include statistical analysis"
    )
    
    normalize_maps: bool = Field(
        True,
        description="Normalize map values to 0-1 range"
    )
    
    @validator("analysis_types")
    def validate_analysis_types(cls, v):
        """Validate analysis type options."""
        valid_types = {"entropy", "gradient", "texture", "edges", "frequency", "spatial"}
        
        for analysis_type in v:
            if analysis_type not in valid_types:
                raise ValueError(f"Invalid analysis type: {analysis_type}")
        
        return v