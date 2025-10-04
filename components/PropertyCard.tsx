"use client";

import { useState } from "react";
import { Heart, Star, MapPin, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

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
  property_images?: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
  metrics?: {
    images: string[];
    avg_rating?: number;
    review_count?: number;
  };
  rating?: number;
  review_count?: number;
  is_active: boolean;
  is_featured?: boolean;
  created_at: string;
}

interface PropertyCardProps {
  property: Property;
  viewMode?: "grid" | "list";
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
}

const PropertyCard = ({
  property,
  viewMode = "grid",
  isFavorite = false,
  onFavoriteToggle,
}: PropertyCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(property.id);
  };

  const handleCardClick = () => {
    router.push(`/property/${property.id}`);
  };

  const imageUrl =
    property.property_images?.[0]?.image_url ||
    property.metrics?.images?.[0] ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop";

  if (viewMode === "list") {
    return (
      <Card
className="card-premium-modern rounded-lg cursor-pointer group hover:shadow-glass transition-shadow"
        onClick={handleCardClick}
      >
        <div className="flex">
          <div className="relative w-64 h-48 overflow-hidden bg-muted flex-shrink-0">
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-4 right-4 p-2 bg-card rounded-full shadow-sm">
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                strokeWidth={1.5}
              />
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} />
<span className="text-sm text-foreground/80">{property.address}</span>
                </div>
              </div>

              <p className="text-muted-foreground text-sm line-clamp-2">
                {property.description}
              </p>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" strokeWidth={1.5} />
                  <span>{property.max_guests} guests</span>
                </div>
                <span>{property.bedrooms} bedrooms</span>
                <span>{property.bathrooms} bathrooms</span>
                <span className="capitalize">{property.property_type}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-2xl font-bold text-foreground">
                    ${property.price_per_night}
                  </span>
                  <span className="text-muted-foreground"> / night</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" strokeWidth={1.5} />
                  Available now
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
className="card-premium-modern rounded-xl overflow-hidden cursor-pointer group hover:shadow-glass transition-all duration-300"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted/60 animate-pulse" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 p-2.5 bg-card/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground hover:text-red-500"
            }`}
            strokeWidth={2}
          />
        </button>

        {/* Verification Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
          {property.is_featured && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1.5">
              <span className="text-sm">⭐</span>
              <span>Featured</span>
            </div>
          )}
          {(property as any).is_verified && (
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1.5">
              <span className="text-sm">✓</span>
              <span>Verified</span>
            </div>
          )}
          {property.metrics?.avg_rating &&
            property.metrics.avg_rating >= 4.5 && (
              <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                <span className="text-sm">★</span>
                <span>Top Rated</span>
              </div>
            )}
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-4 left-4 transform group-hover:scale-105 transition-transform duration-300">
          <div className="bg-card/95 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">
                ${property.price_per_night}
              </span>
              <span className="text-xs text-muted-foreground font-medium">/night</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">Zero platform fees</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-3">
          {/* Title & Type */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {property.title}
              </h3>
            </div>
            <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {property.property_type}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 text-primary" strokeWidth={2} />
<span className="text-sm line-clamp-1 font-medium text-foreground/80">{property.address}</span>
          </div>

          {/* Quick Details */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-lg">
              <Users className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
              <span className="font-medium">{property.max_guests}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-lg">
              <span className="font-medium">{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-lg">
              <span className="font-medium">{property.bathrooms} bath</span>
            </div>
          </div>

          {/* Rating & CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {(property.metrics?.avg_rating || property.rating) ? (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={2} />
                <span className="text-sm font-bold text-foreground">
                  {property.metrics?.avg_rating || property.rating}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  ({property.metrics?.review_count || property.review_count || 0} reviews)
                </span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">New listing</div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View Details →
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;
