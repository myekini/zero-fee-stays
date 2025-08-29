from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, TypeVar, Generic
from app.core.logging import get_logger
from app.core.exceptions import HiddyStaysException

T = TypeVar('T')


class BaseService(ABC, Generic[T]):
    """Base service class with common functionality"""
    
    def __init__(self):
        self.logger = get_logger(self.__class__.__name__)
    
    @abstractmethod
    async def create(self, data: Dict[str, Any]) -> T:
        """Create a new resource"""
        pass
    
    @abstractmethod
    async def get_by_id(self, id: str) -> Optional[T]:
        """Get resource by ID"""
        pass
    
    @abstractmethod
    async def update(self, id: str, data: Dict[str, Any]) -> Optional[T]:
        """Update a resource"""
        pass
    
    @abstractmethod
    async def delete(self, id: str) -> bool:
        """Delete a resource"""
        pass
    
    @abstractmethod
    async def list(self, filters: Optional[Dict[str, Any]] = None, 
                   pagination: Optional[Dict[str, Any]] = None) -> List[T]:
        """List resources with optional filtering and pagination"""
        pass
    
    def validate_data(self, data: Dict[str, Any]) -> bool:
        """Validate input data"""
        if not data:
            raise HiddyStaysException("Data cannot be empty")
        return True
    
    def handle_error(self, error: Exception, context: str = "") -> None:
        """Handle and log errors"""
        self.logger.error(f"Error in {context}: {str(error)}")
        if isinstance(error, HiddyStaysException):
            raise error
        raise HiddyStaysException(f"An error occurred: {str(error)}")
