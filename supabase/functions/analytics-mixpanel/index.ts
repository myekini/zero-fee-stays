import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { event, filters, dateRange } = body;

    // Get Mixpanel credentials
    const mixpanelProjectToken = Deno.env.get('MIXPANEL_PROJECT_TOKEN');
    const mixpanelSecret = Deno.env.get('MIXPANEL_SECRET');

    if (!mixpanelProjectToken || !mixpanelSecret) {
      console.log('Mixpanel credentials not configured, returning mock data');
      
      // Return mock analytics data when Mixpanel isn't configured
      const mockData = {
        events: [
          {
            event: 'Property Viewed',
            count: Math.floor(Math.random() * 1000) + 500,
            uniqueUsers: Math.floor(Math.random() * 500) + 250,
            properties: {
              'Property Type': {
                'Apartment': 0.4,
                'House': 0.35,
                'Villa': 0.25
              },
              'Location': {
                'Urban': 0.6,
                'Suburban': 0.3,
                'Rural': 0.1
              }
            }
          },
          {
            event: 'Search Performed',
            count: Math.floor(Math.random() * 800) + 400,
            uniqueUsers: Math.floor(Math.random() * 400) + 200,
            properties: {
              'Search Type': {
                'Location': 0.7,
                'Date Range': 0.2,
                'Price Range': 0.1
              }
            }
          },
          {
            event: 'Booking Started',
            count: Math.floor(Math.random() * 200) + 100,
            uniqueUsers: Math.floor(Math.random() * 180) + 90,
            properties: {
              'Device Type': {
                'Desktop': 0.6,
                'Mobile': 0.35,
                'Tablet': 0.05
              }
            }
          },
          {
            event: 'Payment Completed',
            count: Math.floor(Math.random() * 150) + 75,
            uniqueUsers: Math.floor(Math.random() * 140) + 70,
            properties: {
              'Payment Method': {
                'Credit Card': 0.8,
                'PayPal': 0.15,
                'Bank Transfer': 0.05
              }
            }
          }
        ],
        funnelAnalysis: {
          'Homepage Visit': { users: 10000, conversion: 1.0 },
          'Search': { users: 1500, conversion: 0.15 },
          'Property View': { users: 600, conversion: 0.4 },
          'Booking Start': { users: 180, conversion: 0.3 },
          'Payment': { users: 150, conversion: 0.83 }
        },
        userSegments: {
          'First Time Visitors': {
            count: Math.floor(Math.random() * 2000) + 1000,
            conversionRate: 0.08,
            avgSessionDuration: 3.2
          },
          'Returning Users': {
            count: Math.floor(Math.random() * 800) + 400,
            conversionRate: 0.15,
            avgSessionDuration: 5.1
          },
          'Power Users': {
            count: Math.floor(Math.random() * 200) + 100,
            conversionRate: 0.25,
            avgSessionDuration: 8.7
          }
        },
        cohortAnalysis: [
          { week: 'Week 1', retention: 1.0 },
          { week: 'Week 2', retention: 0.65 },
          { week: 'Week 3', retention: 0.48 },
          { week: 'Week 4', retention: 0.35 },
          { week: 'Week 8', retention: 0.22 },
          { week: 'Week 12', retention: 0.18 }
        ],
        realtimeMetrics: {
          activeUsers: Math.floor(Math.random() * 500) + 200,
          currentSessions: Math.floor(Math.random() * 150) + 50,
          conversionRate: 0.12 + Math.random() * 0.05,
          avgSessionDuration: 4.2 + Math.random() * 2
        }
      };

      return new Response(JSON.stringify(mockData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching Mixpanel data for event: ${event}`);

    // Calculate date range for API
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const fromDate = startDate.toISOString().split('T')[0];
    const toDate = endDate.toISOString().split('T')[0];

    // Prepare Mixpanel API request
    const mixpanelApiUrl = 'https://mixpanel.com/api/2.0/events';
    const credentials = btoa(`${mixpanelProjectToken}:${mixpanelSecret}`);

    const params = new URLSearchParams({
      event: JSON.stringify([event]),
      type: 'general',
      unit: 'day',
      from_date: fromDate,
      to_date: toDate,
      ...(filters && { where: JSON.stringify(filters) })
    });

    const mixpanelResponse = await fetch(`${mixpanelApiUrl}?${params}`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      }
    });

    if (!mixpanelResponse.ok) {
      throw new Error(`Mixpanel API error: ${mixpanelResponse.status}`);
    }

    const mixpanelData = await mixpanelResponse.json();

    // Also fetch funnel data if available
    const funnelData = await fetchFunnelData(mixpanelProjectToken, mixpanelSecret, fromDate, toDate);
    
    // Combine and format the data
    const formattedData = {
      events: mixpanelData.data,
      dateRange: { from: fromDate, to: toDate },
      funnel: funnelData,
      lastUpdated: new Date().toISOString()
    };

    console.log('Successfully fetched Mixpanel analytics data');

    return new Response(JSON.stringify(formattedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analytics-mixpanel function:', error);
    
    // Return mock data on error
    const mockErrorData = {
      error: 'Failed to fetch Mixpanel data',
      mockData: {
        propertyViews: Math.floor(Math.random() * 1000) + 500,
        searchEvents: Math.floor(Math.random() * 300) + 150,
        bookingStarted: Math.floor(Math.random() * 50) + 25,
        conversionRate: 0.08 + Math.random() * 0.05,
        note: 'This is mock data. Configure Mixpanel credentials to get real analytics.'
      }
    };

    return new Response(JSON.stringify(mockErrorData), {
      status: 200, // Return 200 with mock data instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchFunnelData(projectToken: string, secret: string, fromDate: string, toDate: string) {
  try {
    const credentials = btoa(`${projectToken}:${secret}`);
    const funnelUrl = 'https://mixpanel.com/api/2.0/funnels';
    
    const funnelParams = new URLSearchParams({
      funnel_id: '1', // You would set up funnel IDs in Mixpanel
      from_date: fromDate,
      to_date: toDate,
      unit: 'day'
    });

    const funnelResponse = await fetch(`${funnelUrl}?${funnelParams}`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      }
    });

    if (funnelResponse.ok) {
      return await funnelResponse.json();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    return null;
  }
}