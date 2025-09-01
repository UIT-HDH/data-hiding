"""
Logging configuration for the FastAPI Steganography Backend.

This module provides comprehensive logging functionality including:
- Structured JSON logging
- Request/response logging with unique request IDs
- Performance monitoring
- Error tracking
- Security event logging
"""

import logging
import logging.config
import sys
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

from loguru import logger as loguru_logger
from app.config.settings import get_settings


settings = get_settings()


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging.
    
    Formats log records as JSON with consistent fields for
    easier parsing and analysis by log aggregation systems.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as JSON.
        
        Args:
            record: Log record to format
            
        Returns:
            JSON formatted log string
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields if present
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        
        if hasattr(record, "duration"):
            log_data["duration"] = record.duration
        
        if hasattr(record, "status_code"):
            log_data["status_code"] = record.status_code
        
        if hasattr(record, "method"):
            log_data["method"] = record.method
        
        if hasattr(record, "url"):
            log_data["url"] = record.url
        
        if hasattr(record, "ip_address"):
            log_data["ip_address"] = record.ip_address
        
        if hasattr(record, "user_agent"):
            log_data["user_agent"] = record.user_agent
        
        # Add exception information if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": self.formatException(record.exc_info)
            }
        
        # Add any additional extra fields
        for key, value in record.__dict__.items():
            if key not in {
                "name", "msg", "args", "levelname", "levelno", "pathname", 
                "filename", "module", "exc_info", "exc_text", "stack_info",
                "lineno", "funcName", "created", "msecs", "relativeCreated",
                "thread", "threadName", "processName", "process", "getMessage",
                "request_id", "user_id", "duration", "status_code", "method",
                "url", "ip_address", "user_agent"
            } and not key.startswith("_"):
                log_data[key] = value
        
        return json.dumps(log_data, ensure_ascii=False)


class TextFormatter(logging.Formatter):
    """Custom text formatter with consistent format."""
    
    def __init__(self):
        super().__init__(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )


def setup_logging() -> None:
    """
    Set up application logging configuration.
    
    Configures both standard Python logging and Loguru for
    comprehensive logging throughout the application.
    """
    # Clear any existing loggers
    loguru_logger.remove()
    
    # Determine log format
    if settings.log_format.lower() == "json":
        formatter_class = JSONFormatter
        loguru_format = (
            "{{\"timestamp\": \"{time:YYYY-MM-DD HH:mm:ss.SSS}\", "
            "\"level\": \"{level}\", "
            "\"logger\": \"{name}\", "
            "\"message\": \"{message}\", "
            "\"module\": \"{module}\", "
            "\"function\": \"{function}\", "
            "\"line\": {line}}}"
        )
    else:
        formatter_class = TextFormatter
        loguru_format = (
            "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | "
            "{name}:{line} | {message}"
        )
    
    # Configure Loguru logger
    loguru_logger.add(
        sys.stdout,
        format=loguru_format,
        level=settings.log_level.upper(),
        backtrace=True,
        diagnose=True,
    )
    
    # Add file handler for Loguru
    if settings.log_file:
        log_path = Path(settings.log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        loguru_logger.add(
            log_path,
            format=loguru_format,
            level=settings.log_level.upper(),
            rotation="100 MB",
            retention="30 days",
            compression="gz",
            backtrace=True,
            diagnose=True,
        )
    
    # Configure standard Python logging
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": JSONFormatter,
            },
            "text": {
                "()": TextFormatter,
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "json" if settings.log_format.lower() == "json" else "text",
                "stream": "ext://sys.stdout",
            },
        },
        "loggers": {
            "app": {
                "level": settings.log_level.upper(),
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
        },
        "root": {
            "level": settings.log_level.upper(),
            "handlers": ["console"],
        },
    }
    
    # Add file handler if specified
    if settings.log_file:
        log_path = Path(settings.log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        logging_config["handlers"]["file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": str(log_path),
            "maxBytes": 100 * 1024 * 1024,  # 100MB
            "backupCount": 30,
            "formatter": "json" if settings.log_format.lower() == "json" else "text",
        }
        
        # Add file handler to all loggers
        for logger_config in logging_config["loggers"].values():
            logger_config["handlers"].append("file")
        logging_config["root"]["handlers"].append("file")
    
    logging.config.dictConfig(logging_config)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        Logger instance
    """
    return logging.getLogger(name)


class RequestLogger:
    """
    Utility class for logging HTTP requests and responses.
    
    Provides methods for logging request/response cycles with
    performance metrics and security information.
    """
    
    def __init__(self, logger: logging.Logger):
        self.logger = logger
    
    def log_request(
        self,
        request_id: str,
        method: str,
        url: str,
        ip_address: str,
        user_agent: str,
        user_id: Optional[str] = None,
        content_length: Optional[int] = None,
    ) -> None:
        """
        Log incoming HTTP request.
        
        Args:
            request_id: Unique request identifier
            method: HTTP method
            url: Request URL
            ip_address: Client IP address
            user_agent: Client user agent
            user_id: User identifier (if authenticated)
            content_length: Request content length
        """
        self.logger.info(
            f"Request started: {method} {url}",
            extra={
                "request_id": request_id,
                "method": method,
                "url": url,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "user_id": user_id,
                "content_length": content_length,
                "event_type": "request_start",
            }
        )
    
    def log_response(
        self,
        request_id: str,
        method: str,
        url: str,
        status_code: int,
        duration: float,
        response_size: Optional[int] = None,
        error: Optional[str] = None,
    ) -> None:
        """
        Log HTTP response.
        
        Args:
            request_id: Unique request identifier
            method: HTTP method
            url: Request URL
            status_code: HTTP status code
            duration: Request processing time in seconds
            response_size: Response content length
            error: Error message (if any)
        """
        log_level = logging.INFO if status_code < 400 else logging.WARNING
        if status_code >= 500:
            log_level = logging.ERROR
        
        message = f"Request completed: {method} {url} - {status_code} ({duration:.3f}s)"
        if error:
            message += f" - {error}"
        
        self.logger.log(
            log_level,
            message,
            extra={
                "request_id": request_id,
                "method": method,
                "url": url,
                "status_code": status_code,
                "duration": duration,
                "response_size": response_size,
                "error": error,
                "event_type": "request_complete",
            }
        )
    
    def log_security_event(
        self,
        request_id: str,
        event_type: str,
        description: str,
        ip_address: str,
        severity: str = "warning",
        additional_data: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Log security-related events.
        
        Args:
            request_id: Unique request identifier
            event_type: Type of security event
            description: Event description
            ip_address: Client IP address
            severity: Event severity level
            additional_data: Additional event data
        """
        log_level = getattr(logging, severity.upper(), logging.WARNING)
        
        self.logger.log(
            log_level,
            f"Security event: {event_type} - {description}",
            extra={
                "request_id": request_id,
                "event_type": "security_event",
                "security_event_type": event_type,
                "ip_address": ip_address,
                "severity": severity,
                "additional_data": additional_data or {},
            }
        )


# Global logger instances
main_logger = get_logger("app.main")
api_logger = get_logger("app.api")
security_logger = get_logger("app.security")
performance_logger = get_logger("app.performance")

# Request logger instance
request_logger = RequestLogger(get_logger("app.requests"))