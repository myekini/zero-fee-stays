"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
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
import { Card } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DestinationSearch } from "@/components/DestinationSearch";
import { HeroCarousel } from "@/components/HeroCarousel";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

interface InspiredHeroProps {
  className?: string;
}

// Property types
const PROPERTY_TYPES = [
  { value: "all", label: "All", icon: Home },
  { value: "apartment", label: "Apartments", icon: Building2 },
  { value: "house", label: "Houses", icon: Home },
];

// Lightweight popular destinations to create section rhythm under the search panel
const POPULAR_DESTINATIONS = [
  {
    name: "Toronto",
    subtitle: "Canada",
    image:
      "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Vancouver",
    subtitle: "Canada",
    image:
      "https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Montreal",
    subtitle: "Canada",
    image:
      "https://images.unsplash.com/photo-1566159056990-83a0c8c9bb9e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Calgary",
    subtitle: "Canada",
    image:
      "https://images.unsplash.com/photo-1611416517780-eff3a13b0359?auto=format&fit=crop&w=800&q=80",
  },
];

export function InspiredHero({ className }: InspiredHeroProps) {
  const router = useRouter();

  // Tab selection
  const [propertyType, setPropertyType] = useState("all");

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
    const total = getTotalGuests();
    if (total === 1) return "1 guest";
    return `${total} guests`;
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

  return (
    <div className={cn("relative group", className)}>
      {/* Hero Background Section with Carousel */}
      <div className="relative w-full h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
        {/* Carousel Component */}
        <HeroCarousel />

        {/* Hero Content - Fixed position over carousel */}
        <div className="absolute inset-0 z-30 container mx-auto px-8 flex flex-col justify-center items-start pb-40">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-6xl font-bold text-white leading-[1.15] md:leading-[1.1] mb-6 max-w-2xl drop-shadow-2xl"
          >
            Hey Buddy! where are you <br />
            <span className="text-white drop-shadow-2xl">Staying</span> tonight?
          </motion.h2>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-2 text-white hover:text-blue-200 transition-all duration-300 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 w-fit"
            onClick={() => {
              const searchSection = document.getElementById("search-section");
              searchSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Now
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Search Card - Positioned to overlap hero */}
      <div
        className="container mx-auto px-8 -mt-36 relative z-10"
        id="search-section"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Property Type Tabs */}
          <Tabs
            value={propertyType}
            onValueChange={setPropertyType}
            className="mb-0"
          >
            <TabsList className="inline-flex gap-0 bg-transparent h-auto p-0 rounded-none">
              {PROPERTY_TYPES.map((type, index) => {
                const Icon = type.icon;
                const isFirst = index === 0;
                return (
                  <TabsTrigger
                    key={type.value}
                    value={type.value}
                    className={cn(
                      "flex items-center gap-2 px-8 py-4 text-sm font-semibold transition-all duration-200 rounded-none border-0 shadow-none",
                      "data-[state=inactive]:bg-slate-800/90 data-[state=inactive]:text-white data-[state=inactive]:hover:bg-slate-700/90",
                      "data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg",
                      "dark:data-[state=inactive]:bg-slate-700/90 dark:data-[state=inactive]:text-slate-100", 
                      "dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900",
                      isFirst && "rounded-tl-lg"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {type.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Search Form Card */}
          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/20 dark:shadow-black/40 p-6 sm:p-8 rounded-b-xl rounded-tr-xl">
            <div className="space-y-6">
              {/* Main Search Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                {/* Destination Input */}
                <div className="lg:col-span-5">
                  <Label className="text-xs text-muted-foreground mb-2 uppercase block">
                    Destination
                  </Label>
                  <DestinationSearch
                    value={locationQuery}
                    onChange={setLocationQuery}
                    onSelect={handleLocationSelect}
                    placeholder="Where are you going?"
                    isLoading={false}
                  />
                </div>

                {/* Spacer for alignment */}
                <div className="lg:col-span-2 hidden lg:block"></div>

                {/* Guests Dropdown */}
                <div className="lg:col-span-5">
                  <Label className="text-xs text-muted-foreground mb-2 uppercase block">
                    Guests
                  </Label>
                  <DropdownMenu
                    open={isGuestsOpen}
                    onOpenChange={setIsGuestsOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-12 rounded-md font-medium"
                      >
                        <Users className="mr-2 h-5 w-5 shrink-0" />
                        <span className="text-foreground truncate">
                          {getGuestText()}
                          {infants > 0 &&
                            `, ${infants} infant${infants > 1 ? "s" : ""}`}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-80 p-6 rounded-lg"
                      align="start"
                    >
                      <div className="space-y-6">
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-foreground text-base">
                              Adults
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Ages 13 or above
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateAdults(adults - 1)}
                              disabled={adults <= 1}
                              className="h-9 w-9 p-0 rounded-md"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center font-bold text-lg">
                              {adults}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateAdults(adults + 1)}
                              disabled={adults >= 16}
                              className="h-9 w-9 p-0 rounded-md"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-foreground text-base">
                              Children
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Ages 2-12
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateChildren(children - 1)}
                              disabled={children <= 0}
                              className="h-9 w-9 p-0 rounded-md"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center font-bold text-lg">
                              {children}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateChildren(children + 1)}
                              disabled={children >= 10}
                              className="h-9 w-9 p-0 rounded-md"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Infants */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-foreground text-base">
                              Infants
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Under 2
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateInfants(infants - 1)}
                              disabled={infants <= 0}
                              className="h-9 w-9 p-0 rounded-md"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center font-bold text-lg">
                              {infants}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateInfants(infants + 1)}
                              disabled={infants >= 5}
                              className="h-9 w-9 p-0 rounded-md"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Date Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                {/* Check-in Date */}
                <div className="md:col-span-1 lg:col-span-4">
                  <Label className="text-xs text-muted-foreground mb-2 uppercase block">
                    Check In
                  </Label>
                  <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-medium h-12 rounded-md px-4",
                          !checkInDate && "text-muted-foreground"
                        )}
                      >
                        <span className="text-sm truncate">
                          {checkInDate
                            ? format(checkInDate, "EEE, dd MMM")
                            : "Select date"}
                        </span>
                        <Calendar className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />
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
                </div>

                {/* Check-out Date */}
                <div className="md:col-span-1 lg:col-span-4">
                  <Label className="text-xs text-muted-foreground mb-2 uppercase block">
                    Check Out
                  </Label>
                  <Popover
                    open={isCheckOutOpen}
                    onOpenChange={setIsCheckOutOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-medium h-12 rounded-md px-4",
                          !checkOutDate && "text-muted-foreground"
                        )}
                      >
                        <span className="text-sm truncate">
                          {checkOutDate
                            ? format(checkOutDate, "EEE, dd MMM")
                            : "Select date"}
                        </span>
                        <Calendar className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />
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
                </div>

                {/* Search Button */}
                <div className="md:col-span-2 lg:col-span-4 flex items-end justify-end">
                  <Button
                    onClick={handleSearch}
                    disabled={
                      !locationQuery ||
                      !checkInDate ||
                      !checkOutDate ||
                      isSearching
                    }
                    className="btn-primary-modern w-full lg:w-auto px-8 py-6 text-base"
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
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
