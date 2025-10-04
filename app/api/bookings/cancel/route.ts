import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, reason, refund = false } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    console.log(`Cancelling booking ${bookingId}`);

    // Fetch booking details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        stripe_payment_intent_id,
        total_amount,
        guest_name,
        guest_email,
        host_id,
        property_id,
        check_in_date,
        check_out_date,
        properties!inner (
          title,
          host_id
        )
      `)
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Calculate refund eligibility based on cancellation policy
    const checkInDate = new Date(booking.check_in_date);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil(
      (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let refundEligible = false;
    let refundAmount = 0;
    let refundPercentage = 0;

    // Cancellation policy:
    // - More than 7 days: Full refund
    // - 3-7 days: 50% refund
    // - Less than 3 days: No refund
    if (daysUntilCheckIn > 7) {
      refundEligible = true;
      refundPercentage = 100;
      refundAmount = booking.total_amount;
    } else if (daysUntilCheckIn >= 3) {
      refundEligible = true;
      refundPercentage = 50;
      refundAmount = booking.total_amount * 0.5;
    }

    // Process refund if requested and eligible
    let stripeRefundId = null;
    if (refund && refundEligible && booking.stripe_payment_intent_id) {
      try {
        const refundResponse = await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          amount: Math.round(refundAmount * 100), // Convert to cents
          reason: "requested_by_customer",
          metadata: {
            booking_id: bookingId,
            cancellation_reason: reason || "User requested cancellation",
          },
        });

        stripeRefundId = refundResponse.id;
        console.log(`✅ Refund created: ${stripeRefundId} for $${refundAmount}`);
      } catch (stripeError: any) {
        console.error("❌ Stripe refund failed:", stripeError);
        return NextResponse.json(
          {
            error: "Failed to process refund",
            details: stripeError.message,
          },
          { status: 500 }
        );
      }
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("❌ Error updating booking:", updateError);
      throw updateError;
    }

    console.log(`✅ Booking ${bookingId} cancelled`);

    // Create notification for host
    const propertyInfo = Array.isArray(booking.properties)
      ? booking.properties[0]
      : booking.properties;

    await supabase.from("notifications").insert({
      user_id: booking.host_id,
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: `${booking.guest_name} cancelled their booking for ${propertyInfo?.title}`,
      data: {
        booking_id: bookingId,
        property_id: booking.property_id,
        property_title: propertyInfo?.title,
        guest_name: booking.guest_name,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        cancellation_reason: reason || "Not specified",
        refund_amount: refundAmount,
        refund_percentage: refundPercentage,
      },
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Send cancellation email (optional - implement if needed)
    try {
      const appUrl = process.env.APP_URL || "http://localhost:3000";

      // Email to guest
      await supabase.functions.invoke("send-email-notification", {
        body: {
          to: booking.guest_email,
          template: "booking_cancelled_guest",
          subject: `Booking Cancelled - ${propertyInfo?.title}`,
          data: {
            guestName: booking.guest_name,
            propertyTitle: propertyInfo?.title,
            checkInDate: booking.check_in_date,
            checkOutDate: booking.check_out_date,
            refundAmount: refundAmount,
            refundPercentage: refundPercentage,
            cancellationReason: reason || "Cancelled by request",
          },
        },
      });

      console.log("✅ Cancellation email sent");
    } catch (emailError) {
      console.error("❌ Failed to send cancellation email:", emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      booking_id: bookingId,
      refund_processed: refund && refundEligible,
      refund_amount: refundAmount,
      refund_percentage: refundPercentage,
      refund_id: stripeRefundId,
      cancellation_policy: {
        days_until_checkin: daysUntilCheckIn,
        refund_eligible: refundEligible,
        message:
          daysUntilCheckIn > 7
            ? "Full refund (>7 days notice)"
            : daysUntilCheckIn >= 3
              ? "50% refund (3-7 days notice)"
              : "No refund (<3 days notice)",
      },
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
