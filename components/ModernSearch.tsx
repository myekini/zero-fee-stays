"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Calendar, Users, Loader2, Plus, Minus } from "lucide-react";
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DestinationSearch } from "@/components/DestinationSearch";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ModernSearchProps {
  className?: string;
}

export function ModernSearch({ className }: ModernSearchProps) {
  const router = useRouter();

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
  const [adults, setAdults] = useState(1);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={cn("w-full max-w-4xl mx-auto", className)}
    >
      <Card className="p-8 shadow-2xl rounded-3xl overflow-visible">
        <div className="space-y-6">
          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Destination Input */}
            <DestinationSearch
              value={locationQuery}
              onChange={setLocationQuery}
              onSelect={handleLocationSelect}
              placeholder="Search destinations"
              isLoading={false}
            />

            {/* Check-in Date */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-3 block uppercase tracking-wide">
                Check in
              </Label>
              <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "PPP") : "Add dates"}
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
            </div>

            {/* Check-out Date */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-3 block uppercase tracking-wide">
                Check out
              </Label>
              <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOutDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "PPP") : "Add dates"}
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
            </div>

            {/* Guests Dropdown */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-3 block uppercase tracking-wide">
                Guests
              </Label>
              <DropdownMenu open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    <span className="text-muted-foreground">
                      {getGuestText()}
                      {infants > 0 &&
                        `, ${infants} infant${infants > 1 ? "s" : ""}`}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4" align="start">
                  <div className="space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">
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
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {adults}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAdults(adults + 1)}
                          disabled={adults >= 16}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">
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
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {children}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateChildren(children + 1)}
                          disabled={children >= 10}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">
                          Infants
                        </div>
                        <div className="text-sm text-muted-foreground">Under 2</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInfants(infants - 1)}
                          disabled={infants <= 0}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {infants}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInfants(infants + 1)}
                          disabled={infants >= 5}
                          className="h-8 w-8 p-0"
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

          {/* Search Button */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleSearch}
              disabled={
                !selectedLocation ||
                !checkInDate ||
                !checkOutDate ||
                isSearching
              }
              size="lg"
              variant="brandOnBlack"
              className="px-16 py-4 text-lg min-w-[280px] font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Find Zero-Fee Stays
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
