import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("property_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching calendar for property: ${propertyId}`);

    // Get bookings for the property
    let query = supabase
      .from("bookings")
      .select(
        `
        id,
        check_in_date,
        check_out_date,
        status,
        guests_count,
        total_amount,
        profiles!bookings_guest_id_fkey(
          first_name,
          last_name
        )
      `
      )
      .eq("property_id", propertyId)
      .order("check_in_date", { ascending: true });

    if (startDate && endDate) {
      query = query
        .gte("check_in_date", startDate)
        .lte("check_out_date", endDate);
    }

    const { data: bookings, error } = await query;

    if (error) {
      throw error;
    }

    // Get property availability rules
    const { data: property } = await supabase
      .from("properties")
      .select("availability_rules, min_nights, max_nights")
      .eq("id", propertyId)
      .single();

    // Get blocked dates for the property
    let blockedDatesQuery = supabase
      .from("blocked_dates")
      .select("*")
      .eq("property_id", propertyId);

    if (startDate && endDate) {
      blockedDatesQuery = blockedDatesQuery.or(
        `start_date.lte.${endDate},end_date.gte.${startDate}`
      );
    }

    const { data: blockedDates } = await blockedDatesQuery;

    // Generate calendar data
    const calendarData = generateCalendarData(
      bookings || [],
      blockedDates || [],
      property?.availability_rules || {},
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      calendar: calendarData,
      bookings: bookings || [],
      availability_rules: property?.availability_rules || {},
    });
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      property_id,
      start_date,
      end_date,
      action, // 'block' or 'unblock'
      reason,
      price_override,
    } = body;

    if (!property_id || !start_date || !end_date || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`${action} dates for property: ${property_id}`);

    // Check for existing bookings in the date range
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("property_id", property_id)
      .in("status", ["pending", "confirmed"])
      .or(`check_in_date.lte.${end_date},check_out_date.gte.${start_date}`);

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot modify dates with existing bookings" },
        { status: 400 }
      );
    }

    if (action === "block") {
      // Create a blocked date entry
      const { data: blockedDate, error } = await supabase
        .from("blocked_dates")
        .insert({
          property_id,
          start_date,
          end_date,
          reason: reason || "Host blocked",
          price_override: price_override || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: "Dates blocked successfully",
        blocked_date: blockedDate,
      });
    } else if (action === "unblock") {
      // Remove blocked date entries
      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("property_id", property_id)
        .gte("start_date", start_date)
        .lte("end_date", end_date);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: "Dates unblocked successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing calendar:", error);
    return NextResponse.json(
      { error: "Failed to manage calendar" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      property_id,
      availability_rules,
      min_nights,
      max_nights,
      advance_notice_hours,
      same_day_booking,
    } = body;

    if (!property_id) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    console.log(`Updating availability rules for property: ${property_id}`);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (availability_rules) updateData.availability_rules = availability_rules;
    if (min_nights) updateData.min_nights = parseInt(min_nights);
    if (max_nights) updateData.max_nights = parseInt(max_nights);
    if (advance_notice_hours)
      updateData.advance_notice_hours = parseInt(advance_notice_hours);
    if (same_day_booking !== undefined)
      updateData.same_day_booking = same_day_booking;

    const { data: property, error } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", property_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Availability rules updated successfully",
      property,
    });
  } catch (error) {
    console.error("Error updating availability rules:", error);
    return NextResponse.json(
      { error: "Failed to update availability rules" },
      { status: 500 }
    );
  }
}

function generateCalendarData(
  bookings: any[],
  blockedDates: any[],
  availabilityRules: any,
  startDate?: string | null,
  endDate?: string | null
) {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate
    ? new Date(endDate)
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

  const calendarData = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split("T")[0];

    // Check if date is booked
    const isBooked = bookings.some((booking) => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      return currentDate >= checkIn && currentDate < checkOut;
    });

    // Check if date is blocked
    const isBlocked = blockedDates.some((blockedDate) => {
      const blockStart = new Date(blockedDate.start_date);
      const blockEnd = new Date(blockedDate.end_date);
      return currentDate >= blockStart && currentDate <= blockEnd;
    });

    // Find the booking for this date
    const booking = isBooked
      ? bookings.find((booking) => {
          const checkIn = new Date(booking.check_in_date);
          const checkOut = new Date(booking.check_out_date);
          return currentDate >= checkIn && currentDate < checkOut;
        })
      : null;

    // Find the blocked date info for this date
    const blockedDateInfo = isBlocked
      ? blockedDates.find((blockedDate) => {
          const blockStart = new Date(blockedDate.start_date);
          const blockEnd = new Date(blockedDate.end_date);
          return currentDate >= blockStart && currentDate <= blockEnd;
        })
      : null;

    calendarData.push({
      date: dateStr,
      is_available: !isBooked && !isBlocked,
      is_booked: isBooked,
      is_blocked: isBlocked,
      booking: booking,
      blocked_date: blockedDateInfo,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return calendarData;
}
