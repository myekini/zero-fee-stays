import { NextRequest, NextResponse } from "next/server";
import { unifiedEmailService } from "@/lib/unified-email-service";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        properties!bookings_property_id_fkey(
          id,
          title,
          address,
          location,
          wifi_network,
          wifi_password,
          parking_instructions,
          entry_instructions
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
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Prepare check-in reminder data
    const reminderData = {
      guestName:
        `${booking.guest?.first_name || ""} ${booking.guest?.last_name || ""}`.trim(),
      guestEmail: booking.guest?.email || "",
      propertyName: booking.properties?.title || "",
      checkInDate: booking.check_in_date,
      checkInTime: "3:00 PM", // Default check-in time
      propertyAddress: booking.properties?.address || "",
      hostName:
        `${booking.host?.first_name || ""} ${booking.host?.last_name || ""}`.trim(),
      hostPhone: booking.host?.phone || "",
      bookingId: booking.id,
      wifiNetwork: booking.properties?.wifi_network,
      wifiPassword: booking.properties?.wifi_password,
      parkingInstructions: booking.properties?.parking_instructions,
      entryInstructions: booking.properties?.entry_instructions,
    };

    // Send check-in reminder email
    const result = await unifiedEmailService.sendCheckInReminder(reminderData);

    if (!result.success) {
      console.error("Failed to send check-in reminder:", result.error);
      return NextResponse.json(
        { error: "Failed to send check-in reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Check-in reminder sent successfully",
      emailId: result.emailId,
    });
  } catch (error) {
    console.error("Error sending check-in reminder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

