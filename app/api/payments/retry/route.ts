import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/payments/retry
 * Creates a new payment session for a failed or expired booking
 *
 * WEEK 2: Payment Retry Flow
 * - Allows users to retry failed payments
 * - Creates new Stripe session for existing booking
 * - Preserves all booking details
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    console.log(`Processing payment retry for booking: ${bookingId}`);

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        payment_status,
        property_id,
        check_in_date,
        check_out_date,
        guests_count,
        guest_name,
        guest_email,
        total_amount,
        stripe_session_id,
        properties!inner (
          id,
          title,
          is_active,
          price_per_night
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const property = Array.isArray(booking.properties)
      ? booking.properties[0]
      : booking.properties;

    // Validate booking can be retried
    if (booking.payment_status === "paid") {
      return NextResponse.json(
        {
          error: "Booking already paid",
          message: "This booking has already been paid for",
        },
        { status: 400 }
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        {
          error: "Booking cancelled",
          message: "Cannot retry payment for cancelled booking. Please create a new booking.",
        },
        { status: 400 }
      );
    }

    if (!property?.is_active) {
      return NextResponse.json(
        {
          error: "Property unavailable",
          message: "This property is no longer available. Please search for another property.",
        },
        { status: 400 }
      );
    }

    // Check if property is still available for these dates
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .eq("property_id", booking.property_id)
      .neq("id", bookingId) // Exclude current booking
      .in("status", ["confirmed", "pending"])
      .in("payment_status", ["paid", "pending"])
      .or(
        `check_in_date.lte.${booking.check_out_date},check_out_date.gte.${booking.check_in_date}`
      );

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        {
          error: "Property no longer available",
          message: "The property has been booked by someone else for these dates. Please choose different dates or another property.",
        },
        { status: 409 }
      );
    }

    // Recalculate amount to ensure pricing is current
    const { data: calculationData, error: calcError } = await supabase.rpc(
      "calculate_booking_amount",
      {
        property_uuid: booking.property_id,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        guests_count: booking.guests_count,
      }
    );

    if (calcError || !calculationData || calculationData.length === 0) {
      console.error("Amount calculation error:", calcError);
      return NextResponse.json(
        {
          error: "Failed to calculate amount",
          message: "Unable to recalculate booking price",
        },
        { status: 500 }
      );
    }

    const calculation = calculationData[0];
    const newAmount = parseFloat(calculation.amount);

    // Update booking with new amount if changed
    if (Math.abs(newAmount - booking.total_amount) > 0.01) {
      await supabase
        .from("bookings")
        .update({
          total_amount: newAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      console.log(
        `Updated booking amount from $${booking.total_amount} to $${newAmount}`
      );
    }

    // Reset booking to pending status for retry
    await supabase
      .from("bookings")
      .update({
        status: "pending",
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    // Create new payment session via the create-session API
    // This ensures all the same validation and security checks
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const createSessionUrl = `${baseUrl}/api/payments/create-session`;

    const sessionResponse = await fetch(createSessionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId: bookingId,
        propertyId: booking.property_id,
      }),
    });

    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json();
      return NextResponse.json(
        {
          error: "Failed to create payment session",
          details: errorData.error,
        },
        { status: sessionResponse.status }
      );
    }

    const sessionData = await sessionResponse.json();

    // Log retry attempt
    await supabase.from("payment_transactions").insert({
      booking_id: bookingId,
      transaction_type: "charge",
      amount: newAmount,
      currency: calculation.currency,
      stripe_session_id: sessionData.sessionId,
      status: "pending",
      metadata: {
        retry_attempt: true,
        original_session_id: booking.stripe_session_id,
        amount_changed: Math.abs(newAmount - booking.total_amount) > 0.01,
        old_amount: booking.total_amount,
        new_amount: newAmount,
      },
    });

    console.log(`✅ Payment retry session created for booking ${bookingId}`);

    return NextResponse.json({
      success: true,
      bookingId: bookingId,
      sessionId: sessionData.sessionId,
      url: sessionData.url,
      amount: newAmount,
      amountChanged: Math.abs(newAmount - booking.total_amount) > 0.01,
      oldAmount: booking.total_amount,
      newAmount: newAmount,
      expiresAt: sessionData.expiresAt,
      message: "Payment session created successfully. You will be redirected to complete payment.",
    });
  } catch (error: any) {
    console.error("Error in payment retry:", error);

    return NextResponse.json(
      {
        error: "Payment retry failed",
        message: "An unexpected error occurred. Please try again later.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/retry?bookingId=xxx
 * Get retry eligibility information for a booking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        payment_status,
        total_amount,
        check_in_date,
        properties!inner (
          is_active
        )
      `)
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const property = Array.isArray(booking.properties)
      ? booking.properties[0]
      : booking.properties;

    const canRetry =
      booking.payment_status !== "paid" &&
      booking.status !== "cancelled" &&
      property?.is_active &&
      new Date(booking.check_in_date) > new Date();

    return NextResponse.json({
      bookingId: booking.id,
      canRetry: canRetry,
      currentStatus: booking.status,
      paymentStatus: booking.payment_status,
      amount: booking.total_amount,
      reason: canRetry
        ? "Booking eligible for payment retry"
        : booking.payment_status === "paid"
          ? "Booking already paid"
          : booking.status === "cancelled"
            ? "Booking cancelled"
            : !property?.is_active
              ? "Property no longer available"
              : "Check-in date has passed",
    });
  } catch (error: any) {
    console.error("Error checking retry eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check retry eligibility" },
      { status: 500 }
    );
  }
}
