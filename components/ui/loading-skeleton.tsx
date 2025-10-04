import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800",
        className
      )}
      {...props}
    />
  );
}

// Property Card Skeleton
export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-48 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

// Properties Grid Skeleton
export function PropertiesGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Property Detail Skeleton
export function PropertyDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-96 w-full" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <div className="grid grid-cols-2 md:grid-cols<｜tool▁call▁begin｜>4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Search Filters Skeleton
export function SearchFiltersSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

// Booking Modal Skeleton
export function BookingModalSkeleton() {
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
