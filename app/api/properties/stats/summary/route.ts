import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching property statistics");

    // Get total properties count
    const { count: totalProperties } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true });

    // Get active properties count
    const { count: activeProperties } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Get featured properties count
    const { count: featuredProperties } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("is_featured", true);

    // Get properties created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newThisMonth } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    // Get total revenue from confirmed bookings
    const { data: revenueData } = await supabase
      .from("bookings")
      .select("total_amount")
      .eq("status", "confirmed");

    const totalRevenue =
      revenueData?.reduce(
        (sum, booking) => sum + (booking.total_amount || 0),
        0
      ) || 0;

    // Get average rating
    const { data: ratingData } = await supabase
      .from("properties")
      .select("rating")
      .not("rating", "is", null);

    const averageRating =
      ratingData && ratingData.length > 0
        ? ratingData.reduce(
            (sum, property) => sum + (property.rating || 0),
            0
          ) / ratingData.length
        : 0;

    // Get top performing properties (properties with highest revenue)
    const { data: topProperties } = await supabase
      .from("properties")
      .select(
        `
        id,
        title,
        bookings!bookings_property_id_fkey(total_amount)
      `
      )
      .eq("bookings.status", "confirmed")
      .limit(5);

    const topPerforming = topProperties?.length || 0;

    // Calculate average occupancy rate
    const { data: occupancyData } = await supabase.from("properties").select(`
        id,
        bookings!bookings_property_id_fkey(status)
      `);

    let totalOccupancy = 0;
    let propertiesWithBookings = 0;

    if (occupancyData) {
      occupancyData.forEach((property) => {
        const bookings = property.bookings || [];
        if (bookings.length > 0) {
          const confirmedBookings = bookings.filter(
            (b: any) => b.status === "confirmed"
          );
          const occupancyRate =
            (confirmedBookings.length / bookings.length) * 100;
          totalOccupancy += occupancyRate;
          propertiesWithBookings++;
        }
      });
    }

    const averageOccupancy =
      propertiesWithBookings > 0 ? totalOccupancy / propertiesWithBookings : 0;

    const stats = {
      totalProperties: totalProperties || 0,
      activeProperties: activeProperties || 0,
      featuredProperties: featuredProperties || 0,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      averageOccupancy: Math.round(averageOccupancy * 10) / 10,
      newThisMonth: newThisMonth || 0,
      topPerforming,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching property statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch property statistics" },
      { status: 500 }
    );
  }
}
