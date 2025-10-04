import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateUser, createAuthResponse } from "@/lib/auth-middleware";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch blocked dates for a property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("property_id");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching blocked dates for property ${propertyId}`);

    const { data: blockedDates, error } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("property_id", propertyId)
      .order("start_date", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      blocked_dates: blockedDates || [],
      count: blockedDates?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked dates" },
      { status: 500 }
    );
  }
}

// POST: Create blocked date(s)
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createAuthResponse("Authentication required");
    }

    const body = await request.json();
    const { property_id, start_date, end_date, reason, price_override } = body;

    if (!property_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Property ID, start date, and end date are required" },
        { status: 400 }
      );
    }

    // Verify property ownership
    const { data: property } = await supabase
      .from("properties")
      .select("host_id")
      .eq("id", property_id)
      .single();

    if (!property || property.host_id !== user.profile_id) {
      return NextResponse.json(
        { error: "Unauthorized to block dates for this property" },
        { status: 403 }
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate < startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Check for existing bookings in this date range
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("id, check_in_date, check_out_date")
      .eq("property_id", property_id)
      .in("status", ["confirmed", "pending"])
      .or(
        `check_in_date.lte.${end_date},check_out_date.gte.${start_date}`
      );

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot block dates with existing bookings",
          conflicting_bookings: existingBookings,
        },
        { status: 409 }
      );
    }

    console.log(`Creating blocked dates for property ${property_id}`);

    // Create blocked date
    const { data: blockedDate, error: insertError } = await supabase
      .from("blocked_dates")
      .insert({
        property_id,
        start_date,
        end_date,
        reason: reason || null,
        price_override: price_override ? parseFloat(price_override) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: "Dates blocked successfully",
      blocked_date: blockedDate,
    });
  } catch (error) {
    console.error("Error creating blocked dates:", error);
    return NextResponse.json(
      { error: "Failed to create blocked dates" },
      { status: 500 }
    );
  }
}

// DELETE: Remove blocked date
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createAuthResponse("Authentication required");
    }

    const { searchParams } = new URL(request.url);
    const blockedDateId = searchParams.get("id");

    if (!blockedDateId) {
      return NextResponse.json(
        { error: "Blocked date ID is required" },
        { status: 400 }
      );
    }

    // Fetch blocked date to verify ownership
    const { data: blockedDate } = await supabase
      .from("blocked_dates")
      .select(`
        id,
        property_id,
        properties!inner (
          host_id
        )
      `)
      .eq("id", blockedDateId)
      .single();

    if (!blockedDate) {
      return NextResponse.json(
        { error: "Blocked date not found" },
        { status: 404 }
      );
    }

    const propertyInfo = Array.isArray(blockedDate.properties)
      ? blockedDate.properties[0]
      : blockedDate.properties;

    if (!propertyInfo || propertyInfo.host_id !== user.profile_id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this blocked date" },
        { status: 403 }
      );
    }

    console.log(`Deleting blocked date ${blockedDateId}`);

    // Delete blocked date
    const { error: deleteError } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("id", blockedDateId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Blocked date removed successfully",
    });
  } catch (error) {
    console.error("Error deleting blocked date:", error);
    return NextResponse.json(
      { error: "Failed to delete blocked date" },
      { status: 500 }
    );
  }
}
