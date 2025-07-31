import stripe
from app.config import settings
from typing import Dict, Any

class StripeService:
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
    
    async def create_payment_session(self, payment_data: Dict[str, Any]) -> Dict[str, str]:
        """Create a Stripe checkout session"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                customer_email=payment_data["guestEmail"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "cad",
                            "product_data": {
                                "name": f"{payment_data['propertyTitle']} - {payment_data['checkIn']} to {payment_data['checkOut']}",
                                "description": f"Accommodation for {payment_data['guestName']}",
                            },
                            "unit_amount": int(payment_data["totalAmount"] * 100),  # Convert to cents
                        },
                        "quantity": 1,
                    },
                ],
                mode="payment",
                success_url=f"{payment_data['origin']}/booking/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{payment_data['origin']}/property/{payment_data['propertyId']}",
                metadata={
                    "bookingId": payment_data["bookingId"],
                    "propertyId": payment_data["propertyId"],
                    "guestName": payment_data["guestName"],
                    "guestEmail": payment_data["guestEmail"],
                },
            )
            
            return {"sessionId": session.id, "url": session.url}
        except Exception as e:
            raise Exception(f"Failed to create payment session: {str(e)}")
    
    async def verify_payment(self, session_id: str) -> Dict[str, Any]:
        """Verify payment status and retrieve session details"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            
            return {
                "paymentStatus": session.payment_status,
                "sessionId": session.id,
                "metadata": session.metadata,
                "paymentIntentId": session.payment_intent
            }
        except Exception as e:
            raise Exception(f"Failed to verify payment: {str(e)}")

stripe_service = StripeService()