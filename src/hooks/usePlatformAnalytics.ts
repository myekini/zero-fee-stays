import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlatformAnalyticsData {
  overview: {
    totalPlatformRevenue: number;
    totalBookings: number;
    totalBookingValue: number;
    activeHosts: number;
    activeProperties: number;
    avgBookingValue: number;
    platformGrowthRate: number;
  };
  financial: {
    platformFees: number;
    stripeFees: number;
    netRevenue: number;
    hostPayouts: number;
    projectedMonthlyRevenue: number;
    profitMargin: number;
  };
  trends: {
    monthly: Array<{
      month: string;
      year: number;
      totalBookings: number;
      totalRevenue: number;
      platformFees: number;
      newHosts: number;
      activeUsers: number;
    }>;
    conversionFunnel: Array<{
      stage: string;
      users: number;
      conversion: number;
    }>;
    revenueGrowth: Array<{
      month: string;
      growth: number;
    }>;
  };
  hosts: {
    total: number;
    topPerformers: Array<{
      hostId: string;
      name: string;
      email: string;
      totalRevenue: number;
      totalBookings: number;
      activeProperties: number;
      avgRating: number;
      joinedDate: string;
      lastActive: string;
    }>;
    newThisMonth: number;
    retentionRate: number;
    avgRevenuePerHost: number;
  };
  geography: {
    distribution: Array<{
      country: string;
      properties: number;
      bookings: number;
      revenue: number;
    }>;
    topCountries: Array<{
      country: string;
      properties: number;
      bookings: number;
      revenue: number;
    }>;
  };
  technical: {
    systemUptime: number;
    avgResponseTime: number;
    errorRate: number;
    activeUsers: number;
  };
  timeRange: string;
  lastUpdated: string;
}

export const usePlatformAnalytics = (
  timeRange: string = '30days'
): UseQueryResult<PlatformAnalyticsData, Error> => {
  return useQuery({
    queryKey: ['platformAnalytics', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-platform', {
        body: { timeRange }
      });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const useMixpanelAnalytics = (
  event: string,
  filters?: Record<string, any>,
  dateRange: string = '30days'
) => {
  return useQuery({
    queryKey: ['mixpanelAnalytics', event, filters, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-mixpanel', {
        body: { event, filters, dateRange }
      });

      if (error) throw error;
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes for external API data
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};

export const useStripeAnalytics = (
  timeRange: string = '30days',
  currency: string = 'usd'
) => {
  return useQuery({
    queryKey: ['stripeAnalytics', timeRange, currency],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-stripe', {
        body: { timeRange, currency }
      });

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for financial data
    refetchInterval: 20 * 60 * 1000, // 20 minutes
    retry: 3
  });
};