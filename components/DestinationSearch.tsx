"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

interface DestinationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, height: 0, y: -10 },
    show: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
        y: { duration: 0.2 },
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -10,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.15 },
        y: { duration: 0.15 },
      },
    },
  },
  item: {
    hidden: { opacity: 0, x: -10 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: { duration: 0.15 },
    },
  },
} as const;

const popularDestinations: LocationSuggestion[] = [
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
  {
    place_id: "6",
    description: "Toronto, ON, Canada",
    structured_formatting: {
      main_text: "Toronto",
      secondary_text: "ON, Canada",
    },
    coordinates: { lat: 43.6532, lng: -79.3832 },
  },
  {
    place_id: "7",
    description: "Sydney, NSW, Australia",
    structured_formatting: {
      main_text: "Sydney",
      secondary_text: "NSW, Australia",
    },
    coordinates: { lat: -33.8688, lng: 151.2093 },
  },
  {
    place_id: "8",
    description: "Berlin, Germany",
    structured_formatting: {
      main_text: "Berlin",
      secondary_text: "Germany",
    },
    coordinates: { lat: 52.52, lng: 13.405 },
  },
];

export function DestinationSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Search destinations",
  className,
  isLoading = false,
}: DestinationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
      // Show popular destinations when input is empty
      setFilteredSuggestions(popularDestinations);
    } else {
      const filtered = popularDestinations.filter(
        dest =>
          dest.structured_formatting.main_text
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          dest.structured_formatting.secondary_text
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          dest.description.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleInputBlur = () => {
    // Delay closing to allow for click events
    setTimeout(() => {
      setIsOpen(false);
      setActiveIndex(-1);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
          handleSelect(filteredSuggestions[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (suggestion: LocationSuggestion) => {
    onChange(suggestion.description);
    onSelect(suggestion);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-12 rounded-xl font-semibold"
          autoComplete="off"
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && filteredSuggestions.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-[9999] max-h-80 overflow-hidden"
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="show"
            exit="exit"
            role="listbox"
            aria-label="Destination suggestions"
          >
            <div className="p-2">
              <div className="text-xs text-muted-foreground px-2 py-2 font-medium uppercase tracking-wide">
                {value.trim() ? "Search Results" : "Popular Destinations"}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.place_id}
                    onClick={() => handleSelect(suggestion)}
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-muted transition-all duration-200 rounded-lg group flex items-center justify-between",
                      activeIndex === index && "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-200"
                    )}
                    variants={ANIMATION_VARIANTS.item}
                    role="option"
                    aria-selected={activeIndex === index}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0 w-6 h-6 bg-muted rounded-lg flex items-center justify-center mr-3">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm group-hover:text-brand-600 transition-colors">
                          {suggestion.structured_formatting.main_text}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {suggestion.structured_formatting.secondary_text}
                        </div>
                      </div>
                    </div>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="h-4 w-4 text-brand-600" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-border bg-muted/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Press ↑↓ to navigate</span>
                <span>Enter to select • ESC to close</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
