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
      account_holder_name,
      account_number,
      routing_number,
      account_type, // "checking" or "savings"
      metadata = {},
    } = body;

    if (!booking_id || !amount || !account_holder_name || !account_number || !routing_number || !account_type) {
      return NextResponse.json(
        { error: "Missing required bank account information" },
        { status: 400 }
      );
    }

    console.log(`Processing bank payment for booking ${booking_id}`);

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

    // Create a bank account token
    const bankAccountToken = await stripe.tokens.create({
      bank_account: {
        country: "US", // Currently only US bank accounts are supported
        currency: currency.toLowerCase(),
        account_holder_name,
        account_holder_type: "individual",
        routing_number,
        account_number,
        account_type: account_type.toLowerCase(),
      },
    });

    // Create a customer with the bank account
    const customer = await stripe.customers.create({
      email: booking.guest_email || "guest@example.com",
      name: account_holder_name,
      source: bankAccountToken.id,
    });

    // Create a payment method using the bank account
    const paymentMethod = await stripe.paymentMethods.create({
      type: "us_bank_account",
      us_bank_account: {
        account_holder_type: "individual",
        account_type: account_type.toLowerCase(),
        routing_number,
        account_number,
      },
      billing_details: {
        name: account_holder_name,
        email: booking.guest_email || "guest@example.com",
      },
    });

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });

    // Create a payment intent with ACH payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customer.id,
      payment_method: paymentMethod.id,
      payment_method_types: ["us_bank_account"],
      metadata: {
        booking_id,
        payment_type: "bank_account",
        ...metadata,
      },
      confirm: true,
      return_url: `${process.env.APP_URL || "http://localhost:3000"}/booking-success`,
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
      message: "Bank payment processing initiated",
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        requires_action: paymentIntent.status === "requires_action",
        next_action: paymentIntent.next_action,
      },
    });
  } catch (error: any) {
    console.error("Error processing bank payment:", error);
    return NextResponse.json(
      { 
        error: "Failed to process bank payment",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}