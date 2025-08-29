from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime, date


class BookingCreate(BaseModel):
    """Schema for creating a booking"""
    property_id: str = Field(..., description="Property ID")
    guest_id: str = Field(..., description="Guest user ID")
    host_id: str = Field(..., description="Host user ID")
    check_in: date = Field(..., description="Check-in date")
    check_out: date = Field(..., description="Check-out date")
    guests_count: int = Field(..., gt=0, le=20, description="Number of guests")
    total_amount: float = Field(..., gt=0, description="Total booking amount")
    currency: str = Field(default="usd", description="Currency")
    special_requests: Optional[str] = Field(None, description="Special requests")
    
    @validator('check_out')
    def validate_check_out(cls, v, values):
        if 'check_in' in values and v <= values['check_in']:
            raise ValueError('Check-out date must be after check-in date')
        return v
    
    @validator('currency')
    def validate_currency(cls, v):
        allowed_currencies = ['usd', 'eur', 'gbp', 'cad']
        if v.lower() not in allowed_currencies:
            raise ValueError(f'Currency must be one of {allowed_currencies}')
        return v.lower()


class BookingUpdate(BaseModel):
    """Schema for updating a booking"""
    check_in: Optional[date] = Field(None, description="Check-in date")
    check_out: Optional[date] = Field(None, description="Check-out date")
    guests_count: Optional[int] = Field(None, gt=0, le=20, description="Number of guests")
    total_amount: Optional[float] = Field(None, gt=0, description="Total booking amount")
    special_requests: Optional[str] = Field(None, description="Special requests")
    status: Optional[str] = Field(None, description="Booking status")


class BookingResponse(BaseModel):
    """Schema for booking response"""
    id: str = Field(..., description="Booking ID")
    property_id: str = Field(..., description="Property ID")
    guest_id: str = Field(..., description="Guest user ID")
    host_id: str = Field(..., description="Host user ID")
    check_in: date = Field(..., description="Check-in date")
    check_out: date = Field(..., description="Check-out date")
    guests_count: int = Field(..., description="Number of guests")
    total_amount: float = Field(..., description="Total booking amount")
    currency: str = Field(..., description="Currency")
    status: str = Field(..., description="Booking status")
    special_requests: Optional[str] = Field(None, description="Special requests")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    payment_status: Optional[str] = Field(None, description="Payment status")


class BookingListResponse(BaseModel):
    """Schema for booking list response"""
    bookings: List[BookingResponse] = Field(..., description="List of bookings")
    total: int = Field(..., description="Total number of bookings")
    page: int = Field(..., description="Current page")
    size: int = Field(..., description="Items per page")


class BookingStatus(BaseModel):
    """Schema for booking status"""
    booking_id: str = Field(..., description="Booking ID")
    status: str = Field(..., description="Booking status")
    updated_at: datetime = Field(..., description="Last update timestamp")
    notes: Optional[str] = Field(None, description="Status notes")
