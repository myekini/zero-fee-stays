import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Star,
  Heart,
  Eye,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  amenities: string[];
  description: string;
  available: boolean;
}

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [guests, setGuests] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recommended");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Simulate search loading when filters change
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => setIsSearching(false), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedLocation, priceRange, guests, sortBy]);

  // Auto-hide filters on mobile after selection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsFiltersVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Smart sorting logic
  const getSortedProperties = (properties: Property[]) => {
    switch (sortBy) {
      case "price-low":
        return [...properties].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...properties].sort((a, b) => b.price - a.price);
      case "rating":
        return [...properties].sort((a, b) => b.rating - a.rating);
      case "newest":
        return [...properties].reverse();
      default:
        return properties;
    }
  };

  // Sample properties data
  const properties: Property[] = [
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
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      amenities: ["Pool", "Beach Access", "WiFi", "Kitchen", "Parking"],
      description:
        "Stunning beachfront villa with panoramic ocean views, private pool, and direct beach access.",
      available: true,
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
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80",
      amenities: ["WiFi", "Kitchen", "Gym", "Doorman"],
      description:
        "Sleek downtown loft with city views, modern amenities, and walking distance to attractions.",
      available: true,
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
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      amenities: ["Fireplace", "Hot Tub", "WiFi", "Kitchen", "Mountain Views"],
      description:
        "Rustic mountain cabin with stunning views, hot tub, and easy access to skiing.",
      available: true,
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
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      amenities: ["WiFi", "Kitchen", "Historic Charm", "City Views"],
      description:
        "Charming historic apartment in the heart of the city with character and modern comforts.",
      available: true,
    },
    {
      id: "5",
      title: "Lakeside Cottage",
      location: "Niagara Falls, ON",
      price: 380,
      rating: 4.8,
      reviewCount: 94,
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80",
      amenities: ["Lake Access", "WiFi", "Kitchen", "Fireplace", "Deck"],
      description:
        "Charming lakeside cottage with stunning views and peaceful atmosphere.",
      available: true,
    },
    {
      id: "6",
      title: "Urban Loft",
      location: "Calgary, AB",
      price: 290,
      rating: 4.9,
      reviewCount: 167,
      guests: 4,
      bedrooms: 2,
      bathrooms: 1,
      image:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      amenities: ["WiFi", "Kitchen", "Gym", "City Views"],
      description:
        "Modern urban loft with city views and contemporary amenities.",
      available: true,
    },
  ];

  const filteredProperties = getSortedProperties(
    properties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation =
        !selectedLocation || property.location.includes(selectedLocation);
      const matchesPrice =
        property.price >= priceRange[0] && property.price <= priceRange[1];
      const matchesGuests = !guests || property.guests >= parseInt(guests);

      return matchesSearch && matchesLocation && matchesPrice && matchesGuests;
    })
  );

  const toggleFavorite = (propertyId: string) => {
    setFavorites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const locations = [
    "Vancouver",
    "Toronto",
    "Banff",
    "Montreal",
    "Niagara Falls",
    "Calgary",
  ];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-x-hidden transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-l from-hiddy-coral/5 to-transparent rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-r from-hiddy-teal/5 to-transparent rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50">
        <div className="container mx-auto px-6 py-6">
          {/* Back Button */}
          <div className="mb-4">
            <BackButton to="/" />
          </div>

          {/* Header content */}
          <div className="text-center max-w-4xl mx-auto mb-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center px-4 py-2 bg-hiddy-coral/10 rounded-full text-hiddy-coral font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Collection
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Discover Amazing
              <span className="block text-transparent bg-gradient-to-r from-hiddy-coral to-hiddy-teal bg-clip-text">
                Properties
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Explore our exclusive collection of premium accommodations with{" "}
              <span className="font-semibold text-slate-800">
                zero platform fees
              </span>{" "}
              and authentic local experiences.
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Top row - Search and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-hiddy-coral focus:bg-white"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                  className="px-4 py-3 border-2 border-slate-200 hover:border-hiddy-coral text-slate-700 hover:text-hiddy-coral rounded-xl transition-all duration-300 whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                </Button>
              </div>

              {/* View controls and sorting */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                {/* Sort dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-hiddy-coral min-w-0 flex-1 sm:flex-initial"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>

                {/* View mode toggle */}
                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="px-3 py-2 rounded-lg transition-all duration-300"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="px-3 py-2 rounded-lg transition-all duration-300"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters Sidebar */}
          <div
            className={`lg:w-1/4 transition-all duration-300 ${!isFiltersVisible ? "hidden lg:block" : "block"}`}
          >
            <div ref={filtersRef} className="space-y-6">
              <Card className="card-premium p-8 sticky top-8">
                <div className="space-y-8">
                  {/* Header */}
                  <div className="text-center">
                    <h3 className="font-display text-2xl font-bold text-slate-900 mb-2 flex items-center justify-center">
                      <SlidersHorizontal className="w-5 h-5 mr-3 text-hiddy-coral" />
                      Refine Search
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Find your perfect stay
                    </p>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={selectedLocation}
                        onChange={(e) => {
                          setSelectedLocation(e.target.value);
                          if (window.innerWidth < 1024) {
                            setTimeout(() => setIsFiltersVisible(false), 1000);
                          }
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-hiddy-coral"
                      >
                        <option value="">All Locations</option>
                        {locations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Price Range
                    </label>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([
                              priceRange[0],
                              parseInt(e.target.value),
                            ])
                          }
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                          ${priceRange[0]}
                        </div>
                        <div className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                          ${priceRange[1]}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Guests
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={guests}
                        onChange={(e) => {
                          setGuests(e.target.value);
                          if (window.innerWidth < 1024) {
                            setTimeout(() => setIsFiltersVisible(false), 1000);
                          }
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-hiddy-coral"
                      >
                        <option value="">Any number</option>
                        <option value="1">1+ guests</option>
                        <option value="2">2+ guests</option>
                        <option value="4">4+ guests</option>
                        <option value="6">6+ guests</option>
                        <option value="8">8+ guests</option>
                      </select>
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div className="pt-6 border-t border-slate-200">
                    <div className="glassmorphism-enhanced rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-hiddy-coral mb-1">
                        {filteredProperties.length}
                      </div>
                      <div className="text-sm text-slate-600 font-medium">
                        Properties Found
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedLocation("");
                      setPriceRange([0, 1000]);
                      setGuests("");
                    }}
                    className="w-full border-2 border-slate-200 hover:border-hiddy-coral text-slate-700 hover:text-hiddy-coral rounded-xl transition-all duration-300"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Enhanced Properties Grid/List */}
          <div
            className={`${isFiltersVisible ? "lg:w-3/4" : "lg:w-full"} flex-1 transition-all duration-300`}
          >
            {/* Results header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-hiddy-coral mr-3"></div>
                      Searching...
                    </>
                  ) : (
                    `${filteredProperties.length} Properties Available`
                  )}
                </h2>
                <p className="text-slate-600 mt-1">
                  Showing {viewMode === "grid" ? "grid" : "list"} view • Sorted
                  by {sortBy}
                </p>
              </div>

              {/* Quick stats */}
              <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Avg. $320/night</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>4.8 avg rating</span>
                </div>
              </div>
            </div>

            {filteredProperties.length === 0 ? (
              /* No results state */
              <div className="text-center py-12">
                <div className="glassmorphism-enhanced rounded-3xl p-12 max-w-md mx-auto">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    No properties found
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Try adjusting your filters or search terms to find more
                    properties.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedLocation("");
                      setPriceRange([0, 1000]);
                      setGuests("");
                    }}
                    className="bg-gradient-to-r from-hiddy-coral to-hiddy-teal text-white font-semibold rounded-xl"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProperties.map((property, index) => (
                  <div
                    key={property.id}
                    className="animate-slideInScale"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PropertyCard
                      property={property}
                      isFavorite={favorites.includes(property.id)}
                      onFavoriteToggle={toggleFavorite}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProperties.map((property, index) => (
                  <div
                    key={property.id}
                    className="animate-slideInScale"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <PropertyListCard
                      property={property}
                      isFavorite={favorites.includes(property.id)}
                      onFavoriteToggle={toggleFavorite}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination (if needed) */}
            {filteredProperties.length > 0 && (
              <div className="mt-16 text-center">
                <div className="glassmorphism-enhanced rounded-2xl p-6 inline-block">
                  <p className="text-slate-600 mb-4">
                    Showing all {filteredProperties.length} properties
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" className="rounded-xl">
                      Load More Properties
                    </Button>
                    <Button
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      variant="ghost"
                      className="rounded-xl"
                    >
                      Back to Top
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Property Card Component
const PropertyCard = ({
  property,
  isFavorite,
  onFavoriteToggle,
}: {
  property: Property;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle(property.id);
  };

  return (
    <Card
      className="card-premium overflow-hidden group cursor-pointer h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
      onClick={handleCardClick}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Enhanced overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-300 ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-600 hover:text-red-500"}`}
          />
        </button>

        {/* Available badge */}
        <Badge className="absolute top-4 left-4 bg-emerald-500 text-white font-semibold px-3 py-1 shadow-lg">
          Available Now
        </Badge>

        {/* Rating badge */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-slate-800">
            {property.rating}
          </span>
          <span className="text-xs text-slate-600">
            ({property.reviewCount})
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="text-lg font-bold text-slate-900">
            ${property.price}
          </span>
          <span className="text-sm text-slate-600">/night</span>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {/* Title and Location */}
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-hiddy-coral transition-colors duration-300">
              {property.title}
            </h3>
            <div className="flex items-center space-x-2 text-slate-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{property.location}</span>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{property.guests}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{property.bedrooms} bed</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{property.bathrooms} bath</span>
              </div>
            </div>
          </div>

          {/* Amenities preview */}
          <div className="flex flex-wrap gap-2">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-slate-100 text-slate-600 border-0"
              >
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs bg-slate-100 text-slate-600 border-0"
              >
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>

          {/* Action button */}
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-hiddy-coral to-hiddy-teal hover:from-hiddy-coral hover:to-hiddy-coral text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            <Eye className="w-5 h-5 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Enhanced Property List Card Component
const PropertyListCard = ({
  property,
  isFavorite,
  onFavoriteToggle,
}: {
  property: Property;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle(property.id);
  };

  return (
    <Card
      className="card-premium p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="relative flex-shrink-0">
          <img
            src={property.image}
            alt={property.title}
            className="w-full md:w-80 h-64 md:h-48 object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
          />

          {/* Enhanced overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-300 ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-600 hover:text-red-500"}`}
            />
          </button>

          {/* Available badge */}
          <Badge className="absolute top-4 left-4 bg-emerald-500 text-white font-semibold px-3 py-1 shadow-lg">
            Available Now
          </Badge>

          {/* Rating badge */}
          <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-slate-800">
              {property.rating}
            </span>
            <span className="text-xs text-slate-600">
              ({property.reviewCount})
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-display text-2xl font-bold text-slate-900 mb-2 group-hover:text-hiddy-coral transition-colors duration-300">
                  {property.title}
                </h3>
                <div className="flex items-center space-x-2 text-slate-600 mb-3">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{property.location}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">
                  ${property.price}
                </div>
                <div className="text-slate-600">per night</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 leading-relaxed text-lg line-clamp-2">
              {property.description}
            </p>

            {/* Property details */}
            <div className="flex flex-wrap items-center gap-6 text-slate-600">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">{property.guests} guests</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {property.bedrooms} bedrooms
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {property.bathrooms} bathrooms
                </span>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 4).map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-slate-100 text-slate-600 border-0 font-medium"
                >
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 4 && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-600 border-0 font-medium"
                >
                  +{property.amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Action section */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-slate-800">
                  {property.rating}
                </span>
                <span className="text-slate-500">
                  ({property.reviewCount} reviews)
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-hiddy-coral to-hiddy-teal hover:from-hiddy-coral hover:to-hiddy-coral text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg px-8"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              <Eye className="w-5 h-5 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Properties;
