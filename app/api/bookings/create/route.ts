import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation helper functions
function validateBookingRequest(body: any) {
  const errors: string[] = [];

  if (!body.propertyId) {
    errors.push("Property ID is required");
  }

  if (!body.checkIn) {
    errors.push("Check-in date is required");
  } else {
    const checkInDate = new Date(body.checkIn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      errors.push("Check-in date cannot be in the past");
    }
  }

  if (!body.checkOut) {
    errors.push("Check-out date is required");
  } else if (body.checkIn) {
    const checkInDate = new Date(body.checkIn);
    const checkOutDate = new Date(body.checkOut);

    if (checkOutDate <= checkInDate) {
      errors.push("Check-out date must be after check-in date");
    }

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (nights > 30) {
      errors.push("Maximum stay is 30 nights");
    }
  }

  if (!body.guests || body.guests < 1) {
    errors.push("At least 1 guest is required");
  }

  if (body.guests && body.guests > 16) {
    errors.push("Maximum 16 guests allowed");
  }

  if (!body.guestInfo) {
    errors.push("Guest information is required");
  } else {
    if (!body.guestInfo.name || body.guestInfo.name.trim().length < 2) {
      errors.push("Guest name must be at least 2 characters");
    }

    if (
      !body.guestInfo.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.guestInfo.email)
    ) {
      errors.push("Valid email address is required");
    }

    // Enhanced phone validation
    if (!body.guestInfo.phone || body.guestInfo.phone.trim().length === 0) {
      errors.push("Phone number is required");
    } else {
      try {
        // Try parsing with default country (Canada/US)
        if (!isValidPhoneNumber(body.guestInfo.phone, "CA")) {
          // Try without country code
          if (!isValidPhoneNumber(body.guestInfo.phone)) {
            errors.push(
              "Invalid phone number format. Please include country code (e.g., +1 for North America)"
            );
          }
        }
      } catch (phoneError) {
        errors.push("Invalid phone number format");
      }
    }
  }

  if (!body.totalAmount || body.totalAmount <= 0) {
    errors.push("Total amount must be greater than 0");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = validateBookingRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
          message: "Please check your booking details and try again",
        },
        { status: 400 }
      );
    }

    const { propertyId, checkIn, checkOut, guests, guestInfo, totalAmount } =
      body;

    // Check if property exists and is active
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, host_id, title, max_guests, is_active")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        {
          error: "Property not found",
          message: "The property you're trying to book no longer exists",
        },
        { status: 404 }
      );
    }

    if (!property.is_active) {
      return NextResponse.json(
        {
          error: "Property unavailable",
          message: "This property is currently not available for booking",
        },
        { status: 400 }
      );
    }

    if (guests > property.max_guests) {
      return NextResponse.json(
        {
          error: "Too many guests",
          message: `This property can only accommodate up to ${property.max_guests} guests`,
        },
        { status: 400 }
      );
    }

    // Check if property is available
    const { data: existingBookings, error: availabilityError } = await supabase
      .from("bookings")
      .select("id, check_in_date, check_out_date, status")
      .eq("property_id", propertyId)
      .in("status", ["pending", "confirmed"])
      .or(`check_in_date.lte.${checkOut},check_out_date.gte.${checkIn}`);

    if (availabilityError) {
      console.error("Availability check error:", availabilityError);
      return NextResponse.json(
        {
          error: "Availability check failed",
          message: "Unable to verify property availability. Please try again.",
        },
        { status: 500 }
      );
    }

    if (existingBookings && existingBookings.length > 0) {
      const conflictingBooking = existingBookings[0];
      const from = conflictingBooking?.check_in_date ?? checkIn;
      const to = conflictingBooking?.check_out_date ?? checkOut;
      return NextResponse.json(
        {
          error: "Property not available",
          message: `The property is already booked from ${from} to ${to}`,
          conflictingDates: {
            checkIn: from,
            checkOut: to,
          },
        },
        { status: 409 }
      );
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: propertyId,
        guest_id: guestInfo.userId || null, // Optional user ID if logged in
        host_id: property.host_id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests_count: guests,
        total_amount: totalAmount,
        guest_name: guestInfo.name,
        guest_email: guestInfo.email,
        guest_phone: guestInfo.phone,
        special_requests: guestInfo.specialRequests || null,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);

      // Handle specific database errors
      if (bookingError.code === "23505") {
        return NextResponse.json(
          {
            error: "Duplicate booking",
            message: "A booking with these details already exists",
          },
          { status: 409 }
        );
      }

      if (bookingError.code === "23503") {
        return NextResponse.json(
          {
            error: "Invalid reference",
            message: "The property or host information is invalid",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: "Booking creation failed",
          message: "Unable to create booking. Please try again.",
        },
        { status: 500 }
      );
    }

    // Get property and host information for notification and emails
    const { data: propertyDetails } = await supabase
      .from("properties")
      .select("host_id, title, address")
      .eq("id", propertyId)
      .single();

    // Get host profile and email from auth.users
    const { data: hostProfile } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .eq("id", propertyDetails?.host_id)
      .single();

    // Get host email from auth.users table
    let hostEmail = null;
    if (hostProfile?.user_id) {
      const { data: authUser } = await supabase.auth.admin.getUserById(
        hostProfile.user_id
      );
      hostEmail = authUser?.user?.email;
    }

    // Create notification for host
    if (propertyDetails?.host_id) {
      try {
        await supabase.from("notifications").insert({
          user_id: propertyDetails.host_id,
          type: "booking_new",
          title: "New Booking Received! 🎉",
          message: `You have received a new booking for ${propertyDetails.title}`,
          data: {
            booking_id: booking.id,
            property_id: propertyId,
            property_title: propertyDetails.title,
            guest_name: guestInfo.name,
            check_in_date: checkIn,
            check_out_date: checkOut,
            guests_count: guests,
            total_amount: totalAmount,
          },
          is_read: false,
          created_at: new Date().toISOString(),
        });
      } catch (notificationError) {
        console.error("Failed to create notification:", notificationError);
        // Don't fail the booking creation if notification fails
      }
    }

// Send email notification to guest (booking confirmation)
    if (guestInfo.email) {
      try {
        const { unifiedEmailService } = await import("@/lib/unified-email-service");
        await unifiedEmailService.sendBookingConfirmation({
          bookingId: booking.id,
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          hostName: `${hostProfile?.first_name || ""} ${hostProfile?.last_name || ""}`.trim() || "Host",
          hostEmail: hostEmail || "",
          propertyTitle: propertyDetails?.title || "Property",
          propertyLocation: propertyDetails?.address || "",
          checkInDate: new Date(checkIn).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          checkOutDate: new Date(checkOut).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          guests: guests,
          totalAmount: totalAmount,
        });
        console.log("✅ Guest confirmation email sent");
      } catch (emailError) {
        console.error("Failed to send guest email:", emailError);
        // Don't fail the booking if email fails
      }
    }

// Send email notification to host (new booking alert)
    if (hostEmail) {
      try {
        const { unifiedEmailService } = await import("@/lib/unified-email-service");
        await unifiedEmailService.sendHostNotification({
          bookingId: booking.id,
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          hostName: `${hostProfile?.first_name || ""} ${hostProfile?.last_name || ""}`.trim() || "Host",
          hostEmail: hostEmail,
          propertyTitle: propertyDetails?.title || "Property",
          propertyLocation: propertyDetails?.address || "",
          checkInDate: new Date(checkIn).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          checkOutDate: new Date(checkOut).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          guests: guests,
          totalAmount: totalAmount,
          specialRequests: guestInfo.specialRequests || "",
        });
        console.log("✅ Host notification email sent");
      } catch (emailError) {
        console.error("Failed to send host email:", emailError);
        // Don't fail the booking if email fails
      }
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      status: "pending",
      message:
        "Booking created successfully! The host will review your request.",
      booking: {
        id: booking.id,
        propertyId: booking.property_id,
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        guests: booking.guests_count,
        totalAmount: booking.total_amount,
        status: booking.status,
        createdAt: booking.created_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error creating booking:", error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          message: "Please check your request data and try again",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
