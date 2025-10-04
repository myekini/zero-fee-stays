"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  ArrowLeft,
  Share,
  Heart,
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Coffee,
  Waves,
  Shield,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { EnhancedBookingModal } from "@/components/EnhancedBookingModal";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { supabase } from "@/integrations/supabase/client";

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  amenities: string[];
  images: string[];
  is_featured: boolean;
  rating?: number;
  review_count?: number;
  host_id: string;
  host?: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
}

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  kitchen: Coffee,
  pool: Waves,
  gym: Users,
};

const PropertyDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Fetch property data from API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/properties/${params.id}`);
        const data = await response.json();

        if (data.success && data.property) {
          // Fetch host profile from Supabase
          let hostInfo = {
            id: data.property.host_id,
            name: "Host",
            avatar: "https://github.com/shadcn.png",
            verified: false,
          };

          if (data.property.host_id) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("id, first_name, last_name, avatar_url, is_host")
              .eq("id", data.property.host_id)
              .single();

            if (profileData) {
              hostInfo = {
                id: profileData.id,
                name: `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() || "Host",
                avatar: profileData.avatar_url || "https://github.com/shadcn.png",
                verified: profileData.is_host === true,
              };
            }
          }

          // Transform the property data
          const transformedProperty: Property = {
            id: data.property.id,
            title: data.property.title,
            description: data.property.description,
            address: data.property.address,
            price_per_night: data.property.price_per_night,
            max_guests: data.property.max_guests,
            bedrooms: data.property.bedrooms,
            bathrooms: data.property.bathrooms,
            property_type: data.property.property_type,
            amenities: data.property.amenities || [],
            images: data.property.metrics?.images || [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
              "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop",
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop",
            ],
            is_featured: data.property.is_featured || false,
            rating: data.property.rating || data.property.metrics?.avg_rating || 4.5,
            review_count: data.property.review_count || data.property.metrics?.review_count || 0,
            host_id: data.property.host_id,
            host: hostInfo,
          };

          setProperty(transformedProperty);
        } else {
          console.error("Failed to fetch property:", data.error);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Property link has been copied to clipboard",
    });
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite
        ? "Property removed from your favorites"
        : "Property added to your favorites",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Property not found</p>
          <Button onClick={() => router.push("/properties")}>
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleFavorite}>
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="relative h-[400px] bg-muted group">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Navigation Arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((currentImageIndex - 1 + property.images.length) % property.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/90 p-3 rounded-full shadow-lg hover:bg-card hover:scale-110 transition-all"
                    >
                      <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((currentImageIndex + 1) % property.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/90 p-3 rounded-full shadow-lg hover:bg-card hover:scale-110 transition-all"
                    >
                      <ArrowLeft className="w-5 h-5 text-foreground rotate-180" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </div>
            </Card>

            {/* Property Info */}
            <Card className="p-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      {property.title}
                    </h1>
                    {property.is_featured && (
                      <Badge>Featured</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{property.address}</span>
                    </div>
                    {property.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{property.rating}</span>
                        <span className="text-sm">
                          ({property.review_count} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Property Details */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.max_guests}</div>
                    <div className="text-sm text-muted-foreground">Guests</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Bed className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Bath className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Badge variant="outline" className="mx-auto capitalize">
                      {property.property_type}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">About this place</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => {
                      const Icon =
                        amenityIcons[amenity as keyof typeof amenityIcons] || Shield;
                      return (
                        <div key={amenity} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="capitalize">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Host Info */}
                {property.host && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Hosted by</h3>
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={property.host.avatar} />
                        <AvatarFallback>
                          {property.host.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{property.host.name}</h4>
                          {property.host.verified && (
                            <Shield className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Verified Host
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6 shadow-xl">
                <div className="space-y-6">
                  {/* Price */}
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">${property.price_per_night}</span>
                      <span className="text-muted-foreground">/night</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Zero booking fees • 100% to host
                    </div>
                  </div>

                  <Separator />

                  {/* Calendar */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Select dates</h3>
                    <AvailabilityCalendar
                      propertyId={property.id}
                      selectedRange={dateRange}
                      onRangeSelect={setDateRange}
                      className="w-full"
                    />
                  </div>

                  <Separator />

                  {/* Reserve Button */}
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-base"
                    onClick={() => {
                      console.log("Reserve Now clicked!");
                      setIsBookingModalOpen(true);
                    }}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Reserve Now
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Free cancellation • You won't be charged yet
                  </p>

                  {/* Trust Badges */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold">Secure Booking</div>
                        <div className="text-xs text-muted-foreground">Protected payment</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold">Instant Booking</div>
                        <div className="text-xs text-muted-foreground">Book with confidence</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Booking Modal */}
      <EnhancedBookingModal
        property={{
          id: property.id,
          title: property.title,
          price_per_night: property.price_per_night,
          max_guests: property.max_guests,
          images: property.images,
          location: property.address,
          rating: property.rating,
          review_count: property.review_count,
          cleaning_fee: 0, // Zero fees
          service_fee_percentage: 0, // Zero fees
          cancellation_policy: "Free cancellation up to 24 hours before check-in",
          check_in_time: "3:00 PM",
          check_out_time: "11:00 AM",
          house_rules: ["No smoking", "No pets", "No parties"],
          amenities: property.amenities,
          host_id: property.host_id,
        }}
        isOpen={isBookingModalOpen}
        onClose={() => {
          console.log("Closing modal");
          setIsBookingModalOpen(false);
        }}
        initialDateRange={dateRange}
      />
    </div>
  );
};

const PropertyDetailWithErrorBoundary = () => (
  <ErrorBoundary>
    <PropertyDetailPage />
  </ErrorBoundary>
);

export default PropertyDetailWithErrorBoundary;
