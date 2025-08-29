"""
Admin management API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging
from datetime import datetime

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.base import BaseResponse
from app.services.supabase_service import supabase_service
from pydantic import BaseModel, EmailStr

logger = get_logger(__name__)

router = APIRouter()

# Pydantic models
class AdminCreateRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class AdminResponse(BaseModel):
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    created_at: str
    email_confirmed_at: Optional[str] = None

class AdminListResponse(BaseResponse):
    data: List[AdminResponse]
    total: int

class UserStatsResponse(BaseModel):
    total_users: int
    verified_users: int
    unverified_users: int
    admins: int
    hosts: int
    regular_users: int

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats():
    """Get user statistics for admin dashboard"""
    try:
        # Get user statistics from Supabase
        result = await supabase_service.get_user_stats()
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get user stats: {result.error}"
            )
        
        return result.data
        
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user statistics"
        )

@router.get("/users", response_model=AdminListResponse)
async def list_all_users(
    limit: int = 50,
    offset: int = 0,
    role_filter: Optional[str] = None
):
    """List all users for admin management"""
    try:
        result = await supabase_service.list_users(
            limit=limit,
            offset=offset,
            role_filter=role_filter
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to list users: {result.error}"
            )
        
        return AdminListResponse(
            success=True,
            message="Users retrieved successfully",
            data=result.data.get("users", []),
            total=result.data.get("total", 0)
        )
        
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users"
        )

@router.post("/create-admin", response_model=BaseResponse)
async def create_admin_user(request: AdminCreateRequest):
    """Create a new admin user"""
    try:
        # Create admin user in Supabase
        result = await supabase_service.create_admin_user(
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create admin user: {result.error}"
            )
        
        logger.info(f"Admin user created successfully: {request.email}")
        
        return BaseResponse(
            success=True,
            message="Admin user created successfully"
        )
        
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create admin user"
        )

@router.post("/initialize-default-admin", response_model=BaseResponse)
async def initialize_default_admin():
    """Initialize the default admin user (one-time setup)"""
    try:
        # Check if default admin already exists
        result = await supabase_service.check_user_exists(settings.DEFAULT_ADMIN_EMAIL)
        
        if result.success and result.data:
            return BaseResponse(
                success=True,
                message="Default admin already exists"
            )
        
        # Create default admin
        result = await supabase_service.create_admin_user(
            email=settings.DEFAULT_ADMIN_EMAIL,
            password=settings.DEFAULT_ADMIN_PASSWORD,
            first_name="System",
            last_name="Administrator"
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create default admin: {result.error}"
            )
        
        logger.info("Default admin user initialized successfully")
        
        return BaseResponse(
            success=True,
            message="Default admin initialized successfully"
        )
        
    except Exception as e:
        logger.error(f"Error initializing default admin: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize default admin"
        )

@router.delete("/users/{user_id}", response_model=BaseResponse)
async def delete_user(user_id: str):
    """Delete a user (admin only)"""
    try:
        result = await supabase_service.delete_user(user_id)
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to delete user: {result.error}"
            )
        
        logger.info(f"User deleted successfully: {user_id}")
        
        return BaseResponse(
            success=True,
            message="User deleted successfully"
        )
        
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )

@router.put("/users/{user_id}/role", response_model=BaseResponse)
async def update_user_role(user_id: str, role: str):
    """Update user role (admin only)"""
    try:
        if role not in ["user", "host", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'user', 'host', or 'admin'"
            )
        
        result = await supabase_service.update_user_role(user_id, role)
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update user role: {result.error}"
            )
        
        logger.info(f"User role updated successfully: {user_id} -> {role}")
        
        return BaseResponse(
            success=True,
            message=f"User role updated to {role}"
        )
        
    except Exception as e:
        logger.error(f"Error updating user role {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role"
        )

@router.get("/check-admin/{email}")
async def check_admin_exists(email: str):
    """Check if an admin with this email exists"""
    try:
        result = await supabase_service.check_user_exists(email)
        
        if not result.success:
            return {"exists": False, "error": result.error}
        
        return {"exists": result.data, "is_admin": result.data}
        
    except Exception as e:
        logger.error(f"Error checking admin existence: {e}")
        return {"exists": False, "error": str(e)}