from typing import Dict, Any, Optional, List
from datetime import datetime, date
from app.core.database import get_supabase_service
from app.core.logging import get_logger
from app.core.exceptions import BookingException, DatabaseException
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse, BookingStatus
from app.services.base import BaseService


class BookingService(BaseService[BookingResponse]):
    """Service for handling booking operations with Supabase"""
    
    def __init__(self):
        super().__init__()
        self.logger = get_logger(__name__)
    
    @property
    def client(self):
        """Get Supabase client"""
        try:
            return get_supabase_service()
        except Exception as e:
            self.logger.error(f"Failed to get Supabase client: {e}")
            return None
    
    @property 
    def is_connected(self) -> bool:
        """Check if connected to Supabase"""
        return self.client is not None
    
    async def create_booking(self, booking_data) -> BookingResponse:
        """Create a new booking"""
        try:
            # Handle both dict and object input
            if hasattr(booking_data, 'dict'):
                data_dict = booking_data.dict()
            else:
                data_dict = booking_data
            
            property_id = data_dict.get('propertyId', data_dict.get('property_id', 'unknown'))
            self.logger.info(f"Creating booking for property {property_id}")
            
            # Generate a unique booking ID
            booking_id = f"booking_{int(datetime.now().timestamp() * 1000)}"
            
            # Prepare booking data with defaults - match the schema expectations
            check_in = data_dict.get('checkIn', data_dict.get('check_in_date', '2024-01-01'))
            check_out = data_dict.get('checkOut', data_dict.get('check_out_date', '2024-01-02'))
            
            booking_dict = {
                "id": booking_id,
                "property_id": property_id,
                "guest_id": data_dict.get('guest_id', 'guest_1'),  # Default guest
                "host_id": data_dict.get('host_id', 'admin'),      # Default to admin as host
                "check_in": check_in,
                "check_out": check_out,
                "guests_count": data_dict.get('guests', data_dict.get('guests_count', 1)),
                "total_amount": float(data_dict.get('totalAmount', data_dict.get('total_amount', 0))),
                "currency": data_dict.get('currency', 'usd'),
                "status": "pending",
                "special_requests": data_dict.get('special_requests'),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "payment_status": None
            }
            
            if not self.is_connected:
                # Mock implementation for development
                self.logger.info(f"Mock booking created: {booking_dict['id']}")
                return BookingResponse(**booking_dict)
            
            # Real Supabase implementation
            result = self.client.table("bookings").insert(booking_dict).execute()
            
            if not result.data:
                raise BookingException("Failed to create booking")
            
            booking = result.data[0]
            self.logger.info(f"Booking created: {booking['id']}")
            
            return BookingResponse(**booking)
            
        except Exception as e:
            self.logger.error(f"Error creating booking: {str(e)}")
            if isinstance(e, BookingException):
                raise e
            raise BookingException(f"Failed to create booking: {str(e)}")
    
    async def get_booking(self, booking_id: str) -> Optional[BookingResponse]:
        """Get booking by ID"""
        try:
            self.logger.info(f"Retrieving booking: {booking_id}")
            
            if not self.is_connected:
                # Mock implementation
                mock_booking = {
                    "id": booking_id,
                    "property_id": "mock-property-1",
                    "guest_id": "mock-guest-1",
                    "host_id": "mock-host-1",
                    "check_in": "2024-01-01",
                    "check_out": "2024-01-03",
                    "guests_count": 2,
                    "total_amount": 200.0,
                    "currency": "usd",
                    "status": "confirmed",
                    "special_requests": None,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                    "payment_status": "paid"
                }
                return BookingResponse(**mock_booking)
            
            # Real Supabase implementation
            result = self.client.table("bookings").select("*").eq("id", booking_id).single().execute()
            
            if not result.data:
                return None
            
            return BookingResponse(**result.data)
            
        except Exception as e:
            self.logger.error(f"Error retrieving booking: {str(e)}")
            raise DatabaseException(f"Failed to retrieve booking: {str(e)}")
    
    async def update_booking(self, booking_id: str, booking_data: BookingUpdate) -> Optional[BookingResponse]:
        """Update booking"""
        try:
            self.logger.info(f"Updating booking: {booking_id}")
            
            if not self.is_connected:
                # Mock implementation
                self.logger.info(f"Mock: Updated booking {booking_id}")
                return await self.get_booking(booking_id)
            
            # Real Supabase implementation
            update_data = booking_data.dict(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = self.client.table("bookings").update(update_data).eq("id", booking_id).execute()
            
            if not result.data:
                return None
            
            return BookingResponse(**result.data[0])
            
        except Exception as e:
            self.logger.error(f"Error updating booking: {str(e)}")
            raise DatabaseException(f"Failed to update booking: {str(e)}")
    
    async def update_booking_status(self, booking_id: str, status: str, payment_intent_id: str = None) -> bool:
        """Update booking status and optionally payment intent ID"""
        try:
            self.logger.info(f"Updating booking {booking_id} status to {status}")
            
            if not self.is_connected:
                self.logger.info(f"Mock: Updated booking {booking_id} status to {status}")
                return True
            
            # Real Supabase implementation
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if payment_intent_id:
                update_data["stripe_payment_intent_id"] = payment_intent_id
            
            result = self.client.table("bookings").update(update_data).eq("id", booking_id).execute()
            
            return result.data is not None
            
        except Exception as e:
            self.logger.error(f"Error updating booking status: {str(e)}")
            raise DatabaseException(f"Failed to update booking status: {str(e)}")
    
    async def get_user_bookings(self, user_id: str, user_type: str = "guest", 
                               status: Optional[str] = None) -> List[BookingResponse]:
        """Get bookings for a user (guest or host)"""
        try:
            self.logger.info(f"Retrieving {user_type} bookings for user: {user_id}")
            
            if not self.is_connected:
                # Mock implementation
                mock_bookings = [
                    {
                        "id": f"booking_{i}",
                        "property_id": f"property_{i}",
                        "guest_id": user_id if user_type == "guest" else f"guest_{i}",
                        "host_id": user_id if user_type == "host" else f"host_{i}",
                        "check_in": "2024-01-01",
                        "check_out": "2024-01-03",
                        "guests_count": 2,
                        "total_amount": 200.0,
                        "currency": "usd",
                        "status": status or "confirmed",
                        "special_requests": None,
                        "created_at": datetime.utcnow().isoformat(),
                        "updated_at": datetime.utcnow().isoformat(),
                        "payment_status": "paid"
                    }
                    for i in range(1, 4)
                ]
                return [BookingResponse(**booking) for booking in mock_bookings]
            
            # Real Supabase implementation
            query = self.client.table("bookings").select("*")
            
            if user_type == "guest":
                query = query.eq("guest_id", user_id)
            else:
                query = query.eq("host_id", user_id)
            
            if status:
                query = query.eq("status", status)
            
            result = query.execute()
            
            return [BookingResponse(**booking) for booking in result.data]
            
        except Exception as e:
            self.logger.error(f"Error retrieving user bookings: {str(e)}")
            raise DatabaseException(f"Failed to retrieve user bookings: {str(e)}")
    
    async def check_availability(self, property_id: str, check_in: date, check_out: date) -> bool:
        """Check if property is available for given dates"""
        try:
            self.logger.info(f"Checking availability for property {property_id}")
            
            if not self.is_connected:
                # Mock implementation - always available
                return True
            
            # Real Supabase implementation
            result = self.client.table("bookings").select("id").eq("property_id", property_id).execute()
            
            # Check for overlapping bookings
            for booking in result.data:
                booking_check_in = datetime.fromisoformat(booking["check_in"]).date()
                booking_check_out = datetime.fromisoformat(booking["check_out"]).date()
                
                # Check for overlap
                if (check_in < booking_check_out and check_out > booking_check_in):
                    return False
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error checking availability: {str(e)}")
            raise DatabaseException(f"Failed to check availability: {str(e)}")
    
    # BaseService abstract method implementations
    async def create(self, data: Dict[str, Any]) -> BookingResponse:
        """Create a new booking from dictionary"""
        booking_data = BookingCreate(**data)
        return await self.create_booking(booking_data)
    
    async def get_by_id(self, id: str) -> Optional[BookingResponse]:
        """Get booking by ID"""
        return await self.get_booking(id)
    
    async def update(self, id: str, data: Dict[str, Any]) -> Optional[BookingResponse]:
        """Update booking from dictionary"""
        booking_data = BookingUpdate(**data)
        return await self.update_booking(id, booking_data)
    
    async def delete(self, id: str) -> bool:
        """Delete booking (soft delete by updating status)"""
        try:
            return await self.update_booking_status(id, "cancelled")
        except Exception as e:
            self.logger.error(f"Error deleting booking: {str(e)}")
            return False
    
    async def list(self, filters: Optional[Dict[str, Any]] = None, 
                   pagination: Optional[Dict[str, Any]] = None) -> List[BookingResponse]:
        """List bookings with filters and pagination"""
        try:
            # For now, return empty list - implement based on your needs
            return []
        except Exception as e:
            self.logger.error(f"Error listing bookings: {str(e)}")
            raise DatabaseException(f"Failed to list bookings: {str(e)}")


# Global service instance
booking_service = BookingService()
