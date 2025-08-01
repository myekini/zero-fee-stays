import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsState {
  host: Record<string, any>;
  platform: Record<string, any>;
  realTime: {
    newBookings: number;
    revenueToday: number;
    activeUsers: number;
    errorCount: number;
    lastUpdate: string;
  };
  isLoading: boolean;
  error: string | null;
}

interface AnalyticsContextType {
  analytics: AnalyticsState;
  setAnalytics: React.Dispatch<React.SetStateAction<AnalyticsState>>;
  refreshAnalytics: () => void;
  trackEvent: (event: string, properties?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsState>({
    host: {},
    platform: {},
    realTime: {
      newBookings: 0,
      revenueToday: 0,
      activeUsers: 0,
      errorCount: 0,
      lastUpdate: new Date().toISOString()
    },
    isLoading: false,
    error: null
  });

  // Get host ID for real-time metrics
  const [hostId, setHostId] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      // Fetch user's host profile to get host ID
      const fetchHostProfile = async () => {
        try {
          const { data: profile } = await fetch('/api/user/profile').then(res => res.json());
          if (profile?.is_host) {
            setHostId(profile.id);
          }
        } catch (error) {
          console.error('Error fetching host profile:', error);
        }
      };
      
      fetchHostProfile();
    }
  }, [user]);

  const { metrics: realTimeMetrics, refreshMetrics } = useRealTimeMetrics(hostId);

  useEffect(() => {
    if (realTimeMetrics) {
      setAnalytics(prev => ({
        ...prev,
        realTime: realTimeMetrics
      }));
    }
  }, [realTimeMetrics]);

  const refreshAnalytics = () => {
    setAnalytics(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      refreshMetrics();
      // Additional refresh logic can be added here
    } catch (error) {
      setAnalytics(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to refresh analytics',
        isLoading: false 
      }));
    }
  };

  const trackEvent = async (event: string, properties?: Record<string, any>) => {
    try {
      // Track event in multiple systems
      const eventData = {
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          user_id: user?.id,
          session_id: sessionStorage.getItem('session_id') || 'anonymous'
        }
      };

      // Send to Mixpanel (if configured)
      if (window.mixpanel) {
        window.mixpanel.track(event, eventData.properties);
      }

      // Send to Google Analytics (if configured)
      if (window.gtag) {
        window.gtag('event', event, eventData.properties);
      }

      // Store in local analytics cache for internal dashboards
      const cachedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      cachedEvents.push(eventData);
      
      // Keep only last 100 events
      if (cachedEvents.length > 100) {
        cachedEvents.splice(0, cachedEvents.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(cachedEvents));

      console.log('Event tracked:', eventData);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const contextValue: AnalyticsContextType = {
    analytics,
    setAnalytics,
    refreshAnalytics,
    trackEvent
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Analytics event tracking helper
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // This can be called outside of React components
    const eventData = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString()
      }
    };

    // Send to external services
    if (window.mixpanel) {
      window.mixpanel.track(event, eventData.properties);
    }

    if (window.gtag) {
      window.gtag('event', event, eventData.properties);
    }

    console.log('Analytics event:', eventData);
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    if (window.mixpanel) {
      window.mixpanel.identify(userId);
      if (traits) {
        window.mixpanel.people.set(traits);
      }
    }

    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId
      });
    }
  },

  page: (pageName: string, properties?: Record<string, any>) => {
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: pageName,
        ...properties
      });
    }

    if (window.mixpanel) {
      window.mixpanel.track('Page View', {
        page: pageName,
        ...properties
      });
    }
  }
};

// Global analytics types
declare global {
  interface Window {
    mixpanel: any;
    gtag: any;
  }
}
