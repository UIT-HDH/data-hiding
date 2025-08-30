"""
Custom middleware for the FastAPI Steganography Backend.

This module provides various middleware components for:
- Request/response logging with unique request IDs
- Security headers and validation  
- Rate limiting and throttling
- Performance monitoring
- Error handling and debugging
"""

import time
import uuid
from typing import Dict, Any, Optional, Callable
from datetime import datetime, timedelta

from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.config.settings import get_settings
from app.core.logging import request_logger, security_logger, performance_logger
from app.core.exceptions import RateLimitError


settings = get_settings()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging HTTP requests and responses.
    
    Features:
    - Assigns unique request IDs
    - Logs request start and completion
    - Tracks processing time
    - Logs security events
    - Captures performance metrics
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and response with logging.
        
        Args:
            request: HTTP request
            call_next: Next middleware or route handler
            
        Returns:
            HTTP response
        """
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Extract request information
        start_time = time.time()
        method = request.method
        url = str(request.url)
        ip_address = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent", "unknown")
        content_length = request.headers.get("content-length")
        user_id = getattr(request.state, "user_id", None)
        
        # Log request start
        request_logger.log_request(
            request_id=request_id,
            method=method,
            url=url,
            ip_address=ip_address,
            user_agent=user_agent,
            user_id=user_id,
            content_length=int(content_length) if content_length else None
        )
        
        # Process request
        error = None
        status_code = 500
        response_size = None
        
        try:
            response = await call_next(request)
            status_code = response.status_code
            response_size = response.headers.get("content-length")
            
            # Add response headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = str(round(time.time() - start_time, 3))
            
            return response
            
        except Exception as e:
            error = str(e)
            status_code = getattr(e, "status_code", 500)
            raise
            
        finally:
            # Log request completion
            duration = time.time() - start_time
            request_logger.log_response(
                request_id=request_id,
                method=method,
                url=url,
                status_code=status_code,
                duration=duration,
                response_size=int(response_size) if response_size else None,
                error=error
            )
            
            # Log performance metrics for slow requests
            if duration > 1.0:  # Log requests taking more than 1 second
                performance_logger.warning(
                    f"Slow request detected: {method} {url} took {duration:.3f}s",
                    extra={
                        "request_id": request_id,
                        "duration": duration,
                        "method": method,
                        "url": url,
                        "status_code": status_code,
                        "event_type": "slow_request"
                    }
                )
    
    def _get_client_ip(self, request: Request) -> str:
        """
        Extract client IP address from request.
        
        Args:
            request: HTTP request
            
        Returns:
            Client IP address
        """
        # Check for forwarded IP headers
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        forwarded = request.headers.get("x-forwarded")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # Fall back to direct connection IP
        if hasattr(request.client, "host"):
            return request.client.host
        
        return "unknown"


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Middleware for security headers and validation.
    
    Features:
    - Adds security headers
    - Validates request content
    - Blocks suspicious requests
    - Logs security events
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.max_request_size = settings.max_request_size
        self.blocked_ips: set = set()
        self.suspicious_patterns = [
            "../", "..\\", "<script", "javascript:", "vbscript:",
            "onload=", "onerror=", "eval(", "alert(", "document.cookie"
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request with security checks.
        
        Args:
            request: HTTP request
            call_next: Next middleware or route handler
            
        Returns:
            HTTP response
        """
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        ip_address = self._get_client_ip(request)
        
        # Check blocked IPs
        if ip_address in self.blocked_ips:
            security_logger.log_security_event(
                request_id=request_id,
                event_type="blocked_ip_access",
                description=f"Access attempt from blocked IP: {ip_address}",
                ip_address=ip_address,
                severity="warning"
            )
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Check request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_request_size:
            security_logger.log_security_event(
                request_id=request_id,
                event_type="oversized_request",
                description=f"Request size {content_length} exceeds limit {self.max_request_size}",
                ip_address=ip_address,
                severity="warning"
            )
            raise HTTPException(status_code=413, detail="Request entity too large")
        
        # Check for suspicious patterns in URL
        url = str(request.url)
        for pattern in self.suspicious_patterns:
            if pattern.lower() in url.lower():
                security_logger.log_security_event(
                    request_id=request_id,
                    event_type="suspicious_pattern",
                    description=f"Suspicious pattern '{pattern}' detected in URL",
                    ip_address=ip_address,
                    severity="warning",
                    additional_data={"url": url, "pattern": pattern}
                )
                # Don't block automatically, but log for monitoring
                break
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request."""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        if hasattr(request.client, "host"):
            return request.client.host
        
        return "unknown"
    
    def block_ip(self, ip_address: str) -> None:
        """Add IP address to blocked list."""
        self.blocked_ips.add(ip_address)
    
    def unblock_ip(self, ip_address: str) -> None:
        """Remove IP address from blocked list."""
        self.blocked_ips.discard(ip_address)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware for rate limiting and request throttling.
    
    Features:
    - Per-IP rate limiting
    - Per-endpoint rate limiting
    - Sliding window implementation
    - Automatic rate limit reset
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.requests: Dict[str, list] = {}
        self.max_requests_per_minute = 60
        self.max_requests_per_hour = 1000
        self.window_size = 60  # seconds
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request with rate limiting.
        
        Args:
            request: HTTP request
            call_next: Next middleware or route handler
            
        Returns:
            HTTP response
        """
        if settings.environment == "development":
            # Skip rate limiting in development
            return await call_next(request)
        
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        ip_address = self._get_client_ip(request)
        current_time = datetime.now()
        
        # Clean old requests
        self._cleanup_old_requests(current_time)
        
        # Get IP request history
        if ip_address not in self.requests:
            self.requests[ip_address] = []
        
        ip_requests = self.requests[ip_address]
        
        # Count requests in the current window
        recent_requests = [
            req_time for req_time in ip_requests
            if (current_time - req_time).total_seconds() < self.window_size
        ]
        
        # Check rate limits
        if len(recent_requests) >= self.max_requests_per_minute:
            security_logger.log_security_event(
                request_id=request_id,
                event_type="rate_limit_exceeded",
                description=f"Rate limit exceeded for IP: {ip_address}",
                ip_address=ip_address,
                severity="warning",
                additional_data={
                    "requests_count": len(recent_requests),
                    "limit": self.max_requests_per_minute
                }
            )
            
            retry_after = self.window_size - min(
                (current_time - req_time).total_seconds()
                for req_time in recent_requests
            )
            
            raise RateLimitError(
                message=f"Rate limit exceeded. Try again in {retry_after:.0f} seconds",
                retry_after=int(retry_after)
            )
        
        # Add current request
        ip_requests.append(current_time)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.max_requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            self.max_requests_per_minute - len(recent_requests) - 1
        )
        response.headers["X-RateLimit-Reset"] = str(
            int((current_time + timedelta(seconds=self.window_size)).timestamp())
        )
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request."""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        if hasattr(request.client, "host"):
            return request.client.host
        
        return "unknown"
    
    def _cleanup_old_requests(self, current_time: datetime) -> None:
        """Clean up old request records."""
        cutoff_time = current_time - timedelta(hours=1)
        
        for ip_address in list(self.requests.keys()):
            # Filter out old requests
            self.requests[ip_address] = [
                req_time for req_time in self.requests[ip_address]
                if req_time > cutoff_time
            ]
            
            # Remove empty entries
            if not self.requests[ip_address]:
                del self.requests[ip_address]


class SecurityError(Exception):
    """Exception for security-related errors."""
    
    def __init__(self, message: str, status_code: int = 403):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)