import React, { useRef, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => Promise<void>;
  className?: string;
}

const MobileGestureHandler: React.FC<MobileGestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPullToRefresh,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0]!;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      startY = touch.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0]!;
      currentY = touch.clientY;
      const deltaY = currentY - startY;

      // Pull to refresh logic
      if (onPullToRefresh && container.scrollTop === 0 && deltaY > 0) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(deltaY * 0.5, 80));
      }
    };

    const handleTouchEnd = async (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0]!;
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine if it's a swipe (minimum distance and speed)
      if (Math.max(absDeltaX, absDeltaY) > 50) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }

      // Pull to refresh
      if (isPulling && pullDistance > 60 && onPullToRefresh) {
        await onPullToRefresh();
      }

      // Reset pull state
      setIsPulling(false);
      setPullDistance(0);
      touchStartRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPullToRefresh, isPulling, pullDistance]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={`${className} mobile-scroll`}
      style={{
        transform: isPulling ? `translateY(${pullDistance}px)` : 'none',
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 text-sm text-muted-foreground"
          style={{ transform: `translateY(-${pullDistance}px)` }}
        >
          {pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}
      {children}
    </div>
  );
};

export default MobileGestureHandler;