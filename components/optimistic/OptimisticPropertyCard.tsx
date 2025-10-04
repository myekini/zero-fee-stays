"use client";

import { useState } from "react";
import { Heart, Star, MapPin, Users, Calendar, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useOptimisticProperties } from "@/hooks/useOptimisticProperties";
import { Button } from "@/components/ui/button";

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
  is_favorite?: boolean;
  is_featured?: boolean;
  is_active: boolean;
  created_at: string;
}

interface OptimisticPropertyCardProps {
  property: Property;
  viewMode?: "grid" | "list";
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  className?: string;
}

export function OptimisticPropertyCard({
  property,
  viewMode = "grid",
  onFavoriteToggle,
  className = "",
}: OptimisticPropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/property/${property.id}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onFavoriteToggle) {
      await onFavoriteToggle(property.id, property.is_favorite || false);
    }
  };

  const imageUrl =
    property.property_images?.[0]?.image_url ||
    property.metrics?.images?.[0] ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop";

  // Show loading state for optimistic updates
  const isOptimisticallyUpdating =
    property.is_favorite !== undefined && (property as any).isOptimistic;

  if (viewMode === "list") {
    return (
      <Card
        className={`bg-white rounded-lg shadow-sm cursor-pointer group hover:shadow-md transition-shadow ${className} ${
          isOptimisticallyUpdating ? "opacity-75" : ""
        }`}
        onClick={handleCardClick}
      >
        <div className="flex">
          <div className="relative w-48 h-40 flex-shrink-0 bg-neutral-100">
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover rounded-l-lg"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
            )}

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300"
              disabled={isOptimisticallyUpdating}
            >
              {isOptimisticallyUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
              ) : (
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    property.is_favorite
                      ? "fill-red-500 text-red-500"
                      : "text-neutral-600 hover:text-red-500"
                  }`}
                  strokeWidth={1.5}
                />
              )}
            </button>
          </div>

          <div className="flex-1 p-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1">
                {property.title}
              </h3>

              <div className="flex items-left gap-1.5 text-neutral-600">
                <MapPin className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm">{property.address}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" strokeWidth={1.5} />
                  <span>{property.max_guests}</span>
                </div>
                <span>•</span>
                <span>{property.bedrooms} bed</span>
                <span>•</span>
                <span>{property.bathrooms} bath</span>
              </div>

              {(property.metrics?.avg_rating || property.rating) && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-neutral-700">
                    {property.metrics?.avg_rating || property.rating}
                  </span>
                  <span className="text-xs text-neutral-500">
                    (
                    {property.metrics?.review_count ||
                      property.review_count ||
                      0}
                    )
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-neutral-900">
                    ${property.price_per_night}
                  </span>
                  <span className="text-sm text-neutral-600">/night</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={`bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer group hover:shadow-2xl transition-all duration-300 border-0 ${
          isOptimisticallyUpdating ? "opacity-75" : ""
        }`}
        onClick={handleCardClick}
      >
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-neutral-100">
          <img
            src={imageUrl}
            alt={property.title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
          )}

          {/* Favorite Button */}
          <motion.button
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={isOptimisticallyUpdating}
          >
            {isOptimisticallyUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            ) : (
              <Heart
                className={`w-4 h-4 transition-colors ${
                  property.is_favorite
                    ? "fill-red-500 text-red-500"
                    : "text-neutral-600 hover:text-red-500"
                }`}
                strokeWidth={1.5}
              />
            )}
          </motion.button>

          {/* Verification Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1">
            {property.is_featured && (
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                ⭐ Featured
              </div>
            )}
            <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
              ✅ Verified
            </div>
            {property.metrics?.avg_rating &&
              property.metrics.avg_rating >= 4.5 && (
                <div className="bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                  🏆 Top Rated
                </div>
              )}
          </div>

          {/* Price Overlay */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-neutral-900">
                  ${property.price_per_night}
                </span>
                <span className="text-xs text-neutral-600 font-medium">
                  /night
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1 group-hover:text-brand-600 transition-colors duration-200">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-neutral-600">
              <MapPin className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-sm line-clamp-1">{property.address}</span>
            </div>

            {/* Quick Details */}
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" strokeWidth={1.5} />
                <span>{property.max_guests}</span>
              </div>
              <span>•</span>
              <span>{property.bedrooms} bed</span>
              <span>•</span>
              <span>{property.bathrooms} bath</span>
            </div>

            {/* Rating */}
            {(property.metrics?.avg_rating || property.rating) && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-neutral-700">
                  {property.metrics?.avg_rating || property.rating}
                </span>
                <span className="text-xs text-neutral-500">
                  (
                  {property.metrics?.review_count || property.review_count || 0}
                  )
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default OptimisticPropertyCard;
