"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Star, MapPin, Heart, Loader2 } from "lucide-react";
import PropertyCard from "./PropertyCard";
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
  };
  is_featured: boolean;
  is_active?: boolean;
  created_at: string;
}

const PropertyShowcase = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "/api/properties?limit=4&status=published"
        );
        const data = await response.json();

        if (data.success && data.properties) {
          setProperties(data.properties.slice(0, 4)); // Take first 4 properties
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Transform property data to ensure compatibility with PropertyCard
  const transformedProperties = properties.map((property) => ({
    ...property,
    images: property.metrics?.images ||
      property.property_images?.map((img) => img.image_url) || [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      ],
    is_featured: property.is_featured || false,
    is_active: property.is_active ?? true,
  }));

  const handleFavoriteToggle = (propertyId: string) => {
    setFavorites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <section
      ref={sectionRef}
      className="py-12 bg-gradient-to-b from-background via-slate-50 dark:via-slate-900 to-background relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-brand-600/10 to-brand-400/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-brand-300/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div
          className={`text-center max-w-4xl mx-auto mb-12 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center px-4 py-2 bg-brand-600/10 rounded-full text-brand-600 font-medium text-sm mb-6">
            <Star className="w-4 h-4 mr-2 fill-current" />
            Handpicked Premium Properties
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Discover Amazing
            <span className="block text-transparent bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text">
              Destinations
            </span>
          </h2>

          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Experience world-class accommodations with{" "}
            <span className="font-semibold text-foreground">
              zero platform fees
            </span>{" "}
            and authentic local connections that transform your travel
            experience.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-600 rounded-full"></div>
              <span className="text-sm font-medium">Verified Properties</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-400 rounded-full"></div>
              <span className="text-sm font-medium">Instant Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Enhanced Property Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            <span className="ml-2 text-neutral-600">Loading properties...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {transformedProperties.length > 0 ? (
              transformedProperties.map((property, index) => (
                <div
                  key={property.id}
                  className={`group ${isVisible ? "animate-slideInScale" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PropertyCard
                    property={property}
                    isFavorite={favorites.includes(property.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <MapPin className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No properties available
                </h3>
                <p className="text-neutral-600">
                  Check back soon for new properties!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Enhanced CTA Section */}
        <div
          className={`text-center mt-8 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
          style={{ animationDelay: "0.6s" }}
        >
              <div className="relative rounded-3xl p-8 max-w-4xl mx-auto card-premium-modern">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, currentColor 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              ></div>
            </div>

            <div className="relative z-10">
              <h3 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Ready to Explore More?
              </h3>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Join thousands of travelers who've discovered the joy of direct
                booking. No fees, no middleman, just authentic experiences.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/properties" className="group">
                  <Button variant="brandOnBlack" className="px-10 py-4 font-bold">
                    <span className="flex items-center">
                      Explore All Properties
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>

                <div className="flex items-center gap-6 text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-400 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-neutral-800 to-neutral-600 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-400 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="text-sm font-medium">
                      100+ Happy Guests
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyShowcase;
