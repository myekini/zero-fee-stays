from supabase import create_client, Client
from app.config import settings

class SupabaseService:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
    
    async def update_booking_status(self, booking_id: str, status: str, payment_intent_id: str = None):
        """Update booking status and payment intent ID"""
        update_data = {"status": status}
        if payment_intent_id:
            update_data["stripe_payment_intent_id"] = payment_intent_id
            
        result = self.client.table("bookings").update(update_data).eq("id", booking_id).execute()
        return result
    
    async def get_booking(self, booking_id: str):
        """Get booking details"""
        result = self.client.table("bookings").select("*").eq("id", booking_id).single().execute()
        return result.data if result.data else None

supabase_service = SupabaseService()