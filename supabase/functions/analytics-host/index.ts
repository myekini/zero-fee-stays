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
    const hostId = url.searchParams.get('hostId');
    const timeRange = url.searchParams.get('timeRange') || '30days';

    if (!hostId) {
      return new Response(JSON.stringify({ error: 'Host ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    console.log(`Fetching analytics for host ${hostId} for ${timeRange}`);

    // Fetch host's bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        properties (
          id,
          title,
          price_per_night,
          location,
          property_type
        )
      `)
      .eq('host_id', hostId)
      .gte('created_at', startDate.toISOString());

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    // Fetch host's properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('host_id', hostId);

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      throw propertiesError;
    }

    // Calculate earnings metrics
    const totalEarnings = bookings?.reduce((sum: number, booking: any) => 
      sum + Number(booking.total_amount), 0) || 0;
    
    const confirmedBookings = bookings?.filter((b: any) => b.status === 'confirmed') || [];
    const avgBookingValue = confirmedBookings.length > 0 
      ? totalEarnings / confirmedBookings.length 
      : 0;

    // Calculate occupancy rate (simplified)
    const totalPropertyDays = (properties?.length || 0) * daysBack;
    const bookedDays = confirmedBookings.reduce((sum: number, booking: any) => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    const occupancyRate = totalPropertyDays > 0 ? bookedDays / totalPropertyDays : 0;

    // Generate monthly earnings trend
    const monthlyEarnings = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthBookings = bookings?.filter((booking: any) => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      }) || [];
      
      const monthEarnings = monthBookings.reduce((sum: number, booking: any) => 
        sum + Number(booking.total_amount), 0);
      
      monthlyEarnings.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        earnings: monthEarnings,
        bookings: monthBookings.length
      });
    }

    // Property performance breakdown
    const propertyPerformance = properties?.map((property: any) => {
      const propertyBookings = bookings?.filter((b: any) => b.property_id === property.id) || [];
      const propertyRevenue = propertyBookings.reduce((sum: number, booking: any) => 
        sum + Number(booking.total_amount), 0);
      
      return {
        propertyId: property.id,
        title: property.title,
        location: property.location,
        type: property.property_type,
        bookings: propertyBookings.length,
        revenue: propertyRevenue,
        avgNightlyRate: property.price_per_night,
        // Mock data for views - would come from Mixpanel
        views: Math.floor(Math.random() * 500) + 100,
        conversionRate: propertyBookings.length > 0 ? (propertyBookings.length / (Math.floor(Math.random() * 500) + 100)) * 100 : 0
      };
    }) || [];

    // Guest insights
    const guestMetrics = {
      totalGuests: confirmedBookings.reduce((sum: number, booking: any) => sum + booking.guests_count, 0),
      avgStayDuration: confirmedBookings.length > 0 
        ? confirmedBookings.reduce((sum: number, booking: any) => {
            const checkIn = new Date(booking.check_in_date);
            const checkOut = new Date(booking.check_out_date);
            return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          }, 0) / confirmedBookings.length
        : 0,
      repeatGuests: 0, // Would need guest tracking
      avgRating: 4.5 + Math.random() * 0.5 // Mock data
    };

    const analytics = {
      summary: {
        totalEarnings,
        totalBookings: bookings?.length || 0,
        confirmedBookings: confirmedBookings.length,
        avgBookingValue,
        occupancyRate,
        activeProperties: properties?.filter((p: any) => p.is_active).length || 0
      },
      trends: {
        monthlyEarnings,
        projectedMonthlyEarnings: totalEarnings * (30 / daysBack)
      },
      properties: {
        performance: propertyPerformance,
        topPerformer: propertyPerformance.sort((a, b) => b.revenue - a.revenue)[0] || null
      },
      guests: guestMetrics,
      timeRange,
      lastUpdated: new Date().toISOString()
    };

    console.log(`Successfully generated analytics for host ${hostId}`);

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analytics-host function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch host analytics',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});