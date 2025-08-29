import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationMapProps {
  location: string;
  className?: string;
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationMap = ({ location, className = "" }: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !location) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [40.7128, -74.006],
        13
      ); // Default to NYC

      // Add OpenStreetMap tiles (free)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    }

    // Geocode the location (using a simple approach for demo)
    const geocodeLocation = async () => {
      try {
        // For demo purposes, using a simple mapping
        const locationCoords: { [key: string]: [number, number] } = {
          "New York": [40.7128, -74.006],
          "Los Angeles": [34.0522, -118.2437],
          London: [51.5074, -0.1278],
          Paris: [48.8566, 2.3522],
          Tokyo: [35.6762, 139.6503],
        };

        const coords = locationCoords[location] || [40.7128, -74.006];

        // Clear existing markers
        mapInstanceRef.current?.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current?.removeLayer(layer);
          }
        });

        // Add marker for the location
        const marker = L.marker(coords).addTo(mapInstanceRef.current!);
        marker
          .bindPopup(`<b>${location}</b><br>Properties available here`)
          .openPopup();

        // Set view to the location
        mapInstanceRef.current?.setView(coords, 13);
      } catch (error) {
        console.error("Error geocoding location:", error);
      }
    };

    geocodeLocation();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-64 rounded-xl overflow-hidden shadow-lg ${className}`}
    />
  );
};

export default LocationMap;
