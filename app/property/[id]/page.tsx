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
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { EnhancedBookingModal } from "@/components/EnhancedBookingModal";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { PropertyReviews } from "@/components/PropertyReviews";
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

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  "wi-fi": Wifi,
  internet: Wifi,
  parking: Car,
  "free parking": Car,
  kitchen: Coffee,
  pool: Waves,
  swimming: Waves,
  gym: Users,
  fitness: Users,
  "air conditioning": Waves,
  ac: Waves,
  heating: Waves,
  tv: Coffee,
  television: Coffee,
  washer: Coffee,
  dryer: Coffee,
  "hot tub": Waves,
  jacuzzi: Waves,
  balcony: MapPin,
  patio: MapPin,
  garden: MapPin,
  workspace: Coffee,
  desk: Coffee,
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
            name: "Hiddy",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            verified: true,
          };

          if (data.property.host_id) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("id, first_name, last_name, avatar_url, is_host")
              .eq("id", data.property.host_id)
              .single();

            if (profileData) {
              const hostName = `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim();
              hostInfo = {
                id: profileData.id,
                name: hostName || "Hiddy",
                avatar: profileData.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-white mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 font-light">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-950">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-light text-slate-900 dark:text-white">Property Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400">The property you're looking for doesn't exist or has been removed.</p>
          </div>
          <Button 
            onClick={() => router.push("/properties")}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200"
          >
            Browse All Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-950">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium transition-colors -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Properties</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
              >
                <Share className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Image Gallery */}
            <div className="relative bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden aspect-[16/10]">
              <img
                src={property.images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />

              {/* Navigation Arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + property.images.length) % property.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-900 hover:scale-105 transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % property.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-900 hover:scale-105 transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white rotate-180" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {property.images.length}
              </div>

              {/* View on Map Badge */}
              <div className="absolute bottom-4 left-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`, '_blank');
                  }}
                  className="bg-white/90 hover:bg-white text-slate-900 backdrop-blur-sm shadow-lg rounded-xl px-4 py-2 font-medium transition-all duration-200"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  View Map
                </Button>
              </div>
            </div>

            {/* Image Thumbnails */}
            {property.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {property.images.slice(0, 6).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden transition-all duration-200 ${
                      currentImageIndex === index
                        ? "ring-2 ring-slate-900 dark:ring-white ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Property Information Card */}
            <Card className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              {/* Property Header */}
              <div className="space-y-4">
                {property.is_featured && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-950 dark:to-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                    ⭐ Featured Property
                  </Badge>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                      {property.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{property.address}</span>
                      </div>
                      {property.rating && (
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-slate-900 dark:text-white">{property.rating.toFixed(1)}</span>
                          <span>({property.review_count || 0} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                    ${property.price_per_night.toLocaleString()}
                    <span className="text-lg text-slate-500 dark:text-slate-400 font-normal ml-1">/night</span>
                  </div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    ✓ Zero fees • Free cancellation
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white px-8 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Reserve Now
                </Button>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <Users className="w-5 h-5 text-slate-600 dark:text-slate-400 mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{property.max_guests}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Guests</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <Bed className="w-5 h-5 text-slate-600 dark:text-slate-400 mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{property.bedrooms}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Bedrooms</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <Bath className="w-5 h-5 text-slate-600 dark:text-slate-400 mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{property.bathrooms}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Bathrooms</div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  About
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  {property.description || "Modern, well-appointed space with premium amenities. Ideal for comfortable short or extended stays."}
                </p>
              </div>

              <Separator className="my-6" />

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.amenities.map((amenity, index) => {
                    const amenityKey = amenity.toLowerCase().trim();
                    const Icon = amenityIcons[amenityKey] || CheckCircle;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Booking and Host */}
          <div className="lg:col-span-4 space-y-6">
            {/* Booking Card - Sticky */}
            <div className="lg:sticky lg:top-24">
              <Card className="p-6 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Book Your Stay
                  </h3>

                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4">
                    <AvailabilityCalendar
                      propertyId={property.id}
                      onRangeSelect={(range) => setDateRange(range)}
                      selectedRange={dateRange}
                      showSelectedDateOnly={true}
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white py-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => setIsBookingModalOpen(true)}
                  >
                    Check Availability
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Shield className="w-4 h-4" />
                    <span>You won't be charged yet</span>
                  </div>
                </div>
              </Card>

              {/* Host Information */}
              {property.host && (
                <Card className="p-6 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Hosted by {property.host.name}
                    </h3>

                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 ring-2 ring-slate-200 dark:ring-slate-700">
                        <AvatarImage src={property.host.avatar} alt={property.host.name} />
                        <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 text-xl font-bold">
                          {property.host.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-base font-semibold text-slate-900 dark:text-white">
                            {property.host.name}
                          </div>
                          {property.host.verified && (
                            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Joined in 2024
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900 dark:text-white">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {property.rating || 4.9}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{property.review_count || 128}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">2+</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Years</div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {property.host.name === 'Hiddy'
                        ? 'Premium stays with zero fees. Exceptional service guaranteed.'
                        : `Passionate about hosting. Committed to amazing experiences.`
                      }
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Message
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Call
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
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

      {/* Reviews Section */}
      <div className="container mx-auto px-4 py-12">
        <PropertyReviews propertyId={property.id} />
      </div>
    </div>
  );
};

const PropertyDetailWithErrorBoundary = () => (
  <ErrorBoundary>
    <PropertyDetailPage />
  </ErrorBoundary>
);

export default PropertyDetailWithErrorBoundary;
