import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔔 Stripe webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify the webhook signature
    let event: WebhookEvent;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log(`📋 Processing webhook event: ${event.type}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object, supabase);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object, supabase);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object, supabase);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object, supabase);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object, supabase);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object, supabase);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log("✅ Webhook processed successfully");
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutSessionCompleted(session: any, supabase: any) {
  console.log("💳 Processing checkout session completed");

  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    console.error("No booking ID found in session metadata");
    return;
  }

  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Booking not found:", bookingId);
      return;
    }

    // Update booking status to confirmed
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        stripe_payment_intent_id: session.payment_intent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return;
    }

    console.log("✅ Booking confirmed:", bookingId);

    // Send confirmation emails
    await sendBookingConfirmationEmails(booking, supabase);
  } catch (error) {
    console.error("Error processing checkout session:", error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any, supabase: any) {
  console.log("💳 Processing payment intent succeeded");

  try {
    // Find booking by payment intent ID
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .single();

    if (bookingError || !booking) {
      console.log("No booking found for payment intent:", paymentIntent.id);
      return;
    }

    // Update booking status if not already confirmed
    if (booking.status !== "confirmed") {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (updateError) {
        console.error("Error updating booking:", updateError);
        return;
      }

      console.log("✅ Booking confirmed via payment intent:", booking.id);

      // Send confirmation emails
      await sendBookingConfirmationEmails(booking, supabase);
    }
  } catch (error) {
    console.error("Error processing payment intent:", error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: any, supabase: any) {
  console.log("❌ Processing payment intent failed");

  try {
    // Find booking by payment intent ID
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .single();

    if (bookingError || !booking) {
      console.log("No booking found for payment intent:", paymentIntent.id);
      return;
    }

    // Update booking status to failed
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return;
    }

    console.log("❌ Booking cancelled due to payment failure:", booking.id);

    // Send cancellation emails
    await sendCancellationEmails(booking, "payment_failed", supabase);
  } catch (error) {
    console.error("Error processing payment failure:", error);
  }
}

async function handleChargeRefunded(charge: any, supabase: any) {
  console.log("💰 Processing charge refunded");

  try {
    // Find booking by payment intent ID
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("stripe_payment_intent_id", charge.payment_intent)
      .single();

    if (bookingError || !booking) {
      console.log(
        "No booking found for refunded charge:",
        charge.payment_intent
      );
      return;
    }

    // Update booking status to cancelled
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return;
    }

    console.log("💰 Booking cancelled due to refund:", booking.id);

    // Send cancellation emails
    await sendCancellationEmails(booking, "refunded", supabase);
  } catch (error) {
    console.error("Error processing refund:", error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any, supabase: any) {
  console.log("📄 Processing invoice payment succeeded");
  // Handle subscription payments if needed
}

async function handleInvoicePaymentFailed(invoice: any, supabase: any) {
  console.log("❌ Processing invoice payment failed");
  // Handle subscription payment failures if needed
}

async function sendBookingConfirmationEmails(booking: any, supabase: any) {
  try {
    // Get guest and host details
    const { data: guest } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", booking.guest_id)
      .single();

    const { data: host } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", booking.host_id)
      .single();

    const { data: property } = await supabase
      .from("properties")
      .select("*")
      .eq("id", booking.property_id)
      .single();

    if (!guest || !host || !property) {
      console.error("Missing guest, host, or property data for emails");
      return;
    }

    // Send email to guest via Next API
    const appUrl = Deno.env.get("APP_URL") || "http://localhost:3000";
    await fetch(`${appUrl}/api/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "booking_confirmation",
        data: {
          bookingId: booking.id,
          guestName: `${guest.first_name} ${guest.last_name}`,
          guestEmail: guest.email,
          hostName: `${host.first_name} ${host.last_name}`,
          hostEmail: host.email,
          propertyTitle: property.title,
          propertyLocation: property.location,
          checkInDate: booking.check_in_date,
          checkOutDate: booking.check_out_date,
          guests: booking.guests_count,
          totalAmount: booking.total_amount,
        },
      }),
    });

    // Send email to host via Next API
    await fetch(`${appUrl}/api/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "host_notification",
        data: {
          bookingId: booking.id,
          guestName: `${guest.first_name} ${guest.last_name}`,
          guestEmail: guest.email,
          hostName: `${host.first_name} ${host.last_name}`,
          hostEmail: host.email,
          propertyTitle: property.title,
          propertyLocation: property.location,
          checkInDate: booking.check_in_date,
          CheckOutDate: booking.check_out_date,
          guests: booking.guests_count,
          totalAmount: booking.total_amount,
          specialRequests: booking.special_requests,
        },
      }),
    });

    console.log("📧 Confirmation emails sent for booking:", booking.id);
  } catch (error) {
    console.error("Error sending confirmation emails:", error);
  }
}

async function sendCancellationEmails(
  booking: any,
  reason: string,
  supabase: any
) {
  try {
    // Get guest and host details
    const { data: guest } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", booking.guest_id)
      .single();

    const { data: host } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", booking.host_id)
      .single();

    const { data: property } = await supabase
      .from("properties")
      .select("*")
      .eq("id", booking.property_id)
      .single();

    if (!guest || !host || !property) {
      console.error(
        "Missing guest, host, or property data for cancellation emails"
      );
      return;
    }

    // Send cancellation email to guest via Next API
    const appUrl = Deno.env.get("APP_URL") || "http://localhost:3000";
    await fetch(`${appUrl}/api/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "booking_cancellation",
        data: {
          bookingId: booking.id,
          guestName: `${guest.first_name} ${guest.last_name}`,
          guestEmail: guest.email,
          hostName: `${host.first_name} ${host.last_name}`,
          hostEmail: host.email,
          propertyTitle: property.title,
          checkInDate: booking.check_in_date,
          checkOutDate: booking.check_out_date,
          guests: booking.guests_count,
          totalAmount: booking.total_amount,
          cancellationReason: reason,
        },
      }),
    });

    // Send cancellation email to host via Next API
    await fetch(`${appUrl}/api/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "host_notification",
        data: {
          bookingId: booking.id,
          guestName: `${guest.first_name} ${guest.last_name}`,
          guestEmail: guest.email,
          hostName: `${host.first_name} ${host.last_name}`,
          hostEmail: host.email,
          propertyTitle: property.title,
          propertyLocation: property.location,
          checkInDate: booking.check_in_date,
          checkOutDate: booking.check_out_date,
          guests: booking.guests_count,
          totalAmount: booking.total_amount,
          specialRequests: `Cancellation reason: ${reason}`,
        },
      }),
    });

    console.log("📧 Cancellation emails sent for booking:", booking.id);
  } catch (error) {
    console.error("Error sending cancellation emails:", error);
  }
}
