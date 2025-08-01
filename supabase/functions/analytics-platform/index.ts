import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

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
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '30days';

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    console.log(`Fetching platform analytics for ${timeRange}`);

    // Fetch all platform data
    const [bookingsResponse, hostsResponse, propertiesResponse] = await Promise.all([
      supabase
        .from('bookings')
        .select(`
          *,
          properties (
            id,
            title,
            location,
            country,
            host_id,
            price_per_night
          )
        `)
        .gte('created_at', startDate.toISOString()),
      
      supabase
        .from('profiles')
        .select('*')
        .eq('is_host', true),
      
      supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
    ]);

    const bookings = bookingsResponse.data || [];
    const hosts = hostsResponse.data || [];
    const properties = propertiesResponse.data || [];

    console.log(`Found ${bookings.length} bookings, ${hosts.length} hosts, ${properties.length} properties`);

    // Calculate platform metrics
    const totalBookingValue = bookings.reduce((sum: number, booking: any) => 
      sum + Number(booking.total_amount), 0);
    
    // Platform fees (2.5%)
    const platformFeeRate = 0.025;
    const platformFees = totalBookingValue * platformFeeRate;
    
    // Mock Stripe processing fees (2.9% + $0.30 per transaction)
    const stripeFees = bookings.length * 0.30 + (totalBookingValue * 0.029);
    const netRevenue = platformFees - stripeFees;

    // Generate monthly trends
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthBookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
      
      const monthRevenue = monthBookings.reduce((sum: number, booking: any) => 
        sum + Number(booking.total_amount), 0);
      
      monthlyTrends.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        year: monthStart.getFullYear(),
        totalBookings: monthBookings.length,
        totalRevenue: monthRevenue,
        platformFees: monthRevenue * platformFeeRate,
        newHosts: Math.floor(Math.random() * 15) + 5, // Mock data
        activeUsers: Math.floor(Math.random() * 2000) + 1000 // Mock data
      });
    }

    // Top performing hosts
    const hostPerformance = hosts.map((host: any) => {
      const hostBookings = bookings.filter((b: any) => b.host_id === host.id);
      const hostRevenue = hostBookings.reduce((sum: number, booking: any) => 
        sum + Number(booking.total_amount), 0);
      const hostProperties = properties.filter((p: any) => p.host_id === host.id);
      
      return {
        hostId: host.id,
        name: `${host.first_name || ''} ${host.last_name || ''}`.trim() || 'Unknown Host',
        email: host.email || 'N/A',
        totalRevenue: hostRevenue,
        totalBookings: hostBookings.length,
        activeProperties: hostProperties.length,
        avgRating: 4.2 + Math.random() * 0.8, // Mock data
        joinedDate: host.created_at,
        lastActive: new Date().toISOString() // Mock data
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Geographic distribution
    const geoDistribution: Record<string, any> = {};
    properties.forEach((property: any) => {
      const country = property.country || 'Unknown';
      if (!geoDistribution[country]) {
        geoDistribution[country] = {
          country,
          properties: 0,
          bookings: 0,
          revenue: 0
        };
      }
      geoDistribution[country].properties++;
      
      const propertyBookings = bookings.filter((b: any) => b.property_id === property.id);
      geoDistribution[country].bookings += propertyBookings.length;
      geoDistribution[country].revenue += propertyBookings.reduce((sum: number, b: any) => 
        sum + Number(b.total_amount), 0);
    });

    // Conversion funnel (mock data - would come from analytics)
    const conversionFunnel = [
      { stage: 'Homepage Visits', users: 125000, conversion: 1.0 },
      { stage: 'Search Performed', users: 18750, conversion: 0.15 },
      { stage: 'Property Viewed', users: 8250, conversion: 0.44 },
      { stage: 'Booking Started', users: 2475, conversion: 0.30 },
      { stage: 'Payment Completed', users: 2200, conversion: 0.89 }
    ];

    // Financial projections
    const currentMonthRevenue = monthlyTrends[monthlyTrends.length - 1]?.platformFees || 0;
    const avgMonthlyGrowth = 0.12; // 12% monthly growth
    const projectedRevenue = currentMonthRevenue * (1 + avgMonthlyGrowth);

    const analytics = {
      overview: {
        totalPlatformRevenue: platformFees,
        totalBookings: bookings.length,
        totalBookingValue,
        activeHosts: hosts.length,
        activeProperties: properties.length,
        avgBookingValue: bookings.length > 0 ? totalBookingValue / bookings.length : 0,
        platformGrowthRate: avgMonthlyGrowth
      },
      financial: {
        platformFees,
        stripeFees,
        netRevenue,
        hostPayouts: totalBookingValue * 0.975,
        projectedMonthlyRevenue: projectedRevenue,
        profitMargin: platformFees > 0 ? (netRevenue / platformFees) * 100 : 0
      },
      trends: {
        monthly: monthlyTrends,
        conversionFunnel,
        revenueGrowth: monthlyTrends.slice(-6).map(m => ({
          month: m.month,
          growth: Math.random() * 20 + 5 // Mock growth percentage
        }))
      },
      hosts: {
        total: hosts.length,
        topPerformers: hostPerformance.slice(0, 10),
        newThisMonth: hostPerformance.filter(h => {
          const joinDate = new Date(h.joinedDate);
          return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
        }).length,
        retentionRate: 0.87, // Mock data
        avgRevenuePerHost: hosts.length > 0 ? totalBookingValue / hosts.length : 0
      },
      geography: {
        distribution: Object.values(geoDistribution),
        topCountries: Object.values(geoDistribution)
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 5)
      },
      technical: {
        systemUptime: 99.97, // Mock data
        avgResponseTime: 1.2, // Mock data
        errorRate: 0.02, // Mock data
        activeUsers: Math.floor(Math.random() * 1500) + 800 // Mock real-time data
      },
      timeRange,
      lastUpdated: new Date().toISOString()
    };

    console.log('Successfully generated platform analytics');

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analytics-platform function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch platform analytics',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});