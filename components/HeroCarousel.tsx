"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CAROUSEL_IMAGES = [
  {
    src: "/bedroom.jpeg",
    alt: "Luxury bedroom with panoramic city view",
  },
  {
    src: "/kitchen.jpeg",
    alt: "Modern fully equipped kitchen space",
  },
  {
    src: "/balcony.jpeg",
    alt: "Stunning city skyline view from private balcony",
  },
  {
    src: "/loubby.jpeg",
    alt: "Elegant hotel-style lobby and entrance",
  },
  {
    src: "/utensils.jpeg",
    alt: "Premium kitchen amenities and dining setup",
  },
];

const AUTO_SCROLL_INTERVAL = 5000; // 5 seconds
const TRANSITION_DURATION = 1000; // 1 second

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, []);

  const goToNext = useCallback(() => {
    goToSlide((currentIndex + 1) % CAROUSEL_IMAGES.length);
  }, [currentIndex, goToSlide]);

  const goToPrev = useCallback(() => {
    goToSlide(
      currentIndex === 0 ? CAROUSEL_IMAGES.length - 1 : currentIndex - 1
    );
  }, [currentIndex, goToSlide]);

  // Auto-scroll functionality
  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(goToNext, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [currentIndex, isPaused, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === " " || e.key === "Escape") setIsPaused(prev => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Image carousel"
      aria-live="polite"
    >
      {/* Carousel Images */}
      <div className="relative w-full h-full">
        {CAROUSEL_IMAGES.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
            aria-hidden={index !== currentIndex}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              quality={85}
              sizes="100vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
              style={{
                objectFit: 'cover',
                objectPosition: 'center center'
              }}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
        ))}
      </div>

      {/* Dark Overlay for text readability */}
      <div className="absolute inset-0 bg-black/25 z-20" />

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 z-30",
          "bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full",
          "transition-all duration-200",
          isPaused ? "opacity-100" : "opacity-0 md:opacity-0 md:group-hover:opacity-100"
        )}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={goToNext}
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 z-30",
          "bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full",
          "transition-all duration-200",
          isPaused ? "opacity-100" : "opacity-0 md:opacity-0 md:group-hover:opacity-100"
        )}
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {CAROUSEL_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? "true" : "false"}
          />
        ))}
      </div>

      {/* Pause indicator (optional) */}
      {isPaused && (
        <div className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
          Paused
        </div>
      )}
    </div>
  );
}
