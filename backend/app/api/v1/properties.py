from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, Any, List, Optional
from app.core.logging import get_logger
from app.core.exceptions import DatabaseException, HiddyStaysException

router = APIRouter()
logger = get_logger(__name__)

# Mock property data for now (in a real app, this would come from database)
MOCK_PROPERTIES = [
    {
        "id": "1",
        "title": "Luxury Beachfront Villa",
        "description": "Experience paradise in this stunning beachfront villa with panoramic ocean views. Perfect for families and groups.",
        "location": "Vancouver, BC",
        "country": "Canada", 
        "property_type": "Villa",
        "price_per_night": 450,
        "max_guests": 8,
        "bedrooms": 4,
        "bathrooms": 3,
        "is_active": True,
        "is_featured": True,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "host": {
            "id": "admin",
            "name": "HiddyStays Admin",
            "email": "admin@hiddystays.com"
        },
        "amenities": ["WiFi", "Pool", "Beach Access", "Kitchen", "Parking"],
        "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"],
        "total_bookings": 15,
        "total_revenue": 6750,
        "average_rating": 4.9,
        "occupancy_rate": 85
    },
    {
        "id": "2", 
        "title": "Modern Downtown Loft",
        "description": "Stylish urban loft in the heart of downtown with city views and modern amenities.",
        "location": "Toronto, ON",
        "country": "Canada",
        "property_type": "Loft",
        "price_per_night": 280,
        "max_guests": 4,
        "bedrooms": 2,
        "bathrooms": 2,
        "is_active": True,
        "is_featured": False,
        "created_at": "2024-01-15T00:00:00Z",
        "updated_at": "2024-01-15T00:00:00Z", 
        "host": {
            "id": "admin",
            "name": "HiddyStays Admin",
            "email": "admin@hiddystays.com"
        },
        "amenities": ["WiFi", "Kitchen", "Parking", "City View"],
        "images": ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop"],
        "total_bookings": 8,
        "total_revenue": 2240,
        "average_rating": 4.8,
        "occupancy_rate": 72
    },
    {
        "id": "3",
        "title": "Cozy Mountain Cabin",
        "description": "Escape to this charming mountain cabin surrounded by nature and stunning mountain views.",
        "location": "Banff, AB",
        "country": "Canada",
        "property_type": "Cabin",
        "price_per_night": 320,
        "max_guests": 6,
        "bedrooms": 3,
        "bathrooms": 2,
        "is_active": True,
        "is_featured": True,
        "created_at": "2024-02-01T00:00:00Z",
        "updated_at": "2024-02-01T00:00:00Z",
        "host": {
            "id": "admin",
            "name": "HiddyStays Admin", 
            "email": "admin@hiddystays.com"
        },
        "amenities": ["WiFi", "Fireplace", "Mountain View", "Kitchen", "Parking"],
        "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"],
        "total_bookings": 12,
        "total_revenue": 3840,
        "average_rating": 4.9,
        "occupancy_rate": 90
    },
    {
        "id": "4",
        "title": "Historic City Apartment",
        "description": "Charming apartment in a historic building with character and modern comforts.",
        "location": "Montreal, QC",
        "country": "Canada",
        "property_type": "Apartment",
        "price_per_night": 220,
        "max_guests": 3,
        "bedrooms": 1,
        "bathrooms": 1,
        "is_active": False,
        "is_featured": False,
        "created_at": "2024-02-15T00:00:00Z",
        "updated_at": "2024-02-15T00:00:00Z",
        "host": {
            "id": "admin",
            "name": "HiddyStays Admin",
            "email": "admin@hiddystays.com"
        },
        "amenities": ["WiFi", "Historic Building", "City Center", "Kitchen"],
        "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"],
        "total_bookings": 5,
        "total_revenue": 1100,
        "average_rating": 4.7,
        "occupancy_rate": 45
    }
]

@router.get("/")
async def list_properties(
    status: Optional[str] = None,
    property_type: Optional[str] = None, 
    country: Optional[str] = None,
    search: Optional[str] = None
):
    """Get all properties with optional filtering"""
    try:
        logger.info("Fetching properties list")
        
        properties = MOCK_PROPERTIES.copy()
        
        # Apply filters
        if status:
            if status == "active":
                properties = [p for p in properties if p["is_active"]]
            elif status == "inactive":
                properties = [p for p in properties if not p["is_active"]]
            elif status == "featured":
                properties = [p for p in properties if p["is_featured"]]
                
        if property_type and property_type != "all":
            properties = [p for p in properties if p["property_type"].lower() == property_type.lower()]
            
        if country and country != "all":
            properties = [p for p in properties if p["country"].lower() == country.lower()]
            
        if search:
            search_lower = search.lower()
            properties = [
                p for p in properties 
                if search_lower in p["title"].lower() 
                or search_lower in p["location"].lower()
                or search_lower in p["host"]["name"].lower()
            ]
        
        return JSONResponse(content={"properties": properties}, status_code=200)
        
    except Exception as e:
        logger.error(f"Error fetching properties: {str(e)}")
        return JSONResponse(
            content={"error": "Failed to fetch properties", "details": str(e)},
            status_code=500
        )

@router.get("/{property_id}")
async def get_property(property_id: str):
    """Get a specific property by ID"""
    try:
        logger.info(f"Fetching property: {property_id}")
        
        property_data = next((p for p in MOCK_PROPERTIES if p["id"] == property_id), None)
        
        if not property_data:
            return JSONResponse(
                content={"error": "Property not found"},
                status_code=404
            )
        
        return JSONResponse(content=property_data, status_code=200)
        
    except Exception as e:
        logger.error(f"Error fetching property {property_id}: {str(e)}")
        return JSONResponse(
            content={"error": "Failed to fetch property", "details": str(e)},
            status_code=500
        )

@router.put("/{property_id}")
async def update_property(property_id: str, update_data: Dict[str, Any]):
    """Update a property"""
    try:
        logger.info(f"Updating property: {property_id}")
        
        property_index = next((i for i, p in enumerate(MOCK_PROPERTIES) if p["id"] == property_id), None)
        
        if property_index is None:
            return JSONResponse(
                content={"error": "Property not found"},
                status_code=404
            )
        
        # Update the property
        MOCK_PROPERTIES[property_index].update(update_data)
        MOCK_PROPERTIES[property_index]["updated_at"] = "2024-03-01T00:00:00Z"
        
        return JSONResponse(
            content={"message": "Property updated successfully", "property": MOCK_PROPERTIES[property_index]},
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Error updating property {property_id}: {str(e)}")
        return JSONResponse(
            content={"error": "Failed to update property", "details": str(e)},
            status_code=500
        )

@router.delete("/{property_id}")
async def delete_property(property_id: str):
    """Delete a property"""
    try:
        logger.info(f"Deleting property: {property_id}")
        
        property_index = next((i for i, p in enumerate(MOCK_PROPERTIES) if p["id"] == property_id), None)
        
        if property_index is None:
            return JSONResponse(
                content={"error": "Property not found"},
                status_code=404
            )
        
        # Remove the property
        deleted_property = MOCK_PROPERTIES.pop(property_index)
        
        return JSONResponse(
            content={"message": "Property deleted successfully", "property": deleted_property},
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Error deleting property {property_id}: {str(e)}")
        return JSONResponse(
            content={"error": "Failed to delete property", "details": str(e)},
            status_code=500
        )

@router.post("/")
async def create_property(property_data: Dict[str, Any]):
    """Create a new property"""
    try:
        logger.info("Creating new property")
        
        # Generate new property ID
        max_id = max([int(p["id"]) for p in MOCK_PROPERTIES], default=0)
        new_id = str(max_id + 1)
        
        # Create new property
        new_property = {
            "id": new_id,
            "title": property_data.get("title", "New Property"),
            "description": property_data.get("description", ""),
            "location": property_data.get("location", ""),
            "country": property_data.get("country", ""),
            "property_type": property_data.get("property_type", "Apartment"),
            "price_per_night": property_data.get("price_per_night", 100),
            "max_guests": property_data.get("max_guests", 2),
            "bedrooms": property_data.get("bedrooms", 1),
            "bathrooms": property_data.get("bathrooms", 1),
            "is_active": property_data.get("is_active", True),
            "is_featured": property_data.get("is_featured", False),
            "created_at": "2024-03-01T00:00:00Z",
            "updated_at": "2024-03-01T00:00:00Z",
            "host": {
                "id": "admin",
                "name": "HiddyStays Admin",
                "email": "admin@hiddystays.com"
            },
            "amenities": property_data.get("amenities", []),
            "images": property_data.get("images", []),
            "total_bookings": 0,
            "total_revenue": 0,
            "average_rating": 0,
            "occupancy_rate": 0
        }
        
        MOCK_PROPERTIES.append(new_property)
        
        return JSONResponse(
            content={"message": "Property created successfully", "property": new_property},
            status_code=201
        )
        
    except Exception as e:
        logger.error(f"Error creating property: {str(e)}")
        return JSONResponse(
            content={"error": "Failed to create property", "details": str(e)},
            status_code=500
        )

@router.get("/stats/summary")
async def get_property_stats():
    """Get property statistics summary"""
    try:
        logger.info("Calculating property statistics")
        
        total_properties = len(MOCK_PROPERTIES)
        active_properties = len([p for p in MOCK_PROPERTIES if p["is_active"]])
        featured_properties = len([p for p in MOCK_PROPERTIES if p["is_featured"]])
        total_revenue = sum(p["total_revenue"] for p in MOCK_PROPERTIES)
        average_rating = sum(p["average_rating"] for p in MOCK_PROPERTIES) / total_properties if total_properties > 0 else 0
        average_occupancy = sum(p["occupancy_rate"] for p in MOCK_PROPERTIES) / total_properties if total_properties > 0 else 0
        
        # Mock new this month
        new_this_month = 2
        top_performing = len([p for p in MOCK_PROPERTIES if p["average_rating"] >= 4.5])
        
        stats = {
            "totalProperties": total_properties,
            "activeProperties": active_properties, 
            "featuredProperties": featured_properties,
            "totalRevenue": total_revenue,
            "averageRating": round(average_rating, 1),
            "averageOccupancy": round(average_occupancy, 1),
            "newThisMonth": new_this_month,
            "topPerforming": top_performing
        }
        
        return JSONResponse(content=stats, status_code=200)
        
    except Exception as e:
        logger.error(f"Error calculating property stats: {str(e)}")
        return JSONResponse(
            content={"error": "Failed to calculate property stats", "details": str(e)},
            status_code=500
        )