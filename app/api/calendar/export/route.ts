import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/integrations/supabase/server";
import { createEvents, EventAttributes, DateArray } from "ics";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get("property_id");

    if (!propertyId) {
      return NextResponse.json(
        { error: "property_id required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("title, address")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Get all confirmed bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, check_in_date, check_out_date, guest_name, status")
      .eq("property_id", propertyId)
      .in("status", ["confirmed", "pending"]);

    if (bookingsError) {
      throw bookingsError;
    }

    // Get manually blocked dates from blocked_dates table
    const { data: blockedDates } = await supabase
      .from("blocked_dates")
      .select("start_date, end_date, reason")
      .eq("property_id", propertyId);

    const events: EventAttributes[] = [];

    // Add bookings as events
    bookings?.forEach((booking: any) => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);

      const startArray: DateArray = [
        checkIn.getFullYear(),
        checkIn.getMonth() + 1,
        checkIn.getDate(),
      ];

      const endArray: DateArray = [
        checkOut.getFullYear(),
        checkOut.getMonth() + 1,
        checkOut.getDate(),
      ];

      events.push({
        start: startArray,
        end: endArray,
        title: `Booked${booking.guest_name ? ` - ${booking.guest_name}` : ""}`,
        description: `Booking ${booking.status} for ${property.title}`,
        location: property.address || undefined,
        status: booking.status === "confirmed" ? "CONFIRMED" : "TENTATIVE",
        busyStatus: "BUSY",
        uid: `booking-${booking.id}@hiddystays.com`,
        productId: "HiddyStays",
      });
    });

    // Add blocked dates
    blockedDates?.forEach((blocked: any, index: number) => {
      const start = new Date(blocked.start_date);
      const end = new Date(blocked.end_date);

      const startArray: DateArray = [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
      ];

      const endArray: DateArray = [
        end.getFullYear(),
        end.getMonth() + 1,
        end.getDate(),
      ];

      events.push({
        start: startArray,
        end: endArray,
        title: `Blocked${blocked.reason ? ` - ${blocked.reason}` : ""}`,
        description: `Property unavailable - ${blocked.reason || "No reason provided"}`,
        location: property.address || undefined,
        status: "CONFIRMED",
        busyStatus: "BUSY",
        uid: `blocked-${propertyId}-${index}@hiddystays.com`,
        productId: "HiddyStays",
      });
    });

    // Generate iCal file
    const { error: icsError, value: icsContent } = createEvents(events);

    if (icsError) {
      console.error("iCal generation error:", icsError);
      return NextResponse.json(
        { error: "Failed to generate calendar" },
        { status: 500 }
      );
    }

    // Return as downloadable file
    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="hiddystays-${propertyId}.ics"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Calendar export error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
