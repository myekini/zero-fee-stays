"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Users,
  Loader2,
  Plus,
  Minus,
  Star,
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  TreePine,
  MapPin,
  Award,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import { format, addDays, subDays } from "date-fns";

interface EnhancedHeroProps {
  className?: string;
}

// Premium destination images from Unsplash
const POPULAR_DESTINATIONS = [
  {
    name: "Toronto",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=800&q=80",
    properties: "120+ properties"
  },
  {
    name: "Vancouver",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=800&q=80",
    properties: "85+ properties"
  },
  {
    name: "Montreal",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1566159056990-83a0c8c9bb9e?auto=format&fit=crop&w=800&q=80",
    properties: "95+ properties"
  },
  {
    name: "Calgary",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1611416517780-eff3a13b0359?auto=format&fit=crop&w=800&q=80",
    properties: "60+ properties"
  },
];

// Property types - simplified
const PROPERTY_TYPES = [
  { value: "all", label: "All", icon: Home },
  { value: "apartment", label: "Apartments", icon: Building2 },
  { value: "house", label: "Houses", icon: Home },
];

export function EnhancedHero({ className }: EnhancedHeroProps) {
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
    if (!selectedLocation || !checkInDate || !checkOutDate) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSearching(true);

    try {
      const searchParams = new URLSearchParams();
      searchParams.set("location", selectedLocation);
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

      await new Promise((resolve) => setTimeout(resolve, 500));
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

  // Date navigation handlers
  const navigateCheckInDate = (direction: "prev" | "next") => {
    if (checkInDate) {
      const newDate = direction === "prev"
        ? subDays(checkInDate, 1)
        : addDays(checkInDate, 1);

      const today = getMinCheckinDate();
      if (newDate >= today) {
        setCheckInDate(newDate);
      }
    } else {
      setCheckInDate(new Date());
    }
  };

  const navigateCheckOutDate = (direction: "prev" | "next") => {
    if (checkOutDate) {
      const newDate = direction === "prev"
        ? subDays(checkOutDate, 1)
        : addDays(checkOutDate, 1);

      const minDate = getMinCheckoutDate();
      if (minDate && newDate >= minDate) {
        setCheckOutDate(newDate);
      }
    } else if (checkInDate) {
      setCheckOutDate(addDays(checkInDate, 1));
    }
  };

  // Premium testimonials data
  const reviews = {
    count: 2847,
    rating: 4.9,
    avatars: [
      { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", alt: "Happy Guest 1" },
      { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", alt: "Happy Guest 2" },
      { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie", alt: "Happy Guest 3" },
      { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack", alt: "Happy Guest 4" },
      { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", alt: "Happy Guest 5" },
    ],
  };

  return (
    <section className={cn("relative overflow-visible", className)}>
      {/* Premium Hero Background */}
      <div className="relative min-h-[85vh] flex items-center">
        {/* Background Image with Premium Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=75"
            alt="Luxury Modern Interior"
            fill
            className="object-cover scale-105"
            priority
            quality={75}
          />
          {/* Ultra-premium gradient overlay with depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/85 via-neutral-900/75 to-black/70" />

          {/* Subtle vignette effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

          {/* Refined animated mesh gradient */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 -left-8 w-[600px] h-[600px] bg-brand-500/50 rounded-full mix-blend-overlay filter blur-[120px] animate-blob" />
            <div className="absolute top-1/3 -right-8 w-[500px] h-[500px] bg-accent-400/40 rounded-full mix-blend-overlay filter blur-[100px] animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-brand-400/45 rounded-full mix-blend-overlay filter blur-[110px] animate-blob animation-delay-4000" />
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:py-20 w-full">
          {/* Hero Content */}
          <div className="text-center mb-12 max-w-5xl mx-auto">
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Hero Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.2] tracking-tight">
                Hey there! where are you{" "}
                <span className="inline-block bg-gradient-to-r from-brand-400 via-brand-300 to-accent-400 bg-clip-text text-transparent font-extrabold">
                  Staying
                </span>{" "}
                tonight?
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed">
                Book direct. <span className="font-bold text-brand-300">Zero fees.</span> Pure luxury.
              </p>
            </motion.div>

            {/* Simple Trust Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 flex items-center justify-center gap-2"
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starNumber) => (
                  <Star
                    key={`star-${starNumber}`}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-white/80 font-medium">
                {reviews.rating} • {reviews.count.toLocaleString()}+ stays
              </span>
            </motion.div>
          </div>

          {/* Premium Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="p-5 md:p-6 lg:p-8 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] border border-white/10 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl rounded-3xl overflow-visible ring-1 ring-black/5 dark:ring-white/10">
              {/* Property Type Tabs */}
              <Tabs value={propertyType} onValueChange={setPropertyType} className="mb-6">
                <TabsList className="grid w-full grid-cols-3 h-14 bg-neutral-100 dark:bg-slate-800 rounded-2xl p-1.5 gap-2">
                  {PROPERTY_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <TabsTrigger
                        key={type.value}
                        value={type.value}
                        className="flex items-center justify-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md rounded-xl transition-all text-sm font-semibold"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              {/* Search Form */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Destination Input */}
                  <div className="lg:col-span-1">
                    <Label className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-3 block uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-500" />
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

                  {/* Check-in Date */}
                  <div className="lg:col-span-1">
                    <Label className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-3 block uppercase tracking-wider">
                      Check In
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateCheckInDate("prev")}
                        disabled={!checkInDate || checkInDate <= getMinCheckinDate()!}
                        className="h-12 w-12 p-0 shrink-0 rounded-xl"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-semibold h-12 rounded-xl",
                              !checkInDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-5 w-5 shrink-0" />
                            <span className="truncate">
                              {checkInDate ? format(checkInDate, "MMM dd, yyyy") : "Select date"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={checkInDate}
                            onSelect={(date) => {
                              setCheckInDate(date);
                              setIsCheckInOpen(false);
                            }}
                            disabled={(date) => date < getMinCheckinDate()!}
                          />
                        </PopoverContent>
                      </Popover>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateCheckInDate("next")}
                        className="h-12 w-12 p-0 shrink-0 rounded-xl"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Check-out Date */}
                  <div className="lg:col-span-1">
                    <Label className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-3 block uppercase tracking-wider">
                      Check Out
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateCheckOutDate("prev")}
                        disabled={!checkOutDate || (checkInDate && checkOutDate <= addDays(checkInDate, 1))}
                        className="h-12 w-12 p-0 shrink-0 rounded-xl"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-semibold h-12 rounded-xl",
                              !checkOutDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-5 w-5 shrink-0" />
                            <span className="truncate">
                              {checkOutDate ? format(checkOutDate, "MMM dd, yyyy") : "Select date"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={checkOutDate}
                            onSelect={(date) => {
                              setCheckOutDate(date);
                              setIsCheckOutOpen(false);
                            }}
                            disabled={(date) => date < getMinCheckoutDate()!}
                          />
                        </PopoverContent>
                      </Popover>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateCheckOutDate("next")}
                        className="h-12 w-12 p-0 shrink-0 rounded-xl"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Guests Dropdown */}
                  <div className="lg:col-span-1">
                    <Label className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-3 block uppercase tracking-wider">
                      Guests
                    </Label>
                    <DropdownMenu open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-semibold">
                          <Users className="mr-2 h-5 w-5 shrink-0" />
                          <span className="text-neutral-700 dark:text-neutral-200 truncate">
                            {getGuestText()}
                            {infants > 0 && `, ${infants} infant${infants > 1 ? "s" : ""}`}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-80 p-6 rounded-2xl" align="start">
                        <div className="space-y-6">
                          {/* Adults */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                                Adults
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">Ages 13 or above</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateAdults(adults - 1)}
                                disabled={adults <= 1}
                                className="h-9 w-9 p-0 rounded-lg"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-10 text-center font-bold text-lg">{adults}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateAdults(adults + 1)}
                                disabled={adults >= 16}
                                className="h-9 w-9 p-0 rounded-lg"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Children */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                                Children
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">Ages 2-12</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateChildren(children - 1)}
                                disabled={children <= 0}
                                className="h-9 w-9 p-0 rounded-lg"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-10 text-center font-bold text-lg">{children}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateChildren(children + 1)}
                                disabled={children >= 10}
                                className="h-9 w-9 p-0 rounded-lg"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Infants */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                                Infants
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">Under 2</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateInfants(infants - 1)}
                                disabled={infants <= 0}
                                className="h-9 w-9 p-0 rounded-lg"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-10 text-center font-bold text-lg">{infants}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateInfants(infants + 1)}
                                disabled={infants >= 5}
                                className="h-9 w-9 p-0 rounded-lg"
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

                {/* Premium Search Button */}
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={handleSearch}
                    disabled={!selectedLocation || !checkInDate || !checkOutDate || isSearching}
                    size="lg"
className="px-16 py-6 text-lg min-w-[320px] font-bold bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 hover:from-brand-800 hover:via-brand-700 hover:to-brand-600 text-white shadow-[0_20px_40px_-10px_rgba(30,58,95,0.45)] hover:shadow-[0_25px_50px_-10px_rgba(30,58,95,0.55)] transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-2xl border-0 ring-2 ring-brand-400/20 hover:ring-brand-400/40"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-6 w-6 mr-3" />
                        Search Zero-Fee Stays
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
