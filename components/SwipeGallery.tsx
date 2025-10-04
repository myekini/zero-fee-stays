import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SwipeGalleryProps {
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const SwipeGallery: React.FC<SwipeGalleryProps> = ({
  images,
  className,
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
      }, autoPlayInterval);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, autoPlayInterval, images.length]);

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.targetTouches || e.targetTouches.length === 0) return;
    touchStartX.current = e.targetTouches[0]!.clientX;
    setIsAutoPlaying(false); // Pause auto-play on touch
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!e.targetTouches || e.targetTouches.length === 0) return;
    touchEndX.current = e.targetTouches[0]!.clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next image
        goToNext();
      } else {
        // Swipe right - previous image
        goToPrevious();
      }
    }
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Scroll to current image
  useEffect(() => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth;
      const itemWidth = scrollWidth / images.length;
      scrollRef.current.scrollTo({
        left: currentIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, images.length]);

  if (!images.length) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Image container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0 snap-center relative"
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white text-sm font-medium">{image.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 h-10 w-10 rounded-full touch-target"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous image</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 h-10 w-10 rounded-full touch-target"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next image</span>
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200 touch-target",
                "min-w-[24px] min-h-[24px] flex items-center justify-center",
                currentIndex === index
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/80"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                currentIndex === index ? "bg-white" : "bg-white/50"
              )} />
            </button>
          ))}
        </div>
      )}

      {/* Image counter */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default SwipeGallery;