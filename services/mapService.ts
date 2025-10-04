// Map Service - Free OpenStreetMap Integration
// No API keys required, completely free to use

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: MapCoordinates;
  address: string;
  displayName: string;
  confidence: number;
}

export interface ReverseGeocodingResult {
  address: string;
  city: string;
  country: string;
  postalCode?: string;
}

export class MapService {
  private static instance: MapService;

  private constructor() {}

  public static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  /**
   * Geocode an address to coordinates using OpenStreetMap Nominatim (FREE)
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "ZeroFeeStays/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error("Address not found");
      }

      const result = data[0];

      return {
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        },
        address: result.display_name,
        displayName: result.display_name,
        confidence: parseFloat(result.importance) || 0,
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      throw new Error("Unable to geocode address");
    }
  }

  /**
   * Reverse geocode coordinates to address using OpenStreetMap Nominatim (FREE)
   */
  async reverseGeocode(
    coordinates: MapCoordinates
  ): Promise<ReverseGeocodingResult> {
    try {
      const { lat, lng } = coordinates;
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "ZeroFeeStays/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.address) {
        throw new Error("Location not found");
      }

      const address = data.address;

      return {
        address: data.display_name,
        city:
          address.city ||
          address.town ||
          address.village ||
          address.county ||
          "",
        country: address.country || "",
        postalCode: address.postcode || undefined,
      };
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      throw new Error("Unable to reverse geocode coordinates");
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(coord1: MapCoordinates, coord2: MapCoordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * (Math.PI / 180)) *
        Math.cos(coord2.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Format distance for display
   */
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km away`;
    } else {
      return `${Math.round(distance)}km away`;
    }
  }

  /**
   * Get directions URL for different platforms
   */
  getDirectionsUrl(
    coordinates: MapCoordinates,
    platform: "google" | "apple" | "android" = "google"
  ): string {
    const { lat, lng } = coordinates;

    switch (platform) {
      case "apple":
        return `https://maps.apple.com/?daddr=${lat},${lng}`;
      case "android":
        return `geo:${lat},${lng}`;
      case "google":
      default:
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
  }

  /**
   * Get search URL for different platforms
   */
  getSearchUrl(query: string, platform: "google" | "apple" = "google"): string {
    const encodedQuery = encodeURIComponent(query);

    switch (platform) {
      case "apple":
        return `https://maps.apple.com/?q=${encodedQuery}`;
      case "google":
      default:
        return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
    }
  }

  /**
   * Detect user's platform for optimal map app selection
   */
  detectPlatform(): "ios" | "android" | "web" {
    const userAgent = navigator.userAgent;

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return "ios";
    } else if (/Android/.test(userAgent)) {
      return "android";
    } else {
      return "web";
    }
  }

  /**
   * Get optimal directions URL based on user's platform
   */
  getOptimalDirectionsUrl(coordinates: MapCoordinates): string {
    const platform = this.detectPlatform();

    switch (platform) {
      case "ios":
        return this.getDirectionsUrl(coordinates, "apple");
      case "android":
        return this.getDirectionsUrl(coordinates, "android");
      default:
        return this.getDirectionsUrl(coordinates, "google");
    }
  }

  /**
   * Validate coordinates
   */
  isValidCoordinates(coordinates: MapCoordinates): boolean {
    return (
      coordinates.lat >= -90 &&
      coordinates.lat <= 90 &&
      coordinates.lng >= -180 &&
      coordinates.lng <= 180 &&
      !isNaN(coordinates.lat) &&
      !isNaN(coordinates.lng)
    );
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(): Promise<MapCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  /**
   * Calculate distance from user's current location
   */
  async getDistanceFromCurrentLocation(
    targetCoordinates: MapCoordinates
  ): Promise<string | null> {
    try {
      const currentLocation = await this.getCurrentLocation();
      const distance = this.calculateDistance(
        currentLocation,
        targetCoordinates
      );
      return this.formatDistance(distance);
    } catch (error) {
      console.error("Error getting distance from current location:", error);
      return null;
    }
  }
}

// Export singleton instance
export const mapService = MapService.getInstance();
