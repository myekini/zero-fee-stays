import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HostAnalyticsData {
  summary: {
    totalEarnings: number;
    totalBookings: number;
    confirmedBookings: number;
    avgBookingValue: number;
    occupancyRate: number;
    activeProperties: number;
  };
  trends: {
    monthlyEarnings: Array<{ month: string; earnings: number; bookings: number }>;
    projectedMonthlyEarnings: number;
  };
  properties: {
    performance: Array<{
      propertyId: string;
      title: string;
      bookings: number;
      revenue: number;
      views: number;
      conversionRate: number;
    }>;
    topPerformer: any;
  };
  guests: {
    totalGuests: number;
    avgStayDuration: number;
    repeatGuests: number;
    avgRating: number;
  };
  timeRange: string;
  lastUpdated: string;
}

export const useHostAnalytics = (
  hostId: string | undefined,
  timeRange: string = '30days'
): UseQueryResult<HostAnalyticsData, Error> => {
  return useQuery({
    queryKey: ['hostAnalytics', hostId, timeRange],
    queryFn: async () => {
      if (!hostId) throw new Error('Host ID is required');
      
      const { data, error } = await supabase.functions.invoke('analytics-host', {
        body: { hostId, timeRange }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!hostId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const usePropertyAnalytics = (
  propertyId: string | undefined,
  timeRange: string = '30days'
) => {
  return useQuery({
    queryKey: ['propertyAnalytics', propertyId, timeRange],
    queryFn: async () => {
      if (!propertyId) throw new Error('Property ID is required');
      
      const { data, error } = await supabase.functions.invoke('analytics-property', {
        body: { propertyId, timeRange }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000, // 15 minutes for property-level data
    retry: 2
  });
};