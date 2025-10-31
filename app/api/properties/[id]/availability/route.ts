import { createClient } from "@/integrations/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/properties/[id]/availability
 * Get property availability for a date range
 * Query params: start_date, end_date
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const resolvedParams = await params;
    const propertyId = resolvedParams.id;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Validate dates
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "start_date and end_date are required" },
        { status: 400 }
      );
    }

    // Check if property exists
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, price_per_night, title")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Get availability status using database function
    const { data: availabilityCheck } = await supabase.rpc(
      "check_property_availability",
      {
        property_uuid: propertyId,
        check_in_date: startDate,
        check_out_date: endDate,
      }
    );

    // Get pricing using database function
    const { data: pricingData } = await supabase.rpc("get_property_pricing", {
      property_uuid: propertyId,
      check_in_date: startDate,
      check_out_date: endDate,
    });

    // Get explicit availability records
    const { data: availabilityRecords } = await supabase
      .from("property_availability")
      .select("*")
      .eq("property_id", propertyId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    // Combine data for each date
    const dates = pricingData?.map((pricing: any) => {
      const availRecord = availabilityRecords?.find(
        (r) => r.date === pricing.date
      );
      const isBooked = availabilityCheck?.[0]?.booked_dates?.includes(
        pricing.date
      );
      const isBlocked = availabilityCheck?.[0]?.blocked_dates?.includes(
        pricing.date
      );

      return {
        date: pricing.date,
        is_available: !isBooked && !isBlocked,
        is_booked: isBooked || false,
        is_blocked: isBlocked || false,
        price: parseFloat(pricing.price),
        is_custom_price: pricing.is_custom_price,
        min_nights: availRecord?.min_nights || null,
        max_nights: availRecord?.max_nights || null,
        blocked_reason: availRecord?.blocked_reason || null,
        notes: availRecord?.notes || null,
      };
    });

    return NextResponse.json({
      property_id: propertyId,
      property_title: property.title,
      base_price: typeof property.price_per_night === 'string' ? parseFloat(property.price_per_night) : property.price_per_night,
      start_date: startDate,
      end_date: endDate,
      is_fully_available: availabilityCheck?.[0]?.is_available || false,
      dates: dates || [],
      summary: {
        total_days: dates?.length || 0,
        available_days:
          dates?.filter((d: any) => d.is_available).length || 0,
        booked_days: availabilityCheck?.[0]?.booked_dates?.length || 0,
        blocked_days: availabilityCheck?.[0]?.blocked_dates?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error getting availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties/[id]/availability
 * Block or unblock dates, set custom pricing
 */
export async function POST(
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

    const resolvedParams = await params;
    const propertyId = resolvedParams.id;

    // Verify property ownership
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("host_id")
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
        { error: "You can only manage availability for your own properties" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      start_date,
      end_date,
      is_available,
      custom_price,
      min_nights,
      max_nights,
      blocked_reason,
      notes,
    } = body;

    // Validate dates
    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: "start_date and end_date are required" },
        { status: 400 }
      );
    }

    // Generate array of dates
    const startD = new Date(start_date);
    const endD = new Date(end_date);
    const dates = [];

    for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }

    // Upsert availability for each date
    const availabilityRecords = dates.map((date) => ({
      property_id: propertyId,
      date: date,
      is_available: is_available !== undefined ? is_available : true,
      custom_price: custom_price || null,
      min_nights: min_nights || null,
      max_nights: max_nights || null,
      blocked_reason:
        is_available === false && blocked_reason ? blocked_reason : null,
      notes: notes || null,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from("property_availability")
      .upsert(availabilityRecords, {
        onConflict: "property_id,date",
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to update availability" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update_property_availability",
      entity_type: "property",
      entity_id: propertyId,
      metadata: {
        start_date,
        end_date,
        days_affected: dates.length,
        is_available,
        custom_price,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated availability for ${dates.length} day(s)`,
      dates: dates,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/properties/[id]/availability
 * Remove custom availability rules (revert to default)
 * Query params: start_date, end_date
 */
export async function DELETE(
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
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Verify property ownership
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("host_id")
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
        { error: "You can only manage availability for your own properties" },
        { status: 403 }
      );
    }

    // Delete availability records
    let query = supabase
      .from("property_availability")
      .delete()
      .eq("property_id", propertyId);

    if (startDate) {
      query = query.gte("date", startDate);
    }

    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { error: deleteError } = await query;

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete availability rules" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete_property_availability",
      entity_type: "property",
      entity_id: propertyId,
      metadata: {
        start_date: startDate,
        end_date: endDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Availability rules removed",
    });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
