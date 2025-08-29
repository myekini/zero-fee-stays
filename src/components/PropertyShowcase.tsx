import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, MapPin, Heart } from "lucide-react";
import PropertyCard from "./PropertyCard";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  image: string;
}

const PropertyShowcase = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
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

  const sampleProperties: Property[] = [
    {
      id: "1",
      title: "Luxury Beachfront Villa",
      location: "Vancouver, BC",
      price: 450,
      rating: 4.9,
      reviewCount: 127,
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    },
    {
      id: "2",
      title: "Modern Downtown Loft",
      location: "Toronto, ON",
      price: 280,
      rating: 4.8,
      reviewCount: 89,
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    },
    {
      id: "3",
      title: "Cozy Mountain Cabin",
      location: "Banff, AB",
      price: 320,
      rating: 4.9,
      reviewCount: 156,
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      image:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    },
    {
      id: "4",
      title: "Historic City Apartment",
      location: "Montreal, QC",
      price: 220,
      rating: 4.7,
      reviewCount: 203,
      guests: 3,
      bedrooms: 1,
      bathrooms: 1,
      image:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    },
  ];

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
      className="py-12 bg-gradient-to-b from-white via-slate-50/30 to-white relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-hiddy-coral/5 to-hiddy-teal/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-hiddy-teal/5 to-hiddy-sunset/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div
          className={`text-center max-w-4xl mx-auto mb-12 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center px-4 py-2 bg-hiddy-coral/10 rounded-full text-hiddy-coral font-medium text-sm mb-6">
            <Star className="w-4 h-4 mr-2 fill-current" />
            Handpicked Premium Properties
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Discover Amazing
            <span className="block text-transparent bg-gradient-to-r from-hiddy-coral to-hiddy-teal bg-clip-text">
              Destinations
            </span>
          </h2>

          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Experience world-class accommodations with{" "}
            <span className="font-semibold text-slate-800">
              zero platform fees
            </span>{" "}
            and authentic local connections that transform your travel
            experience.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium">Verified Properties</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Instant Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Enhanced Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {sampleProperties.map((property, index) => (
            <div
              key={property.id}
              className={`group ${isVisible ? "animate-slideInScale" : "opacity-0"}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PropertyCard
                {...property}
                isFavorite={favorites.includes(property.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div
          className={`text-center mt-8 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
          style={{ animationDelay: "0.6s" }}
        >
          <div className="relative glassmorphism-enhanced rounded-3xl p-8 max-w-4xl mx-auto">
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
                <Link to="/properties" className="group">
                  <button className="btn-gradient-terracotta-sage px-10 py-4 relative overflow-hidden z-20">
                    <span className="relative z-30 flex items-center text-white drop-shadow-lg font-bold">
                      Explore All Properties
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </Link>

                <div className="flex items-center gap-6 text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-hiddy-coral to-hiddy-teal rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-hiddy-teal to-hiddy-sunset rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-hiddy-sunset to-hiddy-coral rounded-full border-2 border-white"></div>
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
