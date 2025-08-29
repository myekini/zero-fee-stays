import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  ArrowRight,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface LocationSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const Hero = () => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // State for location search
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // State for dates
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [guests, setGuests] = useState("1");

  // Background images for premium feel
  const backgroundImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80",
    "https://images.unsplash.com/photo-1521783988139-89397d761dce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80",
  ];

  // Debounced location search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (locationQuery.trim()) {
        fetchLocationSuggestions(locationQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [locationQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLocationSuggestions = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Using OpenCage Geocoding API with your credentials
      const apiKey =
        import.meta.env.VITE_OPENCAGE_API_KEY ||
        "ed66c7b238734c3094daab6b2ccf1757";
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&key=${apiKey}&limit=5&countrycode=us,ca,gb,au,de,fr,es,it,nl,se,no,dk,fi,ch,at,be,ie,pt,gr,pl,cz,hu,ro,bg,hr,si,sk,lt,lv,ee,mt,cy,lu&language=en`
      );

      if (response.ok) {
        const data = await response.json();
        const suggestions = data.results.map((result: any) => ({
          place_id: result.geometry.lat + "," + result.geometry.lng,
          description: result.formatted,
          structured_formatting: {
            main_text:
              result.components.city ||
              result.components.town ||
              result.components.village ||
              result.components.state ||
              result.components.country ||
              "",
            secondary_text:
              result.components.country || result.components.state || "",
          },
          coordinates: {
            lat: result.geometry.lat,
            lng: result.geometry.lng,
          },
        }));
        setSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        console.error("OpenCage API error:", response.status);
        // Fallback to mock data if API fails
        setSuggestions([
          {
            place_id: "1",
            description: "New York, NY, USA",
            structured_formatting: {
              main_text: "New York",
              secondary_text: "NY, USA",
            },
            coordinates: { lat: 40.7128, lng: -74.006 },
          },
          {
            place_id: "2",
            description: "Los Angeles, CA, USA",
            structured_formatting: {
              main_text: "Los Angeles",
              secondary_text: "CA, USA",
            },
            coordinates: { lat: 34.0522, lng: -118.2437 },
          },
          {
            place_id: "3",
            description: "London, UK",
            structured_formatting: {
              main_text: "London",
              secondary_text: "UK",
            },
            coordinates: { lat: 51.5074, lng: -0.1278 },
          },
          {
            place_id: "4",
            description: "Paris, France",
            structured_formatting: {
              main_text: "Paris",
              secondary_text: "France",
            },
            coordinates: { lat: 48.8566, lng: 2.3522 },
          },
          {
            place_id: "5",
            description: "Tokyo, Japan",
            structured_formatting: {
              main_text: "Tokyo",
              secondary_text: "Japan",
            },
            coordinates: { lat: 35.6762, lng: 139.6503 },
          },
        ]);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      // Fallback to mock data for demo
      setSuggestions([
        {
          place_id: "1",
          description: "New York, NY, USA",
          structured_formatting: {
            main_text: "New York",
            secondary_text: "NY, USA",
          },
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
        {
          place_id: "2",
          description: "Los Angeles, CA, USA",
          structured_formatting: {
            main_text: "Los Angeles",
            secondary_text: "CA, USA",
          },
          coordinates: { lat: 34.0522, lng: -118.2437 },
        },
        {
          place_id: "3",
          description: "London, UK",
          structured_formatting: { main_text: "London", secondary_text: "UK" },
          coordinates: { lat: 51.5074, lng: -0.1278 },
        },
        {
          place_id: "4",
          description: "Paris, France",
          structured_formatting: {
            main_text: "Paris",
            secondary_text: "France",
          },
          coordinates: { lat: 48.8566, lng: 2.3522 },
        },
        {
          place_id: "5",
          description: "Tokyo, Japan",
          structured_formatting: {
            main_text: "Tokyo",
            secondary_text: "Japan",
          },
          coordinates: { lat: 35.6762, lng: 139.6503 },
        },
      ]);
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setSelectedLocation(suggestion.description);
    setLocationQuery(suggestion.structured_formatting.main_text);
    setSelectedCoordinates(suggestion.coordinates || null);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    console.log("Search button clicked", { selectedLocation, checkInDate, checkOutDate, guests });
    
    if (selectedLocation && checkInDate && checkOutDate) {
      console.log("Navigating to properties with:", {
        location: selectedLocation,
        coordinates: selectedCoordinates,
        checkIn: checkInDate.toISOString().split("T")[0],
        checkOut: checkOutDate.toISOString().split("T")[0],
        guests: parseInt(guests),
      });
      
      navigate("/properties", {
        state: {
          location: selectedLocation,
          coordinates: selectedCoordinates,
          checkIn: checkInDate.toISOString().split("T")[0],
          checkOut: checkOutDate.toISOString().split("T")[0],
          guests: parseInt(guests),
        },
      });
    } else {
      console.log("Missing required fields:", { selectedLocation, checkInDate, checkOutDate });
      // Show user feedback for missing fields
      alert("Please fill in all required fields: Location, Check-in date, and Check-out date");
    }
  };

  const clearLocation = () => {
    setLocationQuery("");
    setSelectedLocation("");
    setSelectedCoordinates(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Get minimum date for checkout (checkin + 1 day)
  const getMinCheckoutDate = () => {
    if (!checkInDate) return undefined;
    const minDate = new Date(checkInDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate;
  };

  // Get minimum date for checkin (today)
  const getMinCheckinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110"
          style={{
            backgroundImage: `url(${backgroundImages[0]})`,
            animation: "slow-zoom 20s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-hiddy-sage/20 to-hiddy-terracotta/20 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
            <Sparkles className="h-4 w-4 text-hiddy-sand" />
            <span className="text-white/90 font-medium text-sm">
              Premium Stays
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Your Perfect
            <span className="block bg-gradient-to-r from-hiddy-sand via-hiddy-terracotta to-hiddy-sage bg-clip-text text-transparent">
              Zero-Fee Stay
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            Experience luxury accommodations without hidden fees.
            <span className="text-hiddy-sand font-semibold">
              {" "}
              Book with confidence.
            </span>
          </p>

          {/* Premium Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/60">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-white/60">Premium Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">4.9</div>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-hiddy-sand fill-current" />
                <span className="text-white/60">Average Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Premium Search Bar */}
        <div className="max-w-5xl mx-auto" ref={searchRef}>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 shadow-2xl search-bar-container">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Enhanced Location Input */}
              <div className="relative group md:col-span-4 flex items-center">
                <div className="absolute left-4 z-10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white/60 group-focus-within:text-hiddy-sand transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Where do you wanna go?"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-12 pr-12 py-4 bg-white/20 backdrop-blur-sm border-0 rounded-2xl text-white placeholder-white/60 text-base transition-all duration-300 focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-hiddy-sand/50 h-14 search-input flex items-center overflow-hidden text-ellipsis whitespace-nowrap"
                />
                {locationQuery && (
                  <button
                    onClick={clearLocation}
                    className="absolute right-4 z-10 flex items-center justify-center p-1 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {/* Location Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl z-[99999] max-h-60 overflow-y-auto search-dropdown transform-none">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-hiddy-sage" />
                        <span className="ml-3 text-slate-600 font-medium">
                          Searching...
                        </span>
                      </div>
                    ) : (
                      suggestions.map((suggestion) => (
                        <button
                          key={suggestion.place_id}
                          onClick={() => handleLocationSelect(suggestion)}
                          className="w-full px-6 py-4 text-left hover:bg-white/20 transition-colors border-b border-white/10 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-hiddy-sage mr-4 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-slate-800 text-lg">
                                {suggestion.structured_formatting.main_text}
                              </div>
                              <div className="text-sm text-slate-600">
                                {
                                  suggestion.structured_formatting
                                    .secondary_text
                                }
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Modern Check-in Date Picker */}
              <div className="md:col-span-2 flex items-center">
                <DatePicker
                  date={checkInDate}
                  onDateChange={setCheckInDate}
                  placeholder="Check-in date"
                  minDate={getMinCheckinDate()}
                  className="h-14 text-base w-full"
                />
              </div>

              {/* Modern Check-out Date Picker */}
              <div className="md:col-span-2 flex items-center">
                <DatePicker
                  date={checkOutDate}
                  onDateChange={setCheckOutDate}
                  placeholder="Check-out date"
                  minDate={getMinCheckoutDate()}
                  className="h-14 text-base w-full"
                />
              </div>

              {/* Enhanced Guests Input */}
              <div className="relative group md:col-span-2 flex items-center">
                <div className="absolute left-4 z-10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white/60 group-focus-within:text-hiddy-terracotta transition-colors" />
                </div>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border-0 rounded-2xl text-white text-base appearance-none transition-all duration-300 focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-hiddy-terracotta/50 h-14 search-input flex items-center"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option
                      key={num}
                      value={num}
                      className="bg-slate-800 text-white"
                    >
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 z-10 flex items-center justify-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-white/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Enhanced Search Button */}
              <div className="md:col-span-2 flex items-center">
                <button
                  onClick={handleSearch}
                  disabled={!selectedLocation || !checkInDate || !checkOutDate}
                  className="w-full h-14 bg-gradient-to-r from-hiddy-sage via-hiddy-terracotta to-hiddy-sage hover:from-sage-600 hover:via-terracotta-600 hover:to-sage-600 disabled:from-slate-400 disabled:via-slate-500 disabled:to-slate-400 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl disabled:transform-none disabled:shadow-none text-base flex items-center justify-center relative overflow-hidden group cursor-pointer"
                  type="button"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Search className="h-5 w-5 mr-2 flex-shrink-0 relative z-10" />
                  <span className="flex-shrink-0 relative z-10 font-semibold">
                    {!selectedLocation || !checkInDate || !checkOutDate ? "Fill All Fields" : "Explore Now"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center text-white/60 animate-bounce">
          <span className="text-sm mb-2">Scroll to explore</span>
          <ArrowRight className="h-5 w-5 rotate-90" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
