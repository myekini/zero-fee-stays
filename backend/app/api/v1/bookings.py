from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Dict, Any, Optional, List
from datetime import date
from app.core.logging import get_logger
from app.core.exceptions import BookingException, DatabaseException, HiddyStaysException
from app.schemas.booking import (
    BookingCreate, 
    BookingUpdate, 
    BookingResponse, 
    BookingListResponse,
    BookingStatus
)
from app.schemas.base import DataResponse, ListResponse, PaginationParams
from fastapi.responses import JSONResponse
from app.services.booking_service import booking_service

router = APIRouter()
logger = get_logger(__name__)


@router.post("/create")
async def create_booking(booking_data: Dict[str, Any]):
    """Create a new booking"""
    try:
        property_id = booking_data.get('propertyId', booking_data.get('property_id'))
        logger.info(f"Creating booking for property {property_id}")
        
        booking = await booking_service.create_booking(booking_data)
        
        # Return format expected by frontend using JSONResponse to bypass validation
        response_data = {
            "bookingId": booking.id,
            "status": "pending", 
            "message": "Booking created successfully"
        }
        
        return JSONResponse(content=response_data, status_code=200)
        
    except BookingException as e:
        logger.error(f"Booking exception: {str(e)}")
        return JSONResponse(
            content={"error": e.message, "details": e.details},
            status_code=e.status_code
        )
    except Exception as e:
        logger.error(f"Unexpected error creating booking: {str(e)}")
        return JSONResponse(
            content={"error": "Internal server error", "details": str(e)},
            status_code=500
        )


@router.get("/{booking_id}", response_model=DataResponse[BookingResponse])
async def get_booking(booking_id: str):
    """Get booking by ID"""
    try:
        logger.info(f"Retrieving booking: {booking_id}")
        
        booking = await booking_service.get_booking(booking_id)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": "Booking not found"}
            )
        
        return DataResponse(
            success=True,
            message="Booking retrieved successfully",
            data=booking
        )
        
    except HTTPException:
        raise
    except DatabaseException as e:
        logger.error(f"Database exception: {str(e)}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )


@router.put("/{booking_id}", response_model=DataResponse[BookingResponse])
async def update_booking(booking_id: str, booking_data: BookingUpdate):
    """Update booking"""
    try:
        logger.info(f"Updating booking: {booking_id}")
        
        booking = await booking_service.update_booking(booking_id, booking_data)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": "Booking not found"}
            )
        
        return DataResponse(
            success=True,
            message="Booking updated successfully",
            data=booking
        )
        
    except HTTPException:
        raise
    except DatabaseException as e:
        logger.error(f"Database exception: {str(e)}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    except Exception as e:
        logger.error(f"Unexpected error updating booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )


@router.delete("/{booking_id}")
async def cancel_booking(booking_id: str):
    """Cancel booking (soft delete)"""
    try:
        logger.info(f"Cancelling booking: {booking_id}")
        
        success = await booking_service.delete(booking_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": "Booking not found or could not be cancelled"}
            )
        
        return DataResponse(
            success=True,
            message="Booking cancelled successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error cancelling booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )


@router.put("/{booking_id}/status")
async def update_booking_status(booking_id: str, status_update: Dict[str, Any]):
    """Update booking status"""
    try:
        new_status = status_update.get("status")
        payment_intent_id = status_update.get("payment_intent_id")
        logger.info(f"Updating booking {booking_id} status to {new_status}")
        
        success = await booking_service.update_booking_status(
            booking_id, 
            new_status,
            payment_intent_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": "Booking not found"}
            )
        
        return DataResponse(
            success=True,
            message="Booking status updated successfully",
            data={"booking_id": booking_id, "status": new_status, "payment_intent_id": payment_intent_id}
        )
        
    except HTTPException:
        raise
    except DatabaseException as e:
        logger.error(f"Database exception: {str(e)}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    except Exception as e:
        logger.error(f"Unexpected error updating booking status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )


@router.get("/user/{user_id}/bookings")
async def get_user_bookings(
    user_id: str,
    user_type: str = Query("guest", regex="^(guest|host)$"),
    status: Optional[str] = Query(None, description="Filter by booking status"),
    pagination: PaginationParams = Depends()
):
    """Get bookings for a user (guest or host)"""
    try:
        logger.info(f"Retrieving {user_type} bookings for user: {user_id}")
        
        bookings = await booking_service.get_user_bookings(user_id, user_type, status)
        
        # Apply pagination
        start_idx = (pagination.page - 1) * pagination.size
        end_idx = start_idx + pagination.size
        paginated_bookings = bookings[start_idx:end_idx]
        
        return ListResponse(
            success=True,
            message=f"{user_type.capitalize()} bookings retrieved successfully",
            data=paginated_bookings,
            total=len(bookings),
            page=pagination.page,
            size=pagination.size
        )
        
    except DatabaseException as e:
        logger.error(f"Database exception: {str(e)}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving user bookings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )


@router.get("/property/{property_id}/availability")
async def check_property_availability(
    property_id: str,
    check_in: date = Query(..., description="Check-in date"),
    check_out: date = Query(..., description="Check-out date")
):
    """Check if property is available for given dates"""
    try:
        logger.info(f"Checking availability for property {property_id}")
        
        if check_out <= check_in:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Check-out date must be after check-in date"}
            )
        
        is_available = await booking_service.check_availability(property_id, check_in, check_out)
        
        return DataResponse(
            success=True,
            message="Availability check completed",
            data={
                "property_id": property_id,
                "check_in": check_in.isoformat(),
                "check_out": check_out.isoformat(),
                "available": is_available
            }
        )
        
    except HTTPException:
        raise
    except DatabaseException as e:
        logger.error(f"Database exception: {str(e)}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    except Exception as e:
        logger.error(f"Unexpected error checking availability: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )
