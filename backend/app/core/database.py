from supabase import create_client, Client
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

class SupabaseClient:
    """Supabase database client"""
    
    def __init__(self):
        self._client: Client = None
        self._service_client: Client = None
    
    @property
    def client(self) -> Client:
        """Get Supabase client with anon key"""
        if not self._client:
            try:
                self._client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                raise
        return self._client
    
    @property
    def service_client(self) -> Client:
        """Get Supabase service client with service role key"""
        if not self._service_client:
            try:
                self._service_client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY
                )
                logger.info("Supabase service client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase service client: {e}")
                raise
        return self._service_client
    
    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            # Try a simple query to test connection
            result = self.client.table('profiles').select('id').limit(1).execute()
            logger.info("Database connection test successful")
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False

# Global Supabase client instance
supabase_client = SupabaseClient()

# Convenience functions for easy access
def get_supabase() -> Client:
    """Get Supabase client"""
    return supabase_client.client

def get_supabase_service() -> Client:
    """Get Supabase service client"""
    return supabase_client.service_client