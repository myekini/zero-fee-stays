import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      amount,
      currency = "cad",
      success_url,
      cancel_url,
    } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "Booking ID and amount are required" },
        { status: 400 }
      );
    }

    console.log(`Creating checkout session for booking ${bookingId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Booking ${bookingId}`,
              description: "Property rental booking",
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url:
        success_url ||
        `${process.env.APP_URL || "http://localhost:3000"}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancel_url ||
        `${process.env.APP_URL || "http://localhost:3000"}/booking-cancel`,
      metadata: {
        booking_id: bookingId,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

