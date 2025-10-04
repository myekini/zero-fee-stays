import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PropertyMapProps {
  location: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  className?: string;
  showDirections?: boolean;
}

interface MapData {
  lat: number;
  lng: number;
  address: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  location,
  city,
  country,
  coordinates,
  className,
  showDirections = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);

  // Geocode address to coordinates if not provided
  const geocodeAddress = async (address: string): Promise<MapData> => {
    const fullAddress = `${address}, ${city}, ${country}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      fullAddress
    )}&limit=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: fullAddress,
        };
      }
      throw new Error("Location not found");
    } catch (error) {
      console.error("Geocoding error:", error);
      throw new Error("Unable to find location coordinates");
    }
  };

  // Initialize map
  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Dynamically import Leaflet to avoid SSR issues
      const L = await import("leaflet");

      // Set up map data
      let mapData: MapData;

      if (coordinates) {
        mapData = {
          lat: coordinates.lat,
          lng: coordinates.lng,
          address: `${location}, ${city}, ${country}`,
        };
      } else {
        mapData = await geocodeAddress(location);
      }

      setMapData(mapData);

      // Create map instance
      const map = L.map(mapRef.current).setView([mapData.lat, mapData.lng], 15);

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
        minZoom: 3,
      }).addTo(map);

      // Add custom marker
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background: #ff6b6b;
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 12px;
              font-weight: bold;
            ">📍</div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([mapData.lat, mapData.lng], {
        icon: customIcon,
      }).addTo(map).bindPopup(`
          <div style="text-align: center; padding: 8px;">
            <strong>${location}</strong><br>
            ${city}, ${country}
          </div>
        `);

      setMapInstance(map);
      setMarkerInstance(marker);
    } catch (error) {
      console.error("Map initialization error:", error);
      setError(error instanceof Error ? error.message : "Failed to load map");
    } finally {
      setLoading(false);
    }
  };

  // Handle directions
  const handleGetDirections = () => {
    if (!mapData) return;

    const { lat, lng } = mapData;
    const encodedAddress = encodeURIComponent(
      `${location}, ${city}, ${country}`
    );

    // Detect device for optimal map app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let mapsUrl: string;

    if (isIOS) {
      // Apple Maps
      mapsUrl = `https://maps.apple.com/?daddr=${lat},${lng}`;
    } else if (isAndroid) {
      // Google Maps for Android
      mapsUrl = `geo:${lat},${lng}`;
    } else {
      // Web fallback to Google Maps
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    window.open(mapsUrl, "_blank");
  };

  // Handle external map link
  const handleExternalMap = () => {
    if (!mapData) return;

    const { lat, lng } = mapData;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(googleMapsUrl, "_blank");
  };

  // Initialize map on mount
  useEffect(() => {
    initializeMap();

    // Cleanup on unmount
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [location, city, country, coordinates]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Display */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{location}</p>
            <p className="text-sm text-muted-foreground">
              {city}, {country}
            </p>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading map...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Map unavailable
                </p>
                <Button variant="outline" size="sm" onClick={initializeMap}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          <div
            ref={mapRef}
            className={cn(
              "h-64 rounded-lg border",
              loading || error ? "hidden" : "block"
            )}
          />
        </div>

        {/* Action Buttons */}
        {showDirections && mapData && (
          <div className="flex gap-2">
            <Button onClick={handleGetDirections} className="flex-1" size="sm">
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            <Button variant="outline" onClick={handleExternalMap} size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Maps
            </Button>
          </div>
        )}

        {/* Distance Info (if available) */}
        {mapData && (
          <div className="text-xs text-muted-foreground text-center">
            <p>
              📍 {mapData.lat.toFixed(6)}, {mapData.lng.toFixed(6)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyMap;
