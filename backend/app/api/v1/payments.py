from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.responses import JSONResponse
from typing import Dict, Any
from app.core.logging import get_logger
from app.core.exceptions import PaymentException, HiddyStaysException
from app.schemas.payment import (
    PaymentIntentCreate, 
    PaymentIntentResponse, 
    PaymentConfirmation,
    PaymentStatus
)
from app.schemas.base import DataResponse, ErrorResponse
from app.services.payment_service import payment_service

router = APIRouter()
logger = get_logger(__name__)


@router.post("/create-payment-intent", response_model=DataResponse[PaymentIntentResponse])
async def create_payment_intent(payment_data: PaymentIntentCreate):
    """Create a new payment intent"""
    try:
        logger.info(f"Creating payment intent for booking {payment_data.booking_id}")
        
        payment_intent = await payment_service.create_payment_intent(payment_data)
        
        return DataResponse(
            success=True,
            message="Payment intent created successfully",
            data=payment_intent
        )
        
    except PaymentException as e:
        logger.error(f"Payment exception: {str(e)}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    except Exception as e:
        logger.error(f"Unexpected error creating payment intent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )


@router.post("/create-session")
async def create_session(payment_data: Dict[str, Any]):
    """Create a Stripe checkout session"""
    try:
        logger.info(f"Creating checkout session for booking {payment_data.get('bookingId')}")
        
        session = await payment_service.create_checkout_session(payment_data)
        
        return JSONResponse(
            content=session,
            status_code=200
        )
        
    except PaymentException as e:
        logger.error(f"Payment exception: {str(e)}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    except Exception as e:
        logger.error(f"Unexpected error creating checkout session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )


@router.post("/verify-payment")
async def verify_payment(verification_data: Dict[str, Any]):
    """Verify payment status"""
    try:
        session_id = verification_data.get("sessionId")
        logger.info(f"Verifying payment for session: {session_id}")
        
        payment_status = await payment_service.verify_payment(session_id)
        
        return JSONResponse(
            content=payment_status,
            status_code=200
        )
        
    except PaymentException as e:
        logger.error(f"Payment exception: {str(e)}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    except Exception as e:
        logger.error(f"Unexpected error verifying payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )


@router.get("/payment-intent/{payment_intent_id}")
async def get_payment_intent(payment_intent_id: str):
    """Get payment intent details"""
    try:
        logger.info(f"Retrieving payment intent: {payment_intent_id}")
        
        payment_intent = await payment_service.get_payment_intent(payment_intent_id)
        
        if not payment_intent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": "Payment intent not found"}
            )
        
        return DataResponse(
            success=True,
            message="Payment intent retrieved successfully",
            data=payment_intent
        )
        
    except PaymentException as e:
        logger.error(f"Payment exception: {str(e)}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error retrieving payment intent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    try:
        logger.info("Processing Stripe webhook")
        
        payload = await request.body()
        signature = request.headers.get("stripe-signature")
        
        if not signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Missing Stripe signature"}
            )
        
        webhook_result = await payment_service.process_webhook(payload, signature)
        
        return DataResponse(
            success=True,
            message="Webhook processed successfully",
            data=webhook_result
        )
        
    except PaymentException as e:
        logger.error(f"Payment exception in webhook: {str(e)}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    except Exception as e:
        logger.error(f"Unexpected error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "details": str(e)}
        )


@router.post("/confirm-payment")
async def confirm_payment(confirmation: PaymentConfirmation):
    """Confirm payment completion"""
    try:
        logger.info(f"Confirming payment for booking {confirmation.booking_id}")
        
        # Here you would typically update the booking status
        # and handle any post-payment processing
        
        return DataResponse(
            success=True,
            message="Payment confirmed successfully",
            data={
                "payment_intent_id": confirmation.payment_intent_id,
                "booking_id": confirmation.booking_id,
                "status": "confirmed"
            }
        )
        
    except Exception as e:
        logger.error(f"Error confirming payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Failed to confirm payment", "details": str(e)}
        )
