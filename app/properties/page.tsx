"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LoadingSpinner,
  LoadingOverlay,
} from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Grid, List, Search } from "lucide-react";

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
  is_active: boolean;
  created_at: string;
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search filters
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    guests: searchParams.get("guests") || "",
    property_type: searchParams.get("property_type") || "",
  });

  // Debounced fetch to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/properties?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProperties(data.properties || []);
      } else {
        setError(data.error || "Failed to fetch properties");
      }
    } catch (err) {
      setError("An error occurred while fetching properties");
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      min_price: "",
      max_price: "",
      guests: "",
      property_type: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Enhanced Page Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/80 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center text-white max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>{properties.length} properties available</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Find Your Perfect Stay
            </h1>
            <p className="text-lg lg:text-xl text-white/90 mb-6 leading-relaxed">
              Discover exceptional properties with <span className="font-bold text-white">zero platform fees</span>.
              Direct booking, better prices, authentic experiences.
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold">0%</div>
                <div className="text-sm text-white/80">Platform Fees</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-white/80">Host Earnings</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter destination"
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange("location", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price Range (CAD)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="$0"
                      type="number"
                      value={filters.min_price}
                      onChange={(e) =>
                        handleFilterChange("min_price", e.target.value)
                      }
                    />
                    <Input
                      placeholder="$1000+"
                      type="number"
                      value={filters.max_price}
                      onChange={(e) =>
                        handleFilterChange("max_price", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Guests
                  </label>
                  <Select
                    value={filters.guests}
                    onValueChange={(value) =>
                      handleFilterChange("guests", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any number</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Property Type
                  </label>
                  <Select
                    value={filters.property_type}
                    onValueChange={(value) =>
                      handleFilterChange("property_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="cabin">Cabin</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Properties List */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {loading
                      ? "Searching..."
                      : `${properties.length} Properties Found`}
                  </h2>
                  <p className="text-muted-foreground">
                    Zero platform fees on all bookings
                  </p>
                  {error && (
                    <p className="text-destructive text-sm mt-2">{error}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-background shadow-sm" : ""}
                  >
                    <Grid className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Grid</span>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-background shadow-sm" : ""}
                  >
                    <List className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">List</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Properties Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
className="card-premium-modern p-6 sticky top-4"
                  >
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No properties found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading properties...</p>
              </div>
            </div>
          </div>
        }
      >
        <PropertiesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
