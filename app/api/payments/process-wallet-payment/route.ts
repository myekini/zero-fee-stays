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
    const {
      booking_id,
      amount,
      currency = "cad",
      wallet_type, // "apple_pay", "google_pay", "paypal"
      return_url,
      metadata = {},
    } = body;

    if (!booking_id || !amount || !wallet_type) {
      return NextResponse.json(
        { error: "Booking ID, amount, and wallet type are required" },
        { status: 400 }
      );
    }

    console.log(`Processing ${wallet_type} payment for booking ${booking_id}`);

    // Validate the booking exists
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Create a payment intent with the appropriate payment method
    let paymentMethodTypes: string[] = [];
    
    switch (wallet_type) {
      case "apple_pay":
        paymentMethodTypes = ["apple_pay"];
        break;
      case "google_pay":
        paymentMethodTypes = ["google_pay"];
        break;
      case "paypal":
        paymentMethodTypes = ["paypal"];
        break;
      default:
        return NextResponse.json(
          { error: "Invalid wallet type" },
          { status: 400 }
        );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method_types: paymentMethodTypes,
      metadata: {
        booking_id,
        wallet_type,
        ...metadata,
      },
      return_url: return_url || `${process.env.APP_URL || "http://localhost:3000"}/booking-success`,
    });

    // Update booking with payment intent ID
    await supabase
      .from("bookings")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    return NextResponse.json({
      success: true,
      message: `${wallet_type} payment intent created successfully`,
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    });
  } catch (error: any) {
    console.error(`Error processing wallet payment:`, error);
    return NextResponse.json(
      { 
        error: "Failed to process wallet payment",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}