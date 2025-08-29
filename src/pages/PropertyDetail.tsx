import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "@/components/ui/BackButton";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  ArrowLeft,
  Heart,
  Calendar,
  Wifi,
  Car,
  Coffee,
  TreePine,
  Tv,
  Snowflake,
  Utensils,
  Dumbbell,
  Waves,
  WashingMachine,
  Sun,
  Camera,
  Phone,
  Mail,
  Share2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  Clock,
  CheckCircle,
  MessageCircle,
  Zap,
  Globe,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookingModal from "@/components/BookingModal";
import PaymentModal from "@/components/PaymentModal";
import PropertyMap from "@/components/PropertyMap";
import Logo from "@/components/ui/Logo";

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  amenities: string[];
  house_rules?: string;
  check_in_time?: string;
  check_out_time?: string;
  host_id: string;
  rating: number;
  review_count: number;
  host: {
    name: string;
    avatar: string;
    verified: boolean;
    superhost: boolean;
    response_rate: number;
    response_time: string;
    joined_date: string;
  };
  images: string[];
  reviews: Review[];
}

interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
}

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Sample property data for different properties
  const propertiesData = {
    "1": {
      title: "Luxury Beachfront Villa",
      description:
        "A stunning beachfront villa with panoramic ocean views. This luxurious property features modern amenities, a private pool, and direct beach access. Perfect for families or groups looking for an unforgettable beach vacation.",
      location: "Beachfront District",
      city: "Vancouver",
      country: "Canada",
      price_per_night: 450,
      max_guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      property_type: "villa",
      amenities: [
        "wifi",
        "kitchen",
        "parking",
        "tv",
        "ac",
        "pool",
        "washer",
        "gym",
      ],
      house_rules:
        "No smoking, No pets, Quiet hours 10 PM - 8 AM, Maximum 8 guests",
      check_in_time: "15:00",
      check_out_time: "11:00",
      rating: 4.9,
      review_count: 127,
      host: {
        name: "Hiddy",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        verified: true,
        superhost: true,
        response_rate: 98,
        response_time: "1 hour",
        joined_date: "2020",
      },
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop",
      ],
    },
    "2": {
      title: "Modern Downtown Loft",
      description:
        "A sleek, modern loft in the heart of downtown. This stylish apartment features high ceilings, floor-to-ceiling windows, and contemporary furnishings. Perfect for business travelers or couples seeking a sophisticated urban experience.",
      location: "Downtown District",
      city: "Toronto",
      country: "Canada",
      price_per_night: 280,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      property_type: "loft",
      amenities: ["wifi", "kitchen", "parking", "tv", "ac", "washer"],
      house_rules:
        "No smoking, No pets, Quiet hours 11 PM - 7 AM, Maximum 4 guests",
      check_in_time: "15:00",
      check_out_time: "11:00",
      rating: 4.8,
      review_count: 89,
      host: {
        name: "Hiddy",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        verified: true,
        superhost: true,
        response_rate: 98,
        response_time: "1 hour",
        joined_date: "2020",
      },
      images: [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
      ],
    },
    "3": {
      title: "Cozy Mountain Cabin",
      description:
        "A charming mountain cabin surrounded by nature. This rustic yet modern cabin features a wood-burning fireplace, stunning mountain views, and all the comforts of home. Perfect for nature lovers and outdoor enthusiasts.",
      location: "Mountain View",
      city: "Banff",
      country: "Canada",
      price_per_night: 320,
      max_guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      property_type: "cabin",
      amenities: ["wifi", "kitchen", "parking", "tv", "heating", "washer"],
      house_rules:
        "No smoking, Pets allowed, Quiet hours 9 PM - 7 AM, Maximum 6 guests",
      check_in_time: "16:00",
      check_out_time: "10:00",
      rating: 4.9,
      review_count: 156,
      host: {
        name: "Hiddy",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        verified: true,
        superhost: true,
        response_rate: 98,
        response_time: "1 hour",
        joined_date: "2020",
      },
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop",
      ],
    },
    "4": {
      title: "Historic City Apartment",
      description:
        "A beautifully restored historic apartment in the heart of the city. This charming space combines classic architecture with modern amenities, featuring original details and contemporary comfort. Perfect for history buffs and culture enthusiasts.",
      location: "Historic District",
      city: "Montreal",
      country: "Canada",
      price_per_night: 220,
      max_guests: 3,
      bedrooms: 1,
      bathrooms: 1,
      property_type: "apartment",
      amenities: ["wifi", "kitchen", "parking", "tv", "ac"],
      house_rules:
        "No smoking, No pets, Quiet hours 10 PM - 8 AM, Maximum 3 guests",
      check_in_time: "14:00",
      check_out_time: "12:00",
      rating: 4.7,
      review_count: 203,
      host: {
        name: "Hiddy",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        verified: true,
        superhost: true,
        response_rate: 98,
        response_time: "1 hour",
        joined_date: "2020",
      },
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop",
      ],
    },
  };

  const amenitiesList = [
    { id: "wifi", label: "WiFi", icon: Wifi },
    { id: "parking", label: "Free parking", icon: Car },
    { id: "kitchen", label: "Kitchen", icon: Coffee },
    { id: "garden", label: "Garden", icon: TreePine },
    { id: "tv", label: "TV", icon: Tv },
    { id: "ac", label: "Air conditioning", icon: Snowflake },
    { id: "pool", label: "Pool", icon: Waves },
    { id: "washer", label: "Washer", icon: WashingMachine },
    { id: "gym", label: "Gym", icon: Dumbbell },
    { id: "restaurant", label: "Restaurant", icon: Utensils },
    { id: "heating", label: "Heating", icon: Sun },
  ];

  const sampleReviews: Review[] = [
    {
      id: "1",
      author: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      date: "2024-01-15",
      text: "Absolutely stunning property! The views were incredible and the host was incredibly responsive. The apartment was spotless and had everything we needed. Would definitely stay here again!",
    },
    {
      id: "2",
      author: "Michael Chen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      date: "2024-01-10",
      text: "Perfect location for exploring the city. The apartment is modern and well-equipped. The host provided excellent recommendations for local restaurants and attractions.",
    },
    {
      id: "3",
      author: "Emily Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 4,
      date: "2024-01-05",
      text: "Great stay overall! The apartment was clean and comfortable. The only minor issue was the WiFi was a bit slow at times, but everything else was perfect.",
    },
  ];

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      const propertyId = id || "1";
      const propertyData =
        propertiesData[propertyId as keyof typeof propertiesData];

      if (!propertyData) {
        console.error("Property not found:", propertyId);
        setProperty(null);
        return;
      }

      const sampleProperty: Property = {
        id: propertyId,
        ...propertyData,
        host_id: propertyId,
        reviews: sampleReviews,
      };

      setProperty(sampleProperty);
    } catch (error) {
      console.error("Error loading property:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const nextImage = () => {
    if (!property) return;
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    if (!property) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="animate-pulse">
          {/* Hero skeleton */}
          <div className="h-96 bg-gradient-to-br from-slate-200 to-slate-300" />

          <div className="container mx-auto px-6 py-8">
            {/* Back Button */}
            <div className="mb-6">
              <BackButton to="/properties" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Title skeleton */}
                <div className="space-y-4">
                  <div className="h-8 bg-slate-200 rounded-xl w-2/3" />
                  <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
                </div>

                {/* Content skeleton */}
                <div className="space-y-6">
                  <div className="h-6 bg-slate-200 rounded-lg w-1/4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded-lg w-full" />
                    <div className="h-4 bg-slate-200 rounded-lg w-4/5" />
                    <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
                  </div>
                </div>

                {/* Amenities skeleton */}
                <div className="space-y-4">
                  <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-4 bg-slate-200 rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking card skeleton */}
              <div className="h-96 bg-slate-200 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="glassmorphism-enhanced rounded-3xl p-16 max-w-md mx-auto">
            <div className="text-8xl mb-6">🏠</div>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-4">
              Property Not Found
            </h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/properties")}
                className="bg-gradient-to-r from-hiddy-coral to-hiddy-teal text-white font-semibold rounded-xl"
              >
                <Home className="w-5 h-5 mr-2" />
                Browse Properties
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="border-2 border-slate-200 hover:border-hiddy-coral text-slate-700 hover:text-hiddy-coral rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-x-hidden transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-l from-hiddy-coral/5 to-transparent rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-r from-hiddy-teal/5 to-transparent rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Enhanced Hero Section */}
      <div ref={heroRef} className="relative h-[600px] overflow-hidden">
        {/* Image carousel */}
        <div className="relative h-full">
          {property.images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentImageIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-110"
              }`}
            >
              <img
                src={image}
                alt={`${property.title} - Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop";
                }}
              />
            </div>
          ))}
        </div>

        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Navigation */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate(-1)}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-2xl px-6 py-3 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Logo size="sm" variant="white" type="full" />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleFavorite}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-2xl p-3 transition-all duration-300"
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-2xl p-3 transition-all duration-300"
            >
              <Share2 className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Image navigation arrows */}
        <button
          onClick={prevImage}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextImage}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Enhanced image indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {property.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative transition-all duration-500 ${
                index === currentImageIndex
                  ? "w-10 h-3 bg-white rounded-full"
                  : "w-3 h-3 bg-white/50 rounded-full hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        {/* Enhanced Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              {/* Property type badge */}
              <Badge className="mb-4 bg-hiddy-coral/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-4 py-2">
                {property.property_type.charAt(0).toUpperCase() +
                  property.property_type.slice(1)}
              </Badge>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                {property.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-lg">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2" />
                  <span className="font-medium">
                    {property.city}, {property.country}
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="w-6 h-6 mr-2 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{property.rating}</span>
                  <span className="ml-1 opacity-80">
                    ({property.review_count} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  <span className="font-medium">
                    Up to {property.max_guests} guests
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <BackButton to="/properties" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Enhanced Property Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glassmorphism-enhanced rounded-2xl p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-hiddy-coral" />
                <div className="text-2xl font-bold text-slate-900">
                  {property.max_guests}
                </div>
                <div className="text-sm text-slate-600 font-medium">Guests</div>
              </div>
              <div className="glassmorphism-enhanced rounded-2xl p-6 text-center">
                <Bed className="w-8 h-8 mx-auto mb-3 text-hiddy-teal" />
                <div className="text-2xl font-bold text-slate-900">
                  {property.bedrooms}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  Bedrooms
                </div>
              </div>
              <div className="glassmorphism-enhanced rounded-2xl p-6 text-center">
                <Bath className="w-8 h-8 mx-auto mb-3 text-hiddy-sunset" />
                <div className="text-2xl font-bold text-slate-900">
                  {property.bathrooms}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  Bathrooms
                </div>
              </div>
              <div className="glassmorphism-enhanced rounded-2xl p-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-3 text-yellow-500 fill-current" />
                <div className="text-2xl font-bold text-slate-900">
                  {property.rating}
                </div>
                <div className="text-sm text-slate-600 font-medium">Rating</div>
              </div>
            </div>

            {/* Enhanced Description */}
            <Card className="card-premium p-8">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-6 flex items-center">
                <Home className="w-7 h-7 mr-3 text-hiddy-coral" />
                About This Place
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {property.description}
              </p>
            </Card>

            {/* Enhanced Amenities */}
            <Card className="card-premium p-8">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-8 flex items-center">
                <Zap className="w-7 h-7 mr-3 text-hiddy-teal" />
                What This Place Offers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {amenitiesList.map((amenity) => {
                  const Icon = amenity.icon;
                  const isAvailable = property.amenities.includes(amenity.id);
                  return (
                    <div
                      key={amenity.id}
                      className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                        isAvailable
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-slate-50 border border-slate-200 opacity-50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg mr-4 ${
                          isAvailable ? "bg-emerald-100" : "bg-slate-200"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isAvailable ? "text-emerald-600" : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`font-medium ${
                          isAvailable ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {amenity.label}
                      </span>
                      {isAvailable && (
                        <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Property Map */}
            <PropertyMap
              location={property.location}
              city={property.city}
              country={property.country}
              className="card-premium"
            />

            {/* Enhanced House Rules */}
            {property.house_rules && (
              <Card className="card-premium p-8">
                <h2 className="font-display text-3xl font-bold text-slate-900 mb-6 flex items-center">
                  <Shield className="w-7 h-7 mr-3 text-hiddy-sunset" />
                  House Rules
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <p className="text-slate-700 leading-relaxed text-lg font-medium">
                    {property.house_rules}
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-slate-600">
                    <Clock className="w-5 h-5 mr-2 text-hiddy-teal" />
                    <span>Check-in: {property.check_in_time || "3:00 PM"}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Clock className="w-5 h-5 mr-2 text-hiddy-coral" />
                    <span>
                      Check-out: {property.check_out_time || "11:00 AM"}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Enhanced Reviews */}
            <Card className="card-premium p-8">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-8 flex items-center">
                <MessageCircle className="w-7 h-7 mr-3 text-hiddy-coral" />
                Guest Reviews ({property.review_count})
              </h2>

              {/* Reviews summary */}
              <div className="glassmorphism-enhanced rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-slate-900 mr-4">
                      {property.rating}
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(property.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-slate-600 font-medium">
                        Based on {property.review_count} reviews
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 font-semibold px-4 py-2">
                    Highly Rated
                  </Badge>
                </div>
              </div>

              <div className="space-y-8">
                {property.reviews.map((review, index) => (
                  <div
                    key={review.id}
                    className="group p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-6">
                      <div className="relative">
                        <img
                          src={review.avatar}
                          alt={review.author}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-hiddy-coral/30 transition-all duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                        <div className="hidden w-16 h-16 rounded-2xl bg-gradient-to-br from-hiddy-coral to-hiddy-teal flex items-center justify-center text-white font-bold text-lg">
                          {review.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-hiddy-coral transition-colors">
                              {review.author}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium">
                              {review.date}
                            </p>
                          </div>
                          <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-bold text-yellow-700">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-lg">
                          "{review.text}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Enhanced Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="card-premium p-8 sticky top-8 shadow-2xl">
              {/* Price header */}
              <div className="text-center mb-8">
                <div className="relative">
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    ${property.price_per_night}
                  </div>
                  <div className="text-slate-600 text-lg font-medium">
                    per night
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    BEST RATE
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <div className="glassmorphism-enhanced rounded-2xl p-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center text-emerald-600">
                      <CheckCircle className="w-5 h-5 mr-3" />
                      <span className="font-medium">Free cancellation</span>
                    </div>
                    <div className="flex items-center text-emerald-600">
                      <CheckCircle className="w-5 h-5 mr-3" />
                      <span className="font-medium">No booking fees</span>
                    </div>
                    <div className="flex items-center text-emerald-600">
                      <CheckCircle className="w-5 h-5 mr-3" />
                      <span className="font-medium">Instant confirmation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reserve button */}
              <Button
                onClick={() => setShowBookingModal(true)}
                className="w-full h-14 mb-6 btn-gradient-terracotta-sage text-lg"
              >
                <Calendar className="w-6 h-6 mr-3" />
                Reserve Now
              </Button>

              <p className="text-center text-sm text-slate-500 mb-8 font-medium">
                🔒 You won't be charged until confirmation
              </p>

              {/* Enhanced Host Info */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="font-display text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-3 text-hiddy-coral" />
                  Your Host
                </h3>

                <div className="glassmorphism-enhanced rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <img
                        src={property.host.avatar}
                        alt={property.host.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <div className="hidden w-16 h-16 rounded-2xl bg-gradient-to-br from-hiddy-coral to-hiddy-teal flex items-center justify-center text-white font-bold text-xl ring-4 ring-white shadow-lg">
                        {property.host.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      {property.host.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-slate-900 text-lg">
                          {property.host.name}
                        </span>
                        {property.host.superhost && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 font-semibold px-3 py-1">
                            Superhost
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-hiddy-teal" />
                          <span>Responds in {property.host.response_time}</span>
                        </div>
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-hiddy-coral" />
                          <span>
                            {property.host.response_rate}% response rate
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="border-2 border-hiddy-teal text-hiddy-teal hover:bg-hiddy-teal hover:text-white rounded-xl transition-all duration-300 font-semibold"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button
                      variant="outline"
                      className="border-2 border-hiddy-coral text-hiddy-coral hover:bg-hiddy-coral hover:text-white rounded-xl transition-all duration-300 font-semibold"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {property && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          property={{
            id: property.id,
            title: property.title,
            price_per_night: property.price_per_night,
            max_guests: property.max_guests,
            images: property.images,
          }}
          onBookingConfirm={(details) => {
            setBookingDetails(details);
            setIsPaymentModalOpen(true);
            setShowBookingModal(false);
          }}
        />
      )}

      {/* Payment Modal */}
      {property && bookingDetails && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          property={{
            id: property.id,
            title: property.title,
            location: `${property.city}, ${property.country}`,
            price_per_night: property.price_per_night,
            images: [property.images[0]],
          }}
          bookingDetails={bookingDetails}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
