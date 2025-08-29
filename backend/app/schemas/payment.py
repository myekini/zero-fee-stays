from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from decimal import Decimal


class PaymentIntentCreate(BaseModel):
    """Schema for creating a payment intent"""
    amount: Decimal = Field(..., gt=0, description="Payment amount in cents")
    currency: str = Field(default="usd", description="Payment currency")
    booking_id: str = Field(..., description="Associated booking ID")
    customer_email: str = Field(..., description="Customer email")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")
    
    @validator('currency')
    def validate_currency(cls, v):
        allowed_currencies = ['usd', 'eur', 'gbp', 'cad']
        if v.lower() not in allowed_currencies:
            raise ValueError(f'Currency must be one of {allowed_currencies}')
        return v.lower()


class PaymentIntentResponse(BaseModel):
    """Schema for payment intent response"""
    id: str = Field(..., description="Payment intent ID")
    amount: int = Field(..., description="Amount in cents")
    currency: str = Field(..., description="Currency")
    status: str = Field(..., description="Payment status")
    client_secret: str = Field(..., description="Client secret for frontend")
    created: datetime = Field(..., description="Creation timestamp")
    booking_id: str = Field(..., description="Associated booking ID")


class PaymentConfirmation(BaseModel):
    """Schema for payment confirmation"""
    payment_intent_id: str = Field(..., description="Payment intent ID")
    booking_id: str = Field(..., description="Booking ID")
    amount: int = Field(..., description="Amount in cents")
    currency: str = Field(..., description="Currency")


class PaymentWebhook(BaseModel):
    """Schema for Stripe webhook events"""
    type: str = Field(..., description="Event type")
    data: Dict[str, Any] = Field(..., description="Event data")
    created: datetime = Field(..., description="Event creation timestamp")


class PaymentStatus(BaseModel):
    """Schema for payment status"""
    payment_id: str = Field(..., description="Payment ID")
    status: str = Field(..., description="Payment status")
    amount: int = Field(..., description="Amount in cents")
    currency: str = Field(..., description="Currency")
    booking_id: str = Field(..., description="Associated booking ID")
    created: datetime = Field(..., description="Creation timestamp")
    updated: datetime = Field(..., description="Last update timestamp")
