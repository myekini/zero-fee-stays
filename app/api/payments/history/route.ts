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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("booking_id");
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    console.log(`Fetching payment history:`, { bookingId, userId, limit });

    // Build query
    let query = supabase
      .from("bookings")
      .select(`
        id,
        property_id,
        guest_id,
        host_id,
        check_in_date,
        check_out_date,
        guests_count,
        total_amount,
        status,
        stripe_payment_intent_id,
        guest_name,
        guest_email,
        created_at,
        updated_at,
        properties!inner (
          title,
          address,
          city
        )
      `)
      .not("stripe_payment_intent_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Filter by booking ID if provided
    if (bookingId) {
      query = query.eq("id", bookingId);
    }

    // Filter by user ID if provided (either as guest or host)
    if (userId) {
      query = query.or(`guest_id.eq.${userId},host_id.eq.${userId}`);
    }

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      throw bookingsError;
    }

    // Fetch Stripe payment details for each booking
    const paymentsWithDetails = await Promise.all(
      (bookings || []).map(async (booking) => {
        let stripeDetails = null;

        if (booking.stripe_payment_intent_id) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              booking.stripe_payment_intent_id
            );

            stripeDetails = {
              id: paymentIntent.id,
              amount: paymentIntent.amount / 100, // Convert from cents
              currency: paymentIntent.currency.toUpperCase(),
              status: paymentIntent.status,
              payment_method: paymentIntent.payment_method,
              created: new Date(paymentIntent.created * 1000).toISOString(),
              receipt_url: null, // Receipt URL requires fetching charge separately
            };
          } catch (stripeError) {
            console.error(
              `Failed to fetch Stripe details for ${booking.stripe_payment_intent_id}:`,
              stripeError
            );
          }
        }

        const propertyInfo = Array.isArray(booking.properties)
          ? booking.properties[0]
          : booking.properties;

        return {
          booking_id: booking.id,
          property_id: booking.property_id,
          property_title: propertyInfo?.title || "Unknown Property",
          property_location: `${propertyInfo?.city || ""}, ${propertyInfo?.address || ""}`.trim(),
          guest_name: booking.guest_name,
          guest_email: booking.guest_email,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          guests_count: booking.guests_count,
          total_amount: booking.total_amount,
          booking_status: booking.status,
          booking_created_at: booking.created_at,
          payment_details: stripeDetails,
        };
      })
    );

    return NextResponse.json({
      success: true,
      payments: paymentsWithDetails,
      count: paymentsWithDetails.length,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment history" },
      { status: 500 }
    );
  }
}
