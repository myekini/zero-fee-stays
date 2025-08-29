"""
Supabase service for admin operations
"""

from typing import Dict, Any, Optional, List
from app.core.database import get_supabase_service
from app.core.logging import get_logger
from app.services.base import BaseService


class SupabaseService(BaseService[Dict[str, Any]]):
    """Service for handling Supabase admin operations"""
    
    def __init__(self):
        super().__init__()
        self.logger = get_logger(__name__)
    
    @property
    def client(self):
        """Get Supabase service client"""
        try:
            return get_supabase_service()
        except Exception as e:
            self.logger.error(f"Failed to get Supabase service client: {e}")
            return None
    
    @property 
    def is_connected(self) -> bool:
        """Check if connected to Supabase"""
        return self.client is not None
    
    async def get_user_stats(self) -> Dict[str, Any]:
        """Get user statistics for admin dashboard"""
        try:
            if not self.is_connected:
                # Mock implementation
                return {
                    "success": True,
                    "data": {
                        "total_users": 0,
                        "verified_users": 0,
                        "unverified_users": 0,
                        "admins": 0,
                        "hosts": 0,
                        "regular_users": 0
                    }
                }
            
            # Get total users
            total_result = self.client.table("auth.users").select("id", count="exact").execute()
            total_users = total_result.count or 0
            
            # Get verified users
            verified_result = self.client.table("auth.users").select("id", count="exact").eq("email_confirmed_at", "not.is.null").execute()
            verified_users = verified_result.count or 0
            
            # Get unverified users
            unverified_users = total_users - verified_users
            
            # Get users by role (assuming you have a profiles table with role field)
            try:
                admin_result = self.client.table("profiles").select("id", count="exact").eq("role", "admin").execute()
                admins = admin_result.count or 0
                
                host_result = self.client.table("profiles").select("id", count="exact").eq("role", "host").execute()
                hosts = host_result.count or 0
                
                regular_result = self.client.table("profiles").select("id", count="exact").eq("role", "user").execute()
                regular_users = regular_result.count or 0
            except Exception as e:
                self.logger.warning(f"Could not get role-based stats: {e}")
                admins = 0
                hosts = 0
                regular_users = 0
            
            return {
                "success": True,
                "data": {
                    "total_users": total_users,
                    "verified_users": verified_users,
                    "unverified_users": unverified_users,
                    "admins": admins,
                    "hosts": hosts,
                    "regular_users": regular_users
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error getting user stats: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def list_users(self, limit: int = 50, offset: int = 0, role_filter: Optional[str] = None) -> Dict[str, Any]:
        """List all users for admin management"""
        try:
            if not self.is_connected:
                # Mock implementation
                return {
                    "success": True,
                    "data": {
                        "users": [],
                        "total": 0
                    }
                }
            
            # Build query
            query = self.client.table("auth.users").select("id,email,created_at,email_confirmed_at")
            
            # Apply role filter if specified
            if role_filter:
                # Join with profiles table to filter by role
                query = self.client.table("auth.users").select("id,email,created_at,email_confirmed_at,profiles!inner(role)").eq("profiles.role", role_filter)
            
            # Apply pagination
            query = query.range(offset, offset + limit - 1)
            
            result = query.execute()
            
            # Get total count
            count_query = self.client.table("auth.users").select("id", count="exact")
            if role_filter:
                count_query = self.client.table("auth.users").select("id", count="exact").eq("profiles.role", role_filter)
            count_result = count_query.execute()
            total = count_result.count or 0
            
            return {
                "success": True,
                "data": {
                    "users": result.data or [],
                    "total": total
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error listing users: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def create_admin_user(self, email: str, password: str, first_name: str, last_name: str) -> Dict[str, Any]:
        """Create a new admin user"""
        try:
            if not self.is_connected:
                # Mock implementation
                return {
                    "success": True,
                    "data": {
                        "id": "mock-admin-id",
                        "email": email,
                        "first_name": first_name,
                        "last_name": last_name,
                        "role": "admin"
                    }
                }
            
            # Create user in auth.users
            user_data = {
                "email": email,
                "password": password,
                "email_confirm": True
            }
            
            auth_result = self.client.auth.admin.create_user(user_data)
            
            if not auth_result.user:
                return {
                    "success": False,
                    "error": "Failed to create user in auth"
                }
            
            user_id = auth_result.user.id
            
            # Create profile record
            profile_data = {
                "id": user_id,
                "first_name": first_name,
                "last_name": last_name,
                "role": "admin",
                "email": email
            }
            
            profile_result = self.client.table("profiles").insert(profile_data).execute()
            
            if not profile_result.data:
                return {
                    "success": False,
                    "error": "Failed to create profile"
                }
            
            return {
                "success": True,
                "data": {
                    "id": user_id,
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": "admin"
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error creating admin user: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def check_user_exists(self, email: str) -> Dict[str, Any]:
        """Check if a user exists by email"""
        try:
            if not self.is_connected:
                # Mock implementation
                return {
                    "success": True,
                    "data": {
                        "exists": False
                    }
                }
            
            result = self.client.table("auth.users").select("id").eq("email", email).execute()
            
            return {
                "success": True,
                "data": {
                    "exists": len(result.data) > 0,
                    "user_id": result.data[0]["id"] if result.data else None
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error checking user existence: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def delete_user(self, user_id: str) -> Dict[str, Any]:
        """Delete a user"""
        try:
            if not self.is_connected:
                # Mock implementation
                return {
                    "success": True,
                    "data": {
                        "deleted": True
                    }
                }
            
            # Delete from auth.users
            auth_result = self.client.auth.admin.delete_user(user_id)
            
            # Delete from profiles table
            profile_result = self.client.table("profiles").delete().eq("id", user_id).execute()
            
            return {
                "success": True,
                "data": {
                    "deleted": True
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error deleting user: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def update_user_role(self, user_id: str, role: str) -> Dict[str, Any]:
        """Update user role"""
        try:
            if not self.is_connected:
                # Mock implementation
                return {
                    "success": True,
                    "data": {
                        "updated": True
                    }
                }
            
            result = self.client.table("profiles").update({"role": role}).eq("id", user_id).execute()
            
            if not result.data:
                return {
                    "success": False,
                    "error": "User not found"
                }
            
            return {
                "success": True,
                "data": {
                    "updated": True,
                    "role": role
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error updating user role: {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Global instance
supabase_service = SupabaseService()
