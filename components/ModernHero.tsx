"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Loader2,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Home,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DestinationSearch } from "@/components/DestinationSearch";
import { HeroCarousel } from "@/components/HeroCarousel";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ModernHeroProps {
  className?: string;
}

// Property types
const PROPERTY_TYPES = [
  { value: "all", label: "All Properties", icon: Home },
  { value: "apartment", label: "Apartments", icon: Building2 },
  { value: "house", label: "Houses", icon: Home },
];

export function ModernHero({ className }: ModernHeroProps) {
  const router = useRouter();

  // Tab selection
  const [propertyType, setPropertyType] = useState("all");
  const [tripType, setTripType] = useState("round");

  // State for location search
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // State for dates
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  // State for guests
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  // State for search
  const [isSearching, setIsSearching] = useState(false);

  const handleLocationSelect = (suggestion: any) => {
    setSelectedLocation(suggestion.description);
    setSelectedCoordinates(suggestion.coordinates || null);
  };

  const handleSearch = async () => {
    if (!locationQuery || !checkInDate || !checkOutDate) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSearching(true);

    try {
      const searchParams = new URLSearchParams();
      searchParams.set("location", selectedLocation || locationQuery);
      searchParams.set("checkIn", checkInDate!.toISOString().slice(0, 10));
      searchParams.set("checkOut", checkOutDate!.toISOString().slice(0, 10));
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
      alert("An error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const getTotalGuests = () => adults + children;
  const getGuestText = () => {
    const parts = [];
    if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
    if (children > 0) parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
    if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? "s" : ""}`);
    return parts.join(", ") || "Select Guests";
  };

  const updateAdults = (newAdults: number) => {
    if (newAdults >= 1 && newAdults <= 16) {
      setAdults(newAdults);
    }
  };

  const updateChildren = (newChildren: number) => {
    if (newChildren >= 0 && newChildren <= 10) {
      setChildren(newChildren);
    }
  };

  const updateInfants = (newInfants: number) => {
    if (newInfants >= 0 && newInfants <= 5) {
      setInfants(newInfants);
    }
  };

  const getMinCheckoutDate = () => {
    if (!checkInDate) return undefined;
    const minDate = new Date(checkInDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate;
  };

  const getMinCheckinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
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
    <div className={cn("relative w-full min-h-screen", className)}>
      {/* Hero Background with Carousel */}
      <div className="absolute inset-0 w-full h-full">
        <HeroCarousel />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-8 py-8 min-h-screen flex flex-col">
        {/* Hero Text */}
        <div className="pt-12 pb-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
          >
            Hey Buddy! where are you <br />
            <span className="font-bold">Staying</span> to?
          </motion.h1>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-white hover:text-white/80 transition-colors inline-flex items-center gap-2 text-sm font-medium group"
          >
            Explore Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Property Type Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex-1 flex flex-col"
        >
          <div className="flex gap-0 mb-0">
            {PROPERTY_TYPES.map((type, index) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setPropertyType(type.value)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all",
                    "border-b-0",
                    index === 0 && "rounded-tl-lg",
                    propertyType === type.value
                      ? "bg-white text-gray-900"
                      : "bg-gray-800/60 text-white hover:bg-gray-700/60"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-b-lg rounded-tr-lg shadow-2xl p-6 space-y-6">
            {/* Trip Type and Passengers Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-600 uppercase mb-2 block font-medium">
                  Trip Type
                </Label>
                <Select value={tripType} onValueChange={setTripType}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select trip type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round">Round Trip</SelectItem>
                    <SelectItem value="oneway">One Way</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600 uppercase mb-2 block font-medium">
                  Guests
                </Label>
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
                  <DropdownMenuContent className="w-80 p-6" align="start">
                    <div className="space-y-6">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">Adults</div>
                          <div className="text-xs text-gray-500">Ages 13 or above</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAdults(adults - 1)}
                            disabled={adults <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{adults}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAdults(adults + 1)}
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
                            onClick={() => updateChildren(children - 1)}
                            disabled={children <= 0}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{children}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateChildren(children + 1)}
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
                            onClick={() => updateInfants(infants - 1)}
                            disabled={infants <= 0}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{infants}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateInfants(infants + 1)}
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

              <div>
                <Label className="text-xs text-gray-600 uppercase mb-2 block font-medium">
                  Property Type
                </Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="apartment">Apartments</SelectItem>
                    <SelectItem value="house">Houses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Main Search Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Destination */}
              <div className="lg:col-span-4">
                <Label className="text-xs text-gray-600 uppercase mb-2 block font-medium">
                  From
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <DestinationSearch
                    value={locationQuery}
                    onChange={setLocationQuery}
                    onSelect={handleLocationSelect}
                    placeholder="Where are you going?"
                    isLoading={false}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Check-in Date */}
              <div className="lg:col-span-3">
                <Label className="text-xs text-gray-600 uppercase mb-2 block font-medium">
                  Departure
                </Label>
                <div className="relative flex items-center gap-1">
                  <button
                    onClick={goToPrevCheckIn}
                    disabled={!checkInDate}
                    className="h-11 px-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
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
                        <Calendar className="mr-2 h-4 w-4 shrink-0" />
                        <div className="flex flex-col items-start">
                          <span className="text-xs">
                            {checkInDate ? format(checkInDate, "EEE, dd MMM") : "Select date"}
                          </span>
                        </div>
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
                        disabled={date => date < getMinCheckinDate()!}
                      />
                    </PopoverContent>
                  </Popover>
                  <button
                    onClick={goToNextCheckIn}
                    disabled={!checkInDate}
                    className="h-11 px-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Check-out Date */}
              <div className="lg:col-span-3">
                <Label className="text-xs text-gray-600 uppercase mb-2 block font-medium">
                  Return
                </Label>
                <div className="relative flex items-center gap-1">
                  <button
                    onClick={goToPrevCheckOut}
                    disabled={!checkOutDate}
                    className="h-11 px-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
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
                        <Calendar className="mr-2 h-4 w-4 shrink-0" />
                        <div className="flex flex-col items-start">
                          <span className="text-xs">
                            {checkOutDate ? format(checkOutDate, "EEE, dd MMM") : "Select date"}
                          </span>
                        </div>
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
                        disabled={date => date < getMinCheckoutDate()!}
                      />
                    </PopoverContent>
                  </Popover>
                  <button
                    onClick={goToNextCheckOut}
                    disabled={!checkOutDate}
                    className="h-11 px-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Search Button */}
              <div className="lg:col-span-2">
                <Label className="text-xs text-transparent uppercase mb-2 block">-</Label>
                <Button
                  onClick={handleSearch}
                  disabled={
                    !locationQuery ||
                    !checkInDate ||
                    !checkOutDate ||
                    isSearching
                  }
                  className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Search
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
