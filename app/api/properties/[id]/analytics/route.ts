import { createClient } from "@/integrations/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/properties/[id]/analytics
 * Get comprehensive analytics for a property
 * Query params: period (30d, 90d, 1y, all)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resolvedParams = await params;
    const propertyId = resolvedParams.id;
    const period = searchParams.get("period") || "30d";

    // Verify property ownership
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("host_id, title, price_per_night, created_at")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.host_id !== user.id) {
      return NextResponse.json(
        { error: "You can only view analytics for your own properties" },
        { status: 403 }
      );
    }

    // Calculate date range
    let dateFrom = new Date();
    if (period === "30d") {
      dateFrom.setDate(dateFrom.getDate() - 30);
    } else if (period === "90d") {
      dateFrom.setDate(dateFrom.getDate() - 90);
    } else if (period === "1y") {
      dateFrom.setFullYear(dateFrom.getFullYear() - 1);
    } else if (period === "all") {
      dateFrom = new Date(property.created_at);
    }

    const dateFromStr = dateFrom.toISOString();

    // Get all bookings for the property in the period
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        check_in_date,
        check_out_date,
        guests_count,
        total_amount,
        payment_status,
        created_at,
        profiles!bookings_guest_id_fkey (
          first_name,
          last_name
        )
      `
      )
      .eq("property_id", propertyId)
      .gte("created_at", dateFromStr)
      .order("created_at", { ascending: false });

    if (bookingsError) {
      console.error("Bookings error:", bookingsError);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    // Get reviews for the property
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating, created_at")
      .eq("property_id", propertyId)
      .eq("status", "published")
      .gte("created_at", dateFromStr);

    if (reviewsError) {
      console.error("Reviews error:", reviewsError);
    }

    // Calculate revenue metrics
    const completedBookings =
      bookings?.filter((b) => b.status === "completed") || [];
    const confirmedBookings =
      bookings?.filter((b) => b.status === "confirmed") || [];
    const cancelledBookings =
      bookings?.filter((b) => b.status === "cancelled") || [];
    const pendingBookings =
      bookings?.filter((b) => b.status === "pending") || [];

    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + (b.total_amount || 0),
      0
    );
    const pendingRevenue = confirmedBookings.reduce(
      (sum, b) => sum + (b.total_amount || 0),
      0
    );
    const potentialRevenue = pendingBookings.reduce(
      (sum, b) => sum + (b.total_amount || 0),
      0
    );

    // Calculate nights booked
    const totalNights = completedBookings.reduce((sum, b) => {
      const checkIn = new Date(b.check_in_date);
      const checkOut = new Date(b.check_out_date);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + nights;
    }, 0);

    const upcomingNights = confirmedBookings.reduce((sum, b) => {
      const checkIn = new Date(b.check_in_date);
      const checkOut = new Date(b.check_out_date);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + nights;
    }, 0);

    // Calculate average nightly rate (from completed bookings)
    const averageNightlyRate =
      totalNights > 0 ? totalRevenue / totalNights : 0;

    // Calculate occupancy rate
    const periodDays = Math.ceil(
      (new Date().getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)
    );
    const occupancyRate =
      periodDays > 0 ? (totalNights / periodDays) * 100 : 0;

    // Revenue trend (group by week)
    const revenueTrend: { [key: string]: number } = {};
    completedBookings.forEach((booking) => {
      const weekStart = new Date(booking.created_at);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekKey = weekStart.toISOString().split("T")[0];
      revenueTrend[weekKey] =
        (revenueTrend[weekKey] || 0) + (booking.total_amount || 0);
    });

    // Booking trend (group by week)
    const bookingTrend: { [key: string]: number } = {};
    bookings?.forEach((booking) => {
      const weekStart = new Date(booking.created_at);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      bookingTrend[weekKey] = (bookingTrend[weekKey] || 0) + 1;
    });

    // Guest satisfaction
    const averageRating =
      reviews && reviews.length > 0
        ? reviews.reduce(
            (sum, r) => sum + (Number(r.rating) || 0),
            0
          ) / reviews.length
        : null;

    // Calculate response time (simplified - would need messaging data)
    // For now, we'll use a placeholder
    const averageResponseTime = null; // TODO: Implement with messaging system

    // Top guests (most bookings)
    const guestBookingCounts: { [key: string]: { count: number; name: string } } = {};
    bookings?.forEach((booking) => {
      const guestName = `${booking.profiles?.first_name || ""} ${booking.profiles?.last_name || ""}`.trim() || "Anonymous";
      if (!guestBookingCounts[guestName]) {
        guestBookingCounts[guestName] = { count: 0, name: guestName };
      }
      guestBookingCounts[guestName].count++;
    });

    const topGuests = Object.values(guestBookingCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((g) => ({
        name: g.name,
        bookings: g.count,
      }));

    // Booking source analysis
    const bookingsByMonth: { [key: string]: number } = {};
    bookings?.forEach((booking) => {
      const month = new Date(booking.created_at)
        .toISOString()
        .substring(0, 7); // YYYY-MM
      bookingsByMonth[month] = (bookingsByMonth[month] || 0) + 1;
    });

    // Upcoming bookings
    const upcomingBookings = confirmedBookings
      .filter((b) => new Date(b.check_in_date) >= new Date())
      .slice(0, 5)
      .map((b) => ({
        id: b.id,
        guest:
          `${b.profiles?.first_name || ""} ${b.profiles?.last_name || ""}`.trim() ||
          "Anonymous",
        check_in: b.check_in_date,
        check_out: b.check_out_date,
        guests: b.guests_count,
        total: b.total_amount || 0,
      }));

    return NextResponse.json({
      property: {
        id: propertyId,
        title: property.title,
        base_price: typeof property.price_per_night === 'string' ? parseFloat(property.price_per_night) : property.price_per_night,
      },
      period: {
        type: period,
        start_date: dateFromStr.split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        days: periodDays,
      },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        pending: Math.round(pendingRevenue * 100) / 100,
        potential: Math.round(potentialRevenue * 100) / 100,
        average_nightly_rate: Math.round(averageNightlyRate * 100) / 100,
        trend: Object.entries(revenueTrend)
          .map(([date, amount]) => ({
            date,
            amount: Math.round(amount * 100) / 100,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      },
      bookings: {
        total: bookings?.length || 0,
        completed: completedBookings.length,
        confirmed: confirmedBookings.length,
        pending: pendingBookings.length,
        cancelled: cancelledBookings.length,
        trend: Object.entries(bookingTrend)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        by_month: Object.entries(bookingsByMonth)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      },
      occupancy: {
        total_nights_booked: totalNights,
        upcoming_nights: upcomingNights,
        occupancy_rate: Math.round(occupancyRate * 10) / 10,
      },
      guest_satisfaction: {
        average_rating: averageRating
          ? Math.round(averageRating * 10) / 10
          : null,
        total_reviews: reviews?.length || 0,
        average_response_time: averageResponseTime,
      },
      top_guests: topGuests,
      upcoming_bookings: upcomingBookings,
    });
  } catch (error) {
    console.error("Error getting analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
