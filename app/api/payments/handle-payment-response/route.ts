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
    const { payment_intent_id } = body;

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    console.log(`Handling payment response for intent: ${payment_intent_id}`);

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    // Get the booking ID from the payment intent metadata
    const bookingId = paymentIntent.metadata?.booking_id;
    
    if (!bookingId) {
      return NextResponse.json(
        { error: "No booking ID found in payment intent metadata" },
        { status: 400 }
      );
    }

    // Check if the booking exists
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Update booking status based on payment intent status
    let bookingStatus = "pending";
    let paymentStatus = "pending";
    
    if (paymentIntent.status === "succeeded") {
      bookingStatus = "confirmed";
      paymentStatus = "paid";
    } else if (paymentIntent.status === "canceled") {
      bookingStatus = "cancelled";
      paymentStatus = "cancelled";
    } else if (paymentIntent.status === "requires_payment_method") {
      bookingStatus = "pending";
      paymentStatus = "failed";
    } else if (paymentIntent.status === "requires_action") {
      bookingStatus = "pending";
      paymentStatus = "requires_authentication";
    } else if (paymentIntent.status === "processing") {
      bookingStatus = "pending";
      paymentStatus = "processing";
    }

    // Update the booking in the database
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: bookingStatus,
        payment_status: paymentStatus,
        stripe_payment_intent_id: payment_intent_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking status" },
        { status: 500 }
      );
    }

    // Create notification for guest based on payment status
    if (paymentStatus === "paid") {
      await supabase.from("notifications").insert({
        user_id: booking.guest_id,
        type: "payment_successful",
        title: "Payment Successful! ✅",
        message: `Your payment for booking #${bookingId} has been processed successfully.`,
        data: {
          booking_id: bookingId,
          property_id: booking.property_id,
          payment_intent_id: payment_intent_id,
        },
        is_read: false,
      });

      // Also notify the host
      if (booking.host_id) {
        await supabase.from("notifications").insert({
          user_id: booking.host_id,
          type: "booking_paid",
          title: "New Booking Payment Received! 💰",
          message: `You've received a new confirmed booking with payment.`,
          data: {
            booking_id: bookingId,
            property_id: booking.property_id,
            guest_id: booking.guest_id,
          },
          is_read: false,
        });
      }
    } else if (paymentStatus === "failed") {
      await supabase.from("notifications").insert({
        user_id: booking.guest_id,
        type: "payment_failed",
        title: "Payment Failed ❌",
        message: `Your payment for booking #${bookingId} has failed. Please try again with a different payment method.`,
        data: {
          booking_id: bookingId,
          property_id: booking.property_id,
          payment_intent_id: payment_intent_id,
        },
        is_read: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      data: {
        booking_id: bookingId,
        payment_intent_id: payment_intent_id,
        payment_status: paymentStatus,
        booking_status: bookingStatus,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        payment_method: paymentIntent.payment_method_types?.[0] || "unknown",
      },
    });
  } catch (error: any) {
    console.error("Error handling payment response:", error);
    return NextResponse.json(
      { 
        error: "Failed to handle payment response",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}