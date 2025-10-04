import React, { useState, useCallback, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  refreshingHeight?: number;
  className?: string;
  disabled?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  refreshingHeight = 60,
  className,
  disabled = false
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    // Only trigger if scrolled to top
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop === 0) {
      if (!e.touches || e.touches.length === 0) return;
      setStartY(e.touches[0]!.clientY);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || startY === 0) return;

    if (!e.touches || e.touches.length === 0) return;
    const currentY = e.touches[0]!.clientY;
    const diff = currentY - startY;

    if (diff > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault();
      
      // Apply resistance effect
      const resistance = Math.max(0, Math.min(diff * 0.6, refreshThreshold * 1.5));
      setPullDistance(resistance);
    }
  }, [disabled, isRefreshing, startY, refreshThreshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      setPullDistance(refreshingHeight);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setStartY(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
      setStartY(0);
    }
  }, [disabled, isRefreshing, pullDistance, refreshThreshold, refreshingHeight, onRefresh]);

  const refreshProgress = Math.min(pullDistance / refreshThreshold, 1);
  const isTriggered = pullDistance >= refreshThreshold;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-transform duration-200 z-10",
          "bg-background/90 backdrop-blur-sm border-b border-border"
        )}
        style={{
          height: Math.max(pullDistance, 0),
          transform: `translateY(${Math.max(pullDistance - refreshingHeight, -refreshingHeight)}px)`
        }}
      >
        <div className="flex flex-col items-center gap-2 py-2">
          <div
            className={cn(
              "transition-transform duration-200",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: `rotate(${refreshProgress * 180}deg)`
            }}
          >
            <RefreshCw 
              className={cn(
                "h-5 w-5 transition-colors duration-200",
                isTriggered ? "text-primary" : "text-muted-foreground"
              )} 
            />
          </div>
          <div className="text-xs font-medium text-center">
            {isRefreshing ? (
              "Refreshing..."
            ) : isTriggered ? (
              "Release to refresh"
            ) : (
              "Pull to refresh"
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;