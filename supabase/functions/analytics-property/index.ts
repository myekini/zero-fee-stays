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
    const propertyId = url.searchParams.get('propertyId');
    const timeRange = url.searchParams.get('timeRange') || '30days';

    if (!propertyId) {
      return new Response(JSON.stringify({ error: 'Property ID is required' }), {
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

    console.log(`Fetching analytics for property ${propertyId} for ${timeRange}`);

    // Fetch property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        *,
        profiles!properties_host_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch property bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles!bookings_guest_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('property_id', propertyId)
      .gte('created_at', startDate.toISOString());

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    // Fetch availability data
    const { data: availability, error: availabilityError } = await supabase
      .from('availability')
      .select('*')
      .eq('property_id', propertyId)
      .gte('date', startDate.toISOString().split('T')[0]);

    if (availabilityError) {
      console.error('Error fetching availability:', availabilityError);
    }

    // Calculate performance metrics
    const totalRevenue = bookings?.reduce((sum: number, booking: any) => 
      sum + Number(booking.total_amount), 0) || 0;
    
    const confirmedBookings = bookings?.filter((b: any) => b.status === 'confirmed') || [];
    const totalBookedNights = confirmedBookings.reduce((sum: number, booking: any) => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    // Calculate occupancy rate
    const totalAvailableNights = daysBack;
    const occupancyRate = totalAvailableNights > 0 ? totalBookedNights / totalAvailableNights : 0;

    // Generate daily performance data
    const dailyPerformance = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayBookings = bookings?.filter((booking: any) => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        return date >= checkIn && date < checkOut && booking.status === 'confirmed';
      }) || [];
      
      const dayRevenue = dayBookings.reduce((sum: number, booking: any) => 
        sum + (Number(booking.total_amount) / Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))), 0);
      
      const isBooked = dayBookings.length > 0;
      const views = Math.floor(Math.random() * 50) + 10; // Mock data - would come from analytics
      
      dailyPerformance.push({
        date: dateStr,
        isBooked,
        revenue: dayRevenue,
        views,
        bookings: dayBookings.length
      });
    }

    // Generate monthly trends
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthBookings = bookings?.filter((booking: any) => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      }) || [];
      
      const monthRevenue = monthBookings.reduce((sum: number, booking: any) => 
        sum + Number(booking.total_amount), 0);
      
      monthlyTrends.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        bookings: monthBookings.length,
        revenue: monthRevenue,
        avgNightlyRate: monthBookings.length > 0 ? monthRevenue / monthBookings.reduce((sum: number, b: any) => {
          const checkIn = new Date(b.check_in_date);
          const checkOut = new Date(b.check_out_date);
          return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) : property.price_per_night,
        occupancyRate: Math.random() * 0.3 + 0.4 // Mock data
      });
    }

    // Guest demographics and behavior
    const guestAnalytics = {
      totalGuests: confirmedBookings.reduce((sum: number, booking: any) => sum + booking.guests_count, 0),
      avgPartySize: confirmedBookings.length > 0 
        ? confirmedBookings.reduce((sum: number, booking: any) => sum + booking.guests_count, 0) / confirmedBookings.length 
        : 0,
      avgStayDuration: confirmedBookings.length > 0 
        ? totalBookedNights / confirmedBookings.length 
        : 0,
      repeatGuests: Math.floor(confirmedBookings.length * 0.15), // Mock data
      avgAdvanceBooking: 21, // Mock data - days in advance
      seasonalPattern: monthlyTrends.map(m => ({
        month: m.month,
        bookings: m.bookings,
        avgRate: m.avgNightlyRate
      }))
    };

    // Competitive analysis (mock data)
    const marketAnalysis = {
      marketPosition: Math.floor(Math.random() * 20) + 1, // Ranking out of similar properties
      avgMarketRate: property.price_per_night * (0.9 + Math.random() * 0.2),
      competitiveIndex: 0.75 + Math.random() * 0.25, // 0-1 scale
      marketOccupancy: 0.65 + Math.random() * 0.15,
      priceRecommendation: {
        suggested: property.price_per_night * (1.05 + Math.random() * 0.1),
        reasoning: 'Based on market rates and demand patterns'
      }
    };

    // Reviews and ratings (mock data)
    const reviewMetrics = {
      averageRating: 4.3 + Math.random() * 0.6,
      totalReviews: Math.floor(confirmedBookings.length * 0.8),
      ratingDistribution: {
        5: Math.floor(confirmedBookings.length * 0.4),
        4: Math.floor(confirmedBookings.length * 0.3),
        3: Math.floor(confirmedBookings.length * 0.2),
        2: Math.floor(confirmedBookings.length * 0.07),
        1: Math.floor(confirmedBookings.length * 0.03)
      },
      commonKeywords: ['clean', 'location', 'comfortable', 'responsive host'],
      sentiment: 'positive'
    };

    const analytics = {
      property: {
        id: property.id,
        title: property.title,
        location: property.location,
        type: property.property_type,
        baseRate: property.price_per_night,
        maxGuests: property.max_guests,
        bedrooms: property.bedrooms,
        isActive: property.is_active,
        host: {
          name: `${property.profiles?.first_name || ''} ${property.profiles?.last_name || ''}`.trim(),
          email: property.profiles?.email
        }
      },
      performance: {
        totalRevenue,
        totalBookings: bookings?.length || 0,
        confirmedBookings: confirmedBookings.length,
        occupancyRate,
        avgNightlyRevenue: totalBookedNights > 0 ? totalRevenue / totalBookedNights : 0,
        totalNightsBooked: totalBookedNights,
        cancellationRate: bookings?.length ? (bookings.filter(b => b.status === 'cancelled').length / bookings.length) * 100 : 0
      },
      trends: {
        daily: dailyPerformance,
        monthly: monthlyTrends,
        projectedRevenue: totalRevenue * (365 / daysBack) // Annualized projection
      },
      guests: guestAnalytics,
      market: marketAnalysis,
      reviews: reviewMetrics,
      bookings: bookings?.map((booking: any) => ({
        id: booking.id,
        guestName: `${booking.profiles?.first_name || ''} ${booking.profiles?.last_name || ''}`.trim(),
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        guests: booking.guests_count,
        amount: booking.total_amount,
        status: booking.status,
        createdAt: booking.created_at
      })) || [],
      timeRange,
      lastUpdated: new Date().toISOString()
    };

    console.log(`Successfully generated analytics for property ${propertyId}`);

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analytics-property function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch property analytics',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});