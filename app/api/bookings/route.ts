import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("host_id");
    const guestId = searchParams.get("guest_id");
    const propertyId = searchParams.get("property_id");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: "Offset must be non-negative" },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    console.log(`Fetching bookings with filters:`, {
      hostId,
      guestId,
      propertyId,
      status,
    });

    let query = supabase
      .from("bookings")
      .select(
        `
        *,
        properties!bookings_property_id_fkey(
          id,
          title,
          address,
          location,
          price_per_night,
          property_images!property_images_property_id_fkey(image_url)
        ),
        guest:profiles!bookings_guest_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar_url
        ),
        host:profiles!bookings_host_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (hostId) {
      query = query.eq("host_id", hostId);
    }
    if (guestId) {
      query = query.eq("guest_id", guestId);
    }
    if (propertyId) {
      query = query.eq("property_id", propertyId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: bookings, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Transform the data to include property images
    const transformedBookings =
      bookings?.map((booking) => ({
        ...booking,
        property: {
          ...booking.properties,
          images:
            booking.properties?.property_images?.map(
              (img: any) => img.image_url
            ) || [],
        },
        guest_name:
          `${booking.guest?.first_name || ""} ${booking.guest?.last_name || ""}`.trim(),
        guest_email: booking.guest?.email,
        guest_phone: booking.guest?.phone,
        host_name:
          `${booking.host?.first_name || ""} ${booking.host?.last_name || ""}`.trim(),
        host_email: booking.host?.email,
      })) || [];

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
      count: transformedBookings.length,
      pagination: {
        limit,
        offset,
        hasMore: transformedBookings.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);

    // Return appropriate error response based on error type
    if (error instanceof Error) {
      if (error.message.includes("Database error")) {
        return NextResponse.json(
          { error: "Database connection error. Please try again later." },
          { status: 503 }
        );
      }
      if (error.message.includes("Invalid")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch bookings. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status, notes, specialRequests } = body;

    // Validate required fields
    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Booking ID and status are required" },
        { status: 400 }
      );
    }

    // Validate booking ID format (should be UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID format" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    console.log(`Updating booking ${bookingId} to status: ${status}`);

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (notes) updateData.notes = notes;
    if (specialRequests) updateData.special_requests = specialRequests;

    const { data: booking, error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", bookingId)
      .select(
        `
        *,
        properties!bookings_property_id_fkey(
          id,
          title,
          address,
          location,
          price_per_night
        ),
        guest:profiles!bookings_guest_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        host:profiles!bookings_host_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `
      )
      .single();

    if (error) {
      throw error;
    }

    // Create notification for guest based on status change
    if (status === "confirmed") {
      await supabase.from("notifications").insert({
        user_id: booking.guest_id,
        type: "booking_confirmed",
        title: "Booking Confirmed! ✅",
        message: `Your booking for ${booking.properties?.title} has been confirmed`,
        data: {
          booking_id: booking.id,
          property_id: booking.property_id,
          property_title: booking.properties?.title,
        },
        is_read: false,
      });
    } else if (status === "cancelled") {
      await supabase.from("notifications").insert({
        user_id: booking.guest_id,
        type: "booking_cancelled",
        title: "Booking Cancelled ❌",
        message: `Your booking for ${booking.properties?.title} has been cancelled`,
        data: {
          booking_id: booking.id,
          property_id: booking.property_id,
          property_title: booking.properties?.title,
        },
        is_read: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: {
        ...booking,
        guest_name:
          `${booking.guest?.first_name || ""} ${booking.guest?.last_name || ""}`.trim(),
        guest_email: booking.guest?.email,
        host_name:
          `${booking.host?.first_name || ""} ${booking.host?.last_name || ""}`.trim(),
      },
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    console.log(`Deleting booking: ${bookingId}`);

    // Check if booking can be cancelled (not completed)
    const { data: booking } = await supabase
      .from("bookings")
      .select("status, check_in_date")
      .eq("id", bookingId)
      .single();

    if (booking && booking.status === "completed") {
      return NextResponse.json(
        { error: "Cannot delete completed bookings" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
