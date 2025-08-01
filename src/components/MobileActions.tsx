import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileActionsProps {
  phoneNumber?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  hostName?: string;
  className?: string;
}

const MobileActions: React.FC<MobileActionsProps> = ({
  phoneNumber,
  address,
  coordinates,
  hostName,
  className
}) => {
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
        },
        (error) => {
          setLocationError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, []);

  const handleCall = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleMessage = () => {
    if (phoneNumber) {
      // Try to open SMS, fallback to WhatsApp web if available
      const message = `Hi ${hostName || 'there'}, I'm interested in your property.`;
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      
      // Check if WhatsApp is available
      const isWhatsAppAvailable = /WhatsApp/.test(navigator.userAgent) || 
                                  /Mobile/.test(navigator.userAgent);
      
      if (isWhatsAppAvailable) {
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      } else {
        window.location.href = smsUrl;
      }
    }
  };

  const handleGetDirections = () => {
    if (coordinates) {
      const { lat, lng } = coordinates;
      
      // Try to open in native maps app first
      const mapsUrl = `https://maps.apple.com/?daddr=${lat},${lng}`;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      
      // Detect iOS for Apple Maps, Android for Google Maps
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        window.location.href = mapsUrl;
      } else if (isAndroid) {
        window.location.href = `geo:${lat},${lng}`;
      } else {
        window.open(googleMapsUrl, '_blank');
      }
    } else if (address) {
      const encodedAddress = encodeURIComponent(address);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const calculateDistance = () => {
    if (!currentLocation || !coordinates) return null;
    
    const { lat: lat1, lng: lng1 } = coordinates;
    const { latitude: lat2, longitude: lng2 } = currentLocation.coords;
    
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance < 1 ? 
      `${Math.round(distance * 1000)}m away` : 
      `${distance.toFixed(1)}km away`;
  };

  return (
    <Card className={cn("md:hidden", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Location info with distance */}
          {address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-relaxed">{address}</p>
                {calculateDistance() && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {calculateDistance()}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-2">
            {phoneNumber && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-12 touch-target"
                  onClick={handleCall}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-12 touch-target"
                  onClick={handleMessage}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </>
            )}
            
            {(coordinates || address) && (
              <Button
                variant="default"
                size="sm"
                className="flex-1 h-12 touch-target"
                onClick={handleGetDirections}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Directions
              </Button>
            )}
          </div>

          {/* Additional quick links */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-10 touch-target text-xs"
              onClick={() => navigator.share?.({
                title: 'Check out this property',
                url: window.location.href
              })}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Share
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-10 touch-target text-xs"
              onClick={() => {
                // Add to favorites functionality
                console.log('Add to favorites');
              }}
            >
              ❤️ Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileActions;