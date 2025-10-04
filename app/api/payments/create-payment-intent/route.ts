import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, amount, currency = "cad", metadata = {} } = body;

    if (!booking_id || !amount) {
      return NextResponse.json(
        { error: "Booking ID and amount are required" },
        { status: 400 }
      );
    }

    console.log(`Creating payment intent for booking ${booking_id}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        booking_id,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment intent created successfully",
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

