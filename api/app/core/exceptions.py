"""
Custom exception classes for the FastAPI Steganography Backend.

This module defines all custom exceptions used throughout the application
with specific error codes, messages, and HTTP status codes for proper
API error handling and user feedback.
"""

from typing import Optional, Dict, Any


class SteganographyException(Exception):
    """
    Base exception class for all steganography-related errors.
    
    Attributes:
        message: Human-readable error message
        error_code: Unique error code for API responses
        status_code: HTTP status code
        details: Additional error details
    """
    
    def __init__(
        self, 
        message: str, 
        error_code: str = "STEGANOGRAPHY_ERROR",
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class FileValidationError(SteganographyException):
    """
    Exception raised when file validation fails.
    
    Used for:
    - Invalid file formats
    - Corrupted files
    - Unsupported file types
    - File size violations
    """
    
    def __init__(
        self, 
        message: str = "File validation failed",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            error_code="FILE_VALIDATION_ERROR",
            status_code=400,
            details=details
        )


class InvalidImageError(FileValidationError):
    """Exception raised when image file is invalid or corrupted."""
    
    def __init__(
        self, 
        message: str = "Invalid or corrupted image file",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            details=details
        )


class UnsupportedFormatError(FileValidationError):
    """Exception raised when file format is not supported."""
    
    def __init__(
        self, 
        format_type: str,
        supported_formats: Optional[list] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if supported_formats:
            message = f"Unsupported format '{format_type}'. Supported formats: {', '.join(supported_formats)}"
        else:
            message = f"Unsupported format: {format_type}"
            
        super().__init__(
            message=message,
            details=details or {"format": format_type, "supported_formats": supported_formats}
        )


class FileSizeError(FileValidationError):
    """Exception raised when file size exceeds limits."""
    
    def __init__(
        self, 
        file_size: int, 
        max_size: int,
        details: Optional[Dict[str, Any]] = None
    ):
        message = f"File size ({file_size} bytes) exceeds maximum allowed size ({max_size} bytes)"
        super().__init__(
            message=message,
            details=details or {"file_size": file_size, "max_size": max_size}
        )


class PayloadTooLargeError(SteganographyException):
    """
    Exception raised when payload is too large to fit in the cover image.
    
    Used when the secret data is larger than the capacity of the cover image.
    """
    
    def __init__(
        self, 
        payload_size: int, 
        capacity: int,
        details: Optional[Dict[str, Any]] = None
    ):
        message = f"Payload size ({payload_size} bytes) exceeds image capacity ({capacity} bytes)"
        super().__init__(
            message=message,
            error_code="PAYLOAD_TOO_LARGE",
            status_code=400,
            details=details or {"payload_size": payload_size, "capacity": capacity}
        )


class ProcessingError(SteganographyException):
    """
    Exception raised during steganography processing operations.
    
    Used for:
    - Embedding failures
    - Extraction failures
    - Image processing errors
    - Algorithm-specific errors
    """
    
    def __init__(
        self, 
        message: str = "Processing operation failed",
        operation: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            error_code="PROCESSING_ERROR",
            status_code=500,
            details=details or {"operation": operation}
        )


class EmbeddingError(ProcessingError):
    """Exception raised during data embedding operations."""
    
    def __init__(
        self, 
        message: str = "Failed to embed data into image",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            operation="embedding",
            details=details
        )


class ExtractionError(ProcessingError):
    """Exception raised during data extraction operations."""
    
    def __init__(
        self, 
        message: str = "Failed to extract data from image",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            operation="extraction",
            details=details
        )


class AnalysisError(ProcessingError):
    """Exception raised during complexity analysis operations."""
    
    def __init__(
        self, 
        message: str = "Failed to analyze image complexity",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            operation="analysis",
            details=details
        )


class ParameterError(SteganographyException):
    """
    Exception raised when parameters are invalid or missing.
    
    Used for:
    - Invalid algorithm parameters
    - Missing required parameters
    - Parameter value validation
    """
    
    def __init__(
        self, 
        parameter: str,
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if not message:
            message = f"Invalid parameter: {parameter}"
        
        super().__init__(
            message=message,
            error_code="PARAMETER_ERROR",
            status_code=400,
            details=details or {"parameter": parameter}
        )


class AuthenticationError(SteganographyException):
    """Exception raised for authentication-related errors."""
    
    def __init__(
        self, 
        message: str = "Authentication failed",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            status_code=401,
            details=details
        )


class AuthorizationError(SteganographyException):
    """Exception raised for authorization-related errors."""
    
    def __init__(
        self, 
        message: str = "Access denied",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            error_code="AUTHORIZATION_ERROR",
            status_code=403,
            details=details
        )


class RateLimitError(SteganographyException):
    """Exception raised when rate limit is exceeded."""
    
    def __init__(
        self, 
        message: str = "Rate limit exceeded",
        retry_after: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            error_code="RATE_LIMIT_ERROR",
            status_code=429,
            details=details or {"retry_after": retry_after}
        )


class TimeoutError(SteganographyException):
    """Exception raised when operation times out."""
    
    def __init__(
        self, 
        operation: str,
        timeout: int,
        details: Optional[Dict[str, Any]] = None
    ):
        message = f"Operation '{operation}' timed out after {timeout} seconds"
        super().__init__(
            message=message,
            error_code="TIMEOUT_ERROR",
            status_code=408,
            details=details or {"operation": operation, "timeout": timeout}
        )


class ServiceUnavailableError(SteganographyException):
    """Exception raised when service is temporarily unavailable."""
    
    def __init__(
        self, 
        message: str = "Service temporarily unavailable",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            error_code="SERVICE_UNAVAILABLE",
            status_code=503,
            details=details
        )


class ConfigurationError(SteganographyException):
    """Exception raised for configuration-related errors."""
    
    def __init__(
        self, 
        parameter: str,
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if not message:
            message = f"Configuration error: {parameter}"
        
        super().__init__(
            message=message,
            error_code="CONFIGURATION_ERROR",
            status_code=500,
            details=details or {"parameter": parameter}
        )


# Exception mapping for easier usage
EXCEPTION_MAP = {
    "file_validation": FileValidationError,
    "invalid_image": InvalidImageError,
    "unsupported_format": UnsupportedFormatError,
    "file_size": FileSizeError,
    "payload_too_large": PayloadTooLargeError,
    "processing": ProcessingError,
    "embedding": EmbeddingError,
    "extraction": ExtractionError,
    "analysis": AnalysisError,
    "parameter": ParameterError,
    "authentication": AuthenticationError,
    "authorization": AuthorizationError,
    "rate_limit": RateLimitError,
    "timeout": TimeoutError,
    "service_unavailable": ServiceUnavailableError,
    "configuration": ConfigurationError,
}


def get_exception_class(exception_type: str) -> type:
    """
    Get exception class by type name.
    
    Args:
        exception_type: Type of exception
        
    Returns:
        Exception class
        
    Raises:
        KeyError: If exception type is not found
    """
    return EXCEPTION_MAP[exception_type]


def create_exception(
    exception_type: str, 
    message: str, 
    **kwargs
) -> SteganographyException:
    """
    Create exception instance by type.
    
    Args:
        exception_type: Type of exception
        message: Error message
        **kwargs: Additional arguments for the exception
        
    Returns:
        Exception instance
        
    Raises:
        KeyError: If exception type is not found
    """
    exception_class = get_exception_class(exception_type)
    return exception_class(message, **kwargs)