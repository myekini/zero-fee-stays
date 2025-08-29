export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  country: string;
  property_type: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  host: {
    id: string;
    name: string;
    email: string;
  };
  amenities: string[];
  images: string[];
  total_bookings?: number;
  total_revenue?: number;
  average_rating?: number;
  occupancy_rate?: number;
}

export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  featuredProperties: number;
  totalRevenue: number;
  averageRating: number;
  averageOccupancy: number;
  newThisMonth: number;
  topPerforming: number;
}

export interface PropertyFilters {
  status?: string;
  property_type?: string;
  country?: string;
  search?: string;
}

class PropertyService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  }

  /**
   * Get all properties with optional filtering
   */
  async getProperties(filters?: PropertyFilters): Promise<Property[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "all") {
            params.append(key, value);
          }
        });
      }

      const queryString = params.toString();
      const url = `${this.baseUrl}/api/properties/${queryString ? `?${queryString}` : ""}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch properties");
      }

      const data = await response.json();
      return data.properties || [];
    } catch (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }
  }

  /**
   * Get a specific property by ID
   */
  async getProperty(propertyId: string): Promise<Property> {
    try {
      const response = await fetch(`${this.baseUrl}/api/properties/${propertyId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch property");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching property:", error);
      throw error;
    }
  }

  /**
   * Update a property
   */
  async updateProperty(propertyId: string, updateData: Partial<Property>): Promise<Property> {
    try {
      const response = await fetch(`${this.baseUrl}/api/properties/${propertyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update property");
      }

      const data = await response.json();
      return data.property;
    } catch (error) {
      console.error("Error updating property:", error);
      throw error;
    }
  }

  /**
   * Delete a property
   */
  async deleteProperty(propertyId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete property");
      }

      return true;
    } catch (error) {
      console.error("Error deleting property:", error);
      throw error;
    }
  }

  /**
   * Create a new property
   */
  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    try {
      const response = await fetch(`${this.baseUrl}/api/properties/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create property");
      }

      const data = await response.json();
      return data.property;
    } catch (error) {
      console.error("Error creating property:", error);
      throw error;
    }
  }

  /**
   * Get property statistics
   */
  async getPropertyStats(): Promise<PropertyStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/properties/stats/summary`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch property statistics");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching property stats:", error);
      throw error;
    }
  }

  /**
   * Toggle property status (activate/deactivate)
   */
  async togglePropertyStatus(propertyId: string, isActive: boolean): Promise<Property> {
    return this.updateProperty(propertyId, { is_active: isActive });
  }

  /**
   * Toggle property featured status
   */
  async togglePropertyFeatured(propertyId: string, isFeatured: boolean): Promise<Property> {
    return this.updateProperty(propertyId, { is_featured: isFeatured });
  }
}

// Export singleton instance
export const propertyService = new PropertyService();

// Export types
export type { Property, PropertyStats, PropertyFilters };