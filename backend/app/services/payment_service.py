import stripe
from typing import Dict, Any, Optional
from decimal import Decimal
from app.core.config import settings
from app.core.logging import get_logger
from app.core.exceptions import PaymentException
from app.schemas.payment import PaymentIntentCreate, PaymentIntentResponse, PaymentStatus
from app.services.base import BaseService


class PaymentService(BaseService[PaymentStatus]):
    """Service for handling payment operations with Stripe"""
    
    def __init__(self):
        super().__init__()
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.logger = get_logger(__name__)
    
    async def create_payment_intent(self, payment_data: PaymentIntentCreate) -> PaymentIntentResponse:
        """Create a Stripe payment intent"""
        try:
            self.logger.info(f"Creating payment intent for booking {payment_data.booking_id}")
            
            intent = stripe.PaymentIntent.create(
                amount=int(payment_data.amount * 100),  # Convert to cents
                currency=payment_data.currency,
                customer_email=payment_data.customer_email,
                metadata={
                    "booking_id": payment_data.booking_id,
                    **payment_data.metadata
                },
                automatic_payment_methods={
                    "enabled": True,
                },
            )
            
            self.logger.info(f"Payment intent created: {intent.id}")
            
            return PaymentIntentResponse(
                id=intent.id,
                amount=intent.amount,
                currency=intent.currency,
                status=intent.status,
                client_secret=intent.client_secret,
                created=intent.created,
                booking_id=payment_data.booking_id
            )
            
        except stripe.error.StripeError as e:
            self.logger.error(f"Stripe error creating payment intent: {str(e)}")
            raise PaymentException(f"Payment intent creation failed: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error creating payment intent: {str(e)}")
            raise PaymentException(f"Payment intent creation failed: {str(e)}")
    
    async def create_checkout_session(self, payment_data: Dict[str, Any]) -> Dict[str, str]:
        """Create a Stripe checkout session"""
        try:
            self.logger.info(f"Creating checkout session for booking {payment_data.get('bookingId')}")
            
            # Set default values for missing fields
            origin = payment_data.get('origin', 'http://localhost:5173')
            
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                customer_email=payment_data.get("guestEmail", "guest@example.com"),
                line_items=[
                    {
                        "price_data": {
                            "currency": payment_data.get("currency", "usd"),
                            "product_data": {
                                "name": f"{payment_data.get('propertyTitle', 'Property Booking')} - {payment_data.get('checkIn', '')} to {payment_data.get('checkOut', '')}",
                                "description": f"Accommodation for {payment_data.get('guestName', 'Guest')}",
                            },
                            "unit_amount": int(float(payment_data.get("totalAmount", 0)) * 100),  # Convert to cents
                        },
                        "quantity": 1,
                    },
                ],
                mode="payment",
                success_url=f"{origin}/booking/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{origin}/property/{payment_data.get('propertyId', '')}",
                metadata={
                    "bookingId": str(payment_data.get("bookingId", "")),
                    "propertyId": str(payment_data.get("propertyId", "")),
                    "guestName": str(payment_data.get("guestName", "Guest")),
                    "guestEmail": str(payment_data.get("guestEmail", "guest@example.com")),
                },
            )
            
            self.logger.info(f"Checkout session created: {session.id}")
            return {"sessionId": session.id, "url": session.url}
            
        except stripe.error.StripeError as e:
            self.logger.error(f"Stripe error creating checkout session: {str(e)}")
            raise PaymentException(f"Checkout session creation failed: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error creating checkout session: {str(e)}")
            raise PaymentException(f"Checkout session creation failed: {str(e)}")
    
    async def verify_payment(self, session_id: str) -> Dict[str, Any]:
        """Verify payment status and retrieve session details"""
        try:
            self.logger.info(f"Verifying payment for session: {session_id}")
            
            session = stripe.checkout.Session.retrieve(session_id)
            
            # Create mock booking data for the response (normally you'd fetch from database)
            mock_booking = {
                "id": session.metadata.get("bookingId", "unknown"),
                "status": "confirmed" if session.payment_status == "paid" else "pending",
                "check_in_date": "2024-03-01", 
                "check_out_date": "2024-03-03",
                "guests_count": 2,
                "total_amount": session.amount_total / 100 if session.amount_total else 0,
                "guest_name": session.metadata.get("guestName", "Guest"),
                "guest_email": session.customer_email or session.metadata.get("guestEmail", "guest@example.com"),
                "property": {
                    "title": "Luxury Beachfront Villa",
                    "location": "Vancouver, BC",
                    "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"]
                }
            }
            
            return {
                "paymentStatus": session.payment_status,
                "bookingStatus": "confirmed" if session.payment_status == "paid" else "pending",
                "sessionId": session.id,
                "metadata": session.metadata,
                "paymentIntentId": session.payment_intent,
                "booking": mock_booking
            }
            
        except stripe.error.StripeError as e:
            self.logger.error(f"Stripe error verifying payment: {str(e)}")
            raise PaymentException(f"Payment verification failed: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error verifying payment: {str(e)}")
            raise PaymentException(f"Payment verification failed: {str(e)}")
    
    async def get_payment_intent(self, payment_intent_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve payment intent details"""
        try:
            self.logger.info(f"Retrieving payment intent: {payment_intent_id}")
            
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                "id": intent.id,
                "amount": intent.amount,
                "currency": intent.currency,
                "status": intent.status,
                "metadata": intent.metadata,
                "created": intent.created
            }
            
        except stripe.error.StripeError as e:
            self.logger.error(f"Stripe error retrieving payment intent: {str(e)}")
            raise PaymentException(f"Payment intent retrieval failed: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error retrieving payment intent: {str(e)}")
            raise PaymentException(f"Payment intent retrieval failed: {str(e)}")
    
    async def process_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """Process Stripe webhook events"""
        try:
            self.logger.info("Processing Stripe webhook")
            
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
            
            self.logger.info(f"Webhook event type: {event['type']}")
            
            # Handle different event types
            if event['type'] == 'payment_intent.succeeded':
                return await self._handle_payment_success(event['data']['object'])
            elif event['type'] == 'payment_intent.payment_failed':
                return await self._handle_payment_failure(event['data']['object'])
            else:
                self.logger.info(f"Unhandled event type: {event['type']}")
                return {"status": "ignored", "event_type": event['type']}
                
        except stripe.error.SignatureVerificationError as e:
            self.logger.error(f"Webhook signature verification failed: {str(e)}")
            raise PaymentException("Invalid webhook signature")
        except Exception as e:
            self.logger.error(f"Webhook processing error: {str(e)}")
            raise PaymentException(f"Webhook processing failed: {str(e)}")
    
    async def _handle_payment_success(self, payment_intent: Dict[str, Any]) -> Dict[str, Any]:
        """Handle successful payment"""
        self.logger.info(f"Payment succeeded: {payment_intent['id']}")
        return {
            "status": "success",
            "payment_intent_id": payment_intent['id'],
            "booking_id": payment_intent.get('metadata', {}).get('booking_id'),
            "amount": payment_intent['amount']
        }
    
    async def _handle_payment_failure(self, payment_intent: Dict[str, Any]) -> Dict[str, Any]:
        """Handle failed payment"""
        self.logger.warning(f"Payment failed: {payment_intent['id']}")
        return {
            "status": "failed",
            "payment_intent_id": payment_intent['id'],
            "booking_id": payment_intent.get('metadata', {}).get('booking_id'),
            "error": payment_intent.get('last_payment_error', {}).get('message', 'Unknown error')
        }
    
    # BaseService abstract method implementations
    async def create(self, data: Dict[str, Any]) -> PaymentStatus:
        """Create a new payment record"""
        # Implementation would depend on your database structure
        pass
    
    async def get_by_id(self, id: str) -> Optional[PaymentStatus]:
        """Get payment by ID"""
        # Implementation would depend on your database structure
        pass
    
    async def update(self, id: str, data: Dict[str, Any]) -> Optional[PaymentStatus]:
        """Update payment record"""
        # Implementation would depend on your database structure
        pass
    
    async def delete(self, id: str) -> bool:
        """Delete payment record"""
        # Implementation would depend on your database structure
        pass
    
    async def list(self, filters: Optional[Dict[str, Any]] = None, 
                   pagination: Optional[Dict[str, Any]] = None) -> list[PaymentStatus]:
        """List payment records"""
        # Implementation would depend on your database structure
        pass


# Global service instance
payment_service = PaymentService()
