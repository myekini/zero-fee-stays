"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  is_favorite?: boolean;
  metrics?: {
    avg_rating?: number;
    review_count?: number;
  };
  [key: string]: any;
}

interface OptimisticUpdate<T> {
  id: string;
  updates: Partial<T>;
  tempId?: string;
}

export function useOptimisticProperties<T extends Property>(
  initialProperties: T[] = []
) {
  const [properties, setProperties] = useState<T[]>(initialProperties);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<string, OptimisticUpdate<T>>
  >(new Map());
  const { toast } = useToast();

  // Apply optimistic update
  const applyOptimisticUpdate = useCallback((update: OptimisticUpdate<T>) => {
    const tempId = `${Date.now()}-${Math.random()}`;
    const updateId = update.tempId || update.id;

    // Store the update
    setOptimisticUpdates((prev) =>
      new Map(prev).set(updateId, { ...update, tempId })
    );

    // Apply optimistic UI update
    setProperties((prevProperties) =>
      prevProperties.map((prop) =>
        prop.id === update.id || update.tempId === prop.tempId
          ? { ...prop, ...update.updates, isOptimistic: true }
          : prop
      )
    );

    return tempId;
  }, []);

  // Commit optimistic update
  const commitOptimisticUpdate = useCallback(
    (tempId: string, actualData?: Partial<T>) => {
      const update = optimisticUpdates.get(tempId);
      if (!update) return;

      // Update properties with actual data or confirmed optimistic data
      setProperties((prevProperties) =>
        prevProperties.map((prop) =>
          prop.tempId === tempId || prop.isOptimistic
            ? {
                ...prop,
                ...(actualData || update.updates),
                isOptimistic: false,
                tempId: undefined,
              }
            : prop
        )
      );

      // Remove from optimistic updates
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
    },
    [optimisticUpdates]
  );

  // Rollback optimistic update
  const rollbackOptimisticUpdate = useCallback(
    (tempId: string, error?: Error) => {
      const update = optimisticUpdates.get(tempId);
      if (!update) return;

      // Rollback properties
      setProperties((prevProperties) =>
        prevProperties.filter(
          (prop) => prop.tempId !== tempId && !prop.isOptimistic
        )
      );

      // Remove from optimistic updates
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });

      // Show error toast if provided
      if (error) {
        toast({
          title: "Update Failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    },
    [optimisticUpdates, toast]
  );

  // Toggle favorite with optimistic update
  const toggleFavoriteOptimistically = useCallback(
    async (propertyId: string, currentFavoriteState: boolean) => {
      // Apply optimistic update
      const tempId = applyOptimisticUpdate({
        id: propertyId,
        updates: { is_favorite: !currentFavoriteState } as Partial<T>,
      });

      try {
        // Simulate API call
        const response = await fetch(`/api/properties/${propertyId}/favorite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_favorite: !currentFavoriteState }),
        });

        if (!response.ok) {
          throw new Error("Failed to update favorite");
        }

        // Commit if successful
        commitOptimisticUpdate(tempId);

        toast({
          title: !currentFavoriteState
            ? "Added to favorites"
            : "Removed from favorites",
          description: `Property ${!currentFavoriteState ? "added to" : "removed from"} your favorites.`,
        });
      } catch (error) {
        // Rollback on error
        rollbackOptimisticUpdate(tempId, error as Error);
      }
    },
    [
      applyOptimisticUpdate,
      commitOptimisticUpdate,
      rollbackOptimisticUpdate,
      toast,
    ]
  );

  // Update properties list
  const updateProperties = useCallback((newProperties: T[]) => {
    setProperties(newProperties);
    // Clear any stale optimistic updates
    setOptimisticUpdates(new Map());
  }, []);

  // Add new property optimistically
  const addPropertyOptimistically = useCallback(
    async (propertyData: Omit<T, "id">, apiCall: () => Promise<T>) => {
      const tempId = applyOptimisticUpdate({
        id: "", // Will be updated by API
        updates: propertyData as Partial<T>,
        tempId: "new-property",
      });

      try {
        const result = await apiCall();
        commitOptimisticUpdate(tempId, result);

        toast({
          title: "Property Added",
          description: "Property has been successfully added.",
        });

        return result;
      } catch (error) {
        rollbackOptimisticUpdate(tempId, error as Error);
        throw error;
      }
    },
    [
      applyOptimisticUpdate,
      commitOptimisticUpdate,
      rollbackOptimisticUpdate,
      toast,
    ]
  );

  // Get properties with optimistic updates applied
  const getOptimisticProperties = useCallback(() => {
    return properties.map((prop) => {
      // Remove temporary fields for display
      const { isOptimistic, tempId, ...cleanProp } = prop as any;
      return cleanProp as T;
    });
  }, [properties]);

  return {
    properties: getOptimisticProperties(),
    optimisticUpdates: Array.from(optimisticUpdates.values()),
    applyOptimisticUpdate,
    commitOptimisticUpdate,
    rollbackOptimisticUpdate,
    toggleFavoriteOptimistically,
    updateProperties,
    addPropertyOptimistically,
  };
}

export default useOptimisticProperties;
