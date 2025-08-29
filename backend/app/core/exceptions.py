from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class HiddyStaysException(Exception):
    """Base exception for HiddyStays application"""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class PaymentException(HiddyStaysException):
    """Exception for payment-related errors"""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code, details)


class BookingException(HiddyStaysException):
    """Exception for booking-related errors"""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code, details)


class DatabaseException(HiddyStaysException):
    """Exception for database-related errors"""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code, details)


class ValidationException(HiddyStaysException):
    """Exception for validation errors"""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_422_UNPROCESSABLE_ENTITY,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code, details)


class AuthenticationException(HiddyStaysException):
    """Exception for authentication errors"""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_401_UNAUTHORIZED,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code, details)


class AuthorizationException(HiddyStaysException):
    """Exception for authorization errors"""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_403_FORBIDDEN,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code, details)
