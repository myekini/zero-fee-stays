from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, Any
from app.services.stripe_service import stripe_service
from app.services.supabase_service import supabase_service
import logging

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PaymentSessionRequest(BaseModel):
    bookingId: str
    propertyId: str
    propertyTitle: str
    totalAmount: float
    guestName: str
    guestEmail: str
    checkIn: str
    checkOut: str

class PaymentVerificationRequest(BaseModel):
    sessionId: str

@router.post("/create-session")
async def create_payment_session(request: Request, payment_request: PaymentSessionRequest):
    """Create a Stripe checkout session for payment"""
    try:
        logger.info(f"🚀 Creating payment session for booking: {payment_request.bookingId}")
        
        # Get origin from request headers
        origin = request.headers.get("origin", "http://localhost:3000")
        
        # Prepare payment data
        payment_data = {
            **payment_request.dict(),
            "origin": origin
        }
        
        # Create Stripe session
        session_data = await stripe_service.create_payment_session(payment_data)
        
        # Update booking with session ID
        await supabase_service.update_booking_status(
            payment_request.bookingId, 
            "pending", 
            session_data["sessionId"]
        )
        
        logger.info(f"✅ Payment session created: {session_data['sessionId']}")
        return session_data
        
    except Exception as e:
        logger.error(f"❌ Error creating payment session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-payment")
async def verify_payment(verification_request: PaymentVerificationRequest):
    """Verify payment status and update booking"""
    try:
        logger.info(f"🔍 Verifying payment for session: {verification_request.sessionId}")
        
        # Verify payment with Stripe
        payment_data = await stripe_service.verify_payment(verification_request.sessionId)
        
        booking_id = payment_data["metadata"].get("bookingId")
        if not booking_id:
            raise HTTPException(status_code=400, detail="No booking ID found in session metadata")
        
        # Get booking details
        booking = await supabase_service.get_booking(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Update booking status if payment is successful
        if payment_data["paymentStatus"] == "paid" and booking["status"] != "confirmed":
            await supabase_service.update_booking_status(
                booking_id,
                "confirmed",
                payment_data["paymentIntentId"]
            )
            booking["status"] = "confirmed"
            logger.info(f"✅ Booking confirmed: {booking_id}")
        
        return {
            "paymentStatus": payment_data["paymentStatus"],
            "bookingStatus": booking["status"],
            "booking": {
                "id": booking["id"],
                "status": booking["status"],
                "checkInDate": booking["check_in_date"],
                "checkOutDate": booking["check_out_date"],
                "guestsCount": booking["guests_count"],
                "totalAmount": booking["total_amount"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def payment_health():
    """Health check endpoint for payments"""
    return {"status": "healthy", "service": "payments"}