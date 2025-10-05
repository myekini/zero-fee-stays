"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Users,
  Loader2,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Home,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DestinationSearch } from "@/components/DestinationSearch";
import { HeroCarousel } from "@/components/HeroCarousel";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface StreamlinedHeroProps {
  className?: string;
}

// Property types for the tabs
const PROPERTY_TYPES = [
  { value: "all", label: "All Properties", icon: Home },
  { value: "apartment", label: "Apartments", icon: Building2 },
  { value: "house", label: "Houses", icon: Home },
];

export function StreamlinedHero({ className }: StreamlinedHeroProps) {
  const router = useRouter();

  // Property type tab selection
  const [propertyType, setPropertyType] = useState("all");

  // Location state
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Date state
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  // Guests state
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  // Search state
  const [isSearching, setIsSearching] = useState(false);

  const handleLocationSelect = (suggestion: any) => {
    setSelectedLocation(suggestion.description);
    setSelectedCoordinates(suggestion.coordinates || null);
  };

  const handleSearch = async () => {
    if (!locationQuery || !checkInDate || !checkOutDate) {
      alert("Please fill in destination and dates");
      return;
    }

    setIsSearching(true);

    try {
      const searchParams = new URLSearchParams();
      searchParams.set("location", selectedLocation || locationQuery);
      searchParams.set("checkIn", checkInDate.toISOString().slice(0, 10));
      searchParams.set("checkOut", checkOutDate.toISOString().slice(0, 10));
      searchParams.set("adults", adults.toString());
      searchParams.set("children", children.toString());
      searchParams.set("infants", infants.toString());

      if (propertyType !== "all") {
        searchParams.set("type", propertyType);
      }

      if (selectedCoordinates) {
        searchParams.set("lat", selectedCoordinates.lat.toString());
        searchParams.set("lng", selectedCoordinates.lng.toString());
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      router.push(`/properties?${searchParams.toString()}`);
    } catch (error) {
      console.error("Search error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const getGuestText = () => {
    const parts = [];
    if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
    if (children > 0) parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
    if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? "s" : ""}`);
    return parts.join(", ") || "Add Guests";
  };

  const updateGuests = (type: "adults" | "children" | "infants", increment: boolean) => {
    if (type === "adults") {
      const newValue = increment ? adults + 1 : adults - 1;
      if (newValue >= 1 && newValue <= 16) setAdults(newValue);
    } else if (type === "children") {
      const newValue = increment ? children + 1 : children - 1;
      if (newValue >= 0 && newValue <= 10) setChildren(newValue);
    } else if (type === "infants") {
      const newValue = increment ? infants + 1 : infants - 1;
      if (newValue >= 0 && newValue <= 5) setInfants(newValue);
    }
  };

  const getMinCheckinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getMinCheckoutDate = () => {
    if (!checkInDate) return undefined;
    const minDate = new Date(checkInDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate;
  };

  const goToPrevCheckIn = () => {
    if (checkInDate) {
      const newDate = new Date(checkInDate);
      newDate.setDate(newDate.getDate() - 1);
      if (newDate >= getMinCheckinDate()) {
        setCheckInDate(newDate);
      }
    }
  };

  const goToNextCheckIn = () => {
    if (checkInDate) {
      const newDate = new Date(checkInDate);
      newDate.setDate(newDate.getDate() + 1);
      setCheckInDate(newDate);
    }
  };

  const goToPrevCheckOut = () => {
    if (checkOutDate) {
      const newDate = new Date(checkOutDate);
      newDate.setDate(newDate.getDate() - 1);
      const minCheckout = getMinCheckoutDate();
      if (!minCheckout || newDate >= minCheckout) {
        setCheckOutDate(newDate);
      }
    }
  };

  const goToNextCheckOut = () => {
    if (checkOutDate) {
      const newDate = new Date(checkOutDate);
      newDate.setDate(newDate.getDate() + 1);
      setCheckOutDate(newDate);
    }
  };

  return (
    <div className={cn("relative w-full h-screen", className)}>
      {/* Hero Background with Carousel */}
      <div className="absolute inset-0 w-full h-full">
        <HeroCarousel />
      </div>

      {/* Content Container */}
      <div className="relative z-30 container mx-auto px-4 sm:px-8 h-full flex flex-col justify-end pb-12 pt-24">
        {/* Hero Text */}
        <div className="mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 drop-shadow-2xl"
          >
            Hey Buddy! where are you <br />
            <span className="font-bold">Staying</span> tonight?
          </motion.h1>

          <motion.a
            href="#search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-white hover:text-white/80 transition-colors inline-flex items-center gap-2 text-sm font-medium group drop-shadow-lg"
          >
            Explore Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Search Section */}
        <motion.div
          id="search"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="max-w-6xl w-full"
        >
          {/* Property Type Tabs */}
          <div className="flex gap-0 mb-0">
            {PROPERTY_TYPES.map((type, index) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setPropertyType(type.value)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all",
                    index === 0 && "rounded-tl-lg",
                    propertyType === type.value
                      ? "bg-white text-gray-900"
                      : "bg-gray-800/70 backdrop-blur-sm text-white hover:bg-gray-700/70"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-b-lg rounded-tr-lg shadow-2xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Destination */}
              <div className="lg:col-span-4">
                <label className="text-xs text-gray-600 uppercase mb-2 block font-semibold">
                  Destination
                </label>
                <DestinationSearch
                  value={locationQuery}
                  onChange={setLocationQuery}
                  onSelect={handleLocationSelect}
                  placeholder="Where are you going?"
                  isLoading={false}
                  className="[&_input]:h-11 [&_input]:border-gray-300"
                />
              </div>

              {/* Check-in Date */}
              <div className="lg:col-span-3">
                <label className="text-xs text-gray-600 uppercase mb-2 block font-semibold">
                  Check In
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={goToPrevCheckIn}
                    disabled={!checkInDate}
                    className="h-11 px-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal h-11",
                          !checkInDate && "text-gray-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="text-sm">
                          {checkInDate ? format(checkInDate, "EEE, dd MMM") : "Select date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={checkInDate}
                        onSelect={date => {
                          setCheckInDate(date);
                          setIsCheckInOpen(false);
                        }}
                        disabled={date => date < getMinCheckinDate()}
                      />
                    </PopoverContent>
                  </Popover>
                  <button
                    type="button"
                    onClick={goToNextCheckIn}
                    disabled={!checkInDate}
                    className="h-11 px-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Check-out Date */}
              <div className="lg:col-span-3">
                <label className="text-xs text-gray-600 uppercase mb-2 block font-semibold">
                  Check Out
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={goToPrevCheckOut}
                    disabled={!checkOutDate}
                    className="h-11 px-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal h-11",
                          !checkOutDate && "text-gray-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="text-sm">
                          {checkOutDate ? format(checkOutDate, "EEE, dd MMM") : "Select date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={checkOutDate}
                        onSelect={date => {
                          setCheckOutDate(date);
                          setIsCheckOutOpen(false);
                        }}
                        disabled={date => {
                          const minDate = getMinCheckoutDate();
                          return !minDate || date < minDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <button
                    type="button"
                    onClick={goToNextCheckOut}
                    disabled={!checkOutDate}
                    className="h-11 px-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Guests Dropdown */}
              <div className="lg:col-span-2">
                <label className="text-xs text-gray-600 uppercase mb-2 block font-semibold">
                  Guests
                </label>
                <DropdownMenu open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-11 font-normal"
                    >
                      <Users className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                      <span className="truncate text-sm">{getGuestText()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-6" align="end">
                    <div className="space-y-6">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">Adults</div>
                          <div className="text-xs text-gray-500">Ages 13+</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuests("adults", false)}
                            disabled={adults <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{adults}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuests("adults", true)}
                            disabled={adults >= 16}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">Children</div>
                          <div className="text-xs text-gray-500">Ages 2-12</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuests("children", false)}
                            disabled={children <= 0}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{children}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuests("children", true)}
                            disabled={children >= 10}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">Infants</div>
                          <div className="text-xs text-gray-500">Under 2</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuests("infants", false)}
                            disabled={infants <= 0}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{infants}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuests("infants", true)}
                            disabled={infants >= 5}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-6">
              <Button
                onClick={handleSearch}
                disabled={!locationQuery || !checkInDate || !checkOutDate || isSearching}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-base"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Search Properties
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
