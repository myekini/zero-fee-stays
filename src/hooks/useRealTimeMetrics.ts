import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface RealTimeMetrics {
  newBookings: number;
  revenueToday: number;
  activeUsers: number;
  errorCount: number;
  lastUpdate: string;
}

export const useRealTimeMetrics = (hostId?: string) => {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    newBookings: 0,
    revenueToday: 0,
    activeUsers: 0,
    errorCount: 0,
    lastUpdate: new Date().toISOString()
  });

  const queryClient = useQueryClient();

  const refreshMetrics = useCallback(async () => {
    try {
      // Update metrics when real-time events occur
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('bookings')
        .select('total_amount, created_at')
        .gte('created_at', `${today}T00:00:00`);

      if (hostId) {
        query = query.eq('host_id', hostId);
      }

      const { data: todayBookings } = await query;

      if (todayBookings) {
        const newBookings = todayBookings.length;
        const revenueToday = todayBookings.reduce(
          (sum, booking) => sum + Number(booking.total_amount), 
          0
        );

        setMetrics(prev => ({
          ...prev,
          newBookings,
          revenueToday,
          lastUpdate: new Date().toISOString()
        }));

        // Invalidate related queries to trigger refresh
        if (hostId) {
          queryClient.invalidateQueries({ queryKey: ['hostAnalytics', hostId] });
        } else {
          queryClient.invalidateQueries({ queryKey: ['platformAnalytics'] });
        }
      }
    } catch (error) {
      console.error('Error refreshing real-time metrics:', error);
    }
  }, [hostId, queryClient]);

  useEffect(() => {
    // Set up real-time subscription for bookings
    const bookingChannel = supabase
      .channel('realtime-bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        ...(hostId && { filter: `host_id=eq.${hostId}` })
      }, (payload) => {
        console.log('Real-time booking update:', payload);
        
        if (payload.eventType === 'INSERT') {
          setMetrics(prev => ({
            ...prev,
            newBookings: prev.newBookings + 1,
            revenueToday: prev.revenueToday + Number(payload.new.total_amount),
            lastUpdate: new Date().toISOString()
          }));
        }
        
        // Refresh full metrics periodically
        refreshMetrics();
      })
      .subscribe();

    // Set up subscription for properties if tracking platform-wide
    const propertyChannel = !hostId ? supabase
      .channel('realtime-properties')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'properties'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['platformAnalytics'] });
      })
      .subscribe() : null;

    // Initial load
    refreshMetrics();

    return () => {
      supabase.removeChannel(bookingChannel);
      if (propertyChannel) {
        supabase.removeChannel(propertyChannel);
      }
    };
  }, [hostId, refreshMetrics]);

  return {
    metrics,
    refreshMetrics
  };
};

export const useRealTimeBookings = (propertyId?: string) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('property-bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        ...(propertyId && { filter: `property_id=eq.${propertyId}` })
      }, (payload) => {
        console.log('Real-time booking change:', payload);
        
        if (payload.eventType === 'INSERT') {
          setBookings(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setBookings(prev => prev.map(booking => 
            booking.id === payload.new.id ? payload.new : booking
          ));
        } else if (payload.eventType === 'DELETE') {
          setBookings(prev => prev.filter(booking => booking.id !== payload.old.id));
        }

        // Invalidate related analytics queries
        if (propertyId) {
          queryClient.invalidateQueries({ queryKey: ['propertyAnalytics', propertyId] });
        }
        queryClient.invalidateQueries({ queryKey: ['platformAnalytics'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, queryClient]);

  return bookings;
};