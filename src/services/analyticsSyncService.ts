import { supabase } from '@/integrations/supabase/client';

interface AnalyticsMetric {
  metric_name: string;
  value: number;
  dimensions?: Record<string, any>;
  entity_id?: string;
  entity_type?: 'host' | 'property' | 'platform';
  date?: string;
}

class AnalyticsSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  async syncExternalData(): Promise<void> {
    if (this.isRunning) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting analytics data sync...');

    try {
      // Sync Mixpanel data
      await this.syncMixpanelData();
      
      // Sync Stripe financial data
      await this.syncStripeData();
      
      // Update platform metrics
      await this.updatePlatformMetrics();

      console.log('Analytics sync completed successfully');
    } catch (error) {
      console.error('Analytics sync failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async syncMixpanelData(): Promise<void> {
    try {
      const events = [
        'Property Viewed',
        'Search Performed', 
        'Booking Started',
        'Booking Completed',
        'User Signup',
        'Host Registration'
      ];

      for (const eventName of events) {
        const { data: mixpanelData, error } = await supabase.functions.invoke('analytics-mixpanel', {
          body: {
            event: eventName,
            dateRange: 'last_7_days'
          }
        });

        if (error) {
          console.error(`Error fetching Mixpanel data for ${eventName}:`, error);
          continue;
        }

        // Store aggregated metrics in analytics cache
        if (mixpanelData?.events?.length > 0) {
          for (const event of mixpanelData.events) {
            await this.cacheMetric({
              metric_name: `mixpanel_${eventName.toLowerCase().replace(/\s+/g, '_')}`,
              value: event.count || 0,
              dimensions: {
                unique_users: event.uniqueUsers || 0,
                properties: event.properties || {}
              },
              entity_type: 'platform',
              date: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    } catch (error) {
      console.error('Error syncing Mixpanel data:', error);
    }
  }

  private async syncStripeData(): Promise<void> {
    try {
      const { data: stripeData, error } = await supabase.functions.invoke('analytics-stripe', {
        body: {
          timeRange: '7days'
        }
      });

      if (error) {
        console.error('Error fetching Stripe data:', error);
        return;
      }

      // Cache key financial metrics
      const today = new Date().toISOString().split('T')[0];
      
      await Promise.all([
        this.cacheMetric({
          metric_name: 'stripe_total_revenue',
          value: stripeData.revenue?.total || 0,
          entity_type: 'platform',
          date: today
        }),
        this.cacheMetric({
          metric_name: 'stripe_processing_fees',
          value: stripeData.revenue?.fees || 0,
          entity_type: 'platform',
          date: today
        }),
        this.cacheMetric({
          metric_name: 'stripe_success_rate',
          value: stripeData.transactions?.successRate || 0,
          entity_type: 'platform',
          date: today
        }),
        this.cacheMetric({
          metric_name: 'stripe_transaction_count',
          value: stripeData.transactions?.successful || 0,
          entity_type: 'platform',
          date: today
        })
      ]);

    } catch (error) {
      console.error('Error syncing Stripe data:', error);
    }
  }

  private async updatePlatformMetrics(): Promise<void> {
    try {
      // Calculate derived metrics from database
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_amount, host_id, created_at, status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: hosts } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_host', true);

      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('is_active', true);

      if (bookings && hosts && properties) {
        const today = new Date().toISOString().split('T')[0];
        const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
        const platformFees = totalRevenue * 0.025; // 2.5% platform fee

        await Promise.all([
          this.cacheMetric({
            metric_name: 'platform_total_bookings',
            value: bookings.length,
            entity_type: 'platform',
            date: today
          }),
          this.cacheMetric({
            metric_name: 'platform_total_revenue',
            value: totalRevenue,
            entity_type: 'platform',
            date: today
          }),
          this.cacheMetric({
            metric_name: 'platform_fees_collected',
            value: platformFees,
            entity_type: 'platform',
            date: today
          }),
          this.cacheMetric({
            metric_name: 'platform_active_hosts',
            value: hosts.length,
            entity_type: 'platform',
            date: today
          }),
          this.cacheMetric({
            metric_name: 'platform_active_properties',
            value: properties.length,
            entity_type: 'platform',
            date: today
          })
        ]);
      }
    } catch (error) {
      console.error('Error updating platform metrics:', error);
    }
  }

  private async cacheMetric(metric: AnalyticsMetric): Promise<void> {
    try {
      const { error } = await supabase.rpc('upsert_analytics_metric', {
        p_metric_name: metric.metric_name,
        p_value: metric.value,
        p_dimensions: metric.dimensions || null,
        p_entity_id: metric.entity_id || null,
        p_entity_type: metric.entity_type || null,
        p_date: metric.date || new Date().toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error caching metric:', error);
      }
    } catch (error) {
      console.error('Error in cacheMetric:', error);
    }
  }

  startPeriodicSync(intervalMinutes: number = 60): void {
    if (this.syncInterval) {
      this.stopPeriodicSync();
    }

    console.log(`Starting periodic analytics sync every ${intervalMinutes} minutes`);
    
    // Run initial sync
    this.syncExternalData();
    
    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.syncExternalData();
    }, intervalMinutes * 60 * 1000);
  }

  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Stopped periodic analytics sync');
    }
  }

  async getMetrics(entityType?: string, entityId?: string, dateRange?: { from: string; to: string }): Promise<any[]> {
    try {
      let query = supabase
        .from('analytics_cache')
        .select('*')
        .order('date', { ascending: false });

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      if (dateRange) {
        query = query
          .gte('date', dateRange.from)
          .lte('date', dateRange.to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cached metrics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMetrics:', error);
      return [];
    }
  }

  async trackEvent(eventName: string, properties: Record<string, any> = {}, userId?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_name: eventName,
          user_id: userId,
          session_id: properties.session_id || 'anonymous',
          properties
        });

      if (error) {
        console.error('Error tracking event:', error);
      }
    } catch (error) {
      console.error('Error in trackEvent:', error);
    }
  }
}

// Singleton instance
export const analyticsSyncService = new AnalyticsSyncService();

// Helper functions for common operations
export const syncAnalytics = () => analyticsSyncService.syncExternalData();

export const startAnalyticsSync = (intervalMinutes?: number) => 
  analyticsSyncService.startPeriodicSync(intervalMinutes);

export const stopAnalyticsSync = () => analyticsSyncService.stopPeriodicSync();

export const getCachedMetrics = (entityType?: string, entityId?: string, dateRange?: { from: string; to: string }) =>
  analyticsSyncService.getMetrics(entityType, entityId, dateRange);

export const trackAnalyticsEvent = (eventName: string, properties?: Record<string, any>, userId?: string) =>
  analyticsSyncService.trackEvent(eventName, properties, userId);