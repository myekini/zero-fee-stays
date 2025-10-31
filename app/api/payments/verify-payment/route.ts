import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/payments/verify-payment
 * Verifies payment status and returns booking details
 *
 * This is called after user returns from Stripe Checkout to confirm payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    console.log(`Verifying payment for session: ${sessionId}`);

    // Retrieve session from Stripe with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });

    const bookingId = session.metadata?.booking_id;

    if (!bookingId) {
      return NextResponse.json(
        {
          error: "Invalid session",
          message: "No booking ID found in session metadata",
        },
        { status: 400 }
      );
    }

    // Get booking details first
    const { data: booking, error: bookingFetchError } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        payment_status,
        check_in_date,
        check_out_date,
        guests_count,
        total_amount,
        guest_name,
        guest_email,
        property_id,
        host_id
      `)
      .eq("id", bookingId)
      .single();

    if (bookingFetchError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (session.payment_status === "paid") {
      // Only update if not already paid (prevent duplicate processing)
      if (booking.payment_status !== "paid") {
        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid",
            payment_intent_id: session.payment_intent as string,
            stripe_session_id: session.id,
            payment_method: session.payment_method_types?.[0] || "card",
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId);

        if (updateError) {
          console.error("Error updating booking status:", updateError);
        } else {
          console.log(`✅ Booking ${bookingId} marked as paid`);

          // Update payment transaction
          await supabase
            .from("payment_transactions")
            .update({
              status: "succeeded",
              stripe_payment_intent_id: session.payment_intent as string,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("booking_id", bookingId)
            .eq("stripe_session_id", session.id);
        }
      } else {
        console.log(`Booking ${bookingId} already marked as paid (idempotency)`);
      }

      // Fetch detailed booking info for response
      const { data: bookingDetails, error: fetchError } = await supabase
        .from("bookings")
        .select(`
          id,
          check_in_date,
          check_out_date,
          guests_count,
          total_amount,
          guest_name,
          guest_email,
          guest_phone,
          special_requests,
          property_id,
          host_id,
          properties!inner (
            title,
            address,
            city,
            state,
            host_id
          )
        `)
        .eq("id", bookingId)
        .single();

      if (!fetchError && bookingDetails) {
        const propertyInfo = Array.isArray(bookingDetails.properties)
          ? bookingDetails.properties[0]
          : bookingDetails.properties;

        // Fetch host details
        const { data: hostProfile } = await supabase
          .from("profiles")
          .select("first_name, last_name, user_id")
          .eq("id", bookingDetails.host_id)
          .single();

        const hostFullName = hostProfile
          ? `${hostProfile.first_name || ""} ${hostProfile.last_name || ""}`.trim()
          : "Host";

        // Get host email from auth.users
        let hostEmail = "";
        if (hostProfile?.user_id) {
          const { data: authUser } = await supabase.auth.admin.getUserById(hostProfile.user_id);
          hostEmail = authUser?.user?.email || "";
        }

        // Send confirmation email notifications asynchronously
        try {
          const appUrl = process.env.APP_URL || "http://localhost:3000";

          // Only send notifications if this is the first time marking as paid
          if (booking.payment_status !== "paid") {
            // Send email to guest
            const { unifiedEmailService } = await import("@/lib/unified-email-service");
            await unifiedEmailService.sendBookingConfirmation({
              bookingId: bookingDetails.id,
              guestName: bookingDetails.guest_name,
              guestEmail: bookingDetails.guest_email,
              hostName: hostFullName,
              hostEmail: hostEmail,
              propertyTitle: propertyInfo?.title || "Property",
              propertyLocation: propertyInfo?.address || "",
              checkInDate: bookingDetails.check_in_date,
              checkOutDate: bookingDetails.check_out_date,
              guests: bookingDetails.guests_count,
              totalAmount: bookingDetails.total_amount,
            });

            // Send email to host
            if (hostEmail) {
              await unifiedEmailService.sendHostNotification({
                bookingId: bookingDetails.id,
                guestName: bookingDetails.guest_name,
                guestEmail: bookingDetails.guest_email,
                hostName: hostFullName,
                hostEmail: hostEmail,
                propertyTitle: propertyInfo?.title || "Property",
                propertyLocation: propertyInfo?.address || "",
                checkInDate: bookingDetails.check_in_date,
                checkOutDate: bookingDetails.check_out_date,
                guests: bookingDetails.guests_count,
                totalAmount: bookingDetails.total_amount,
                specialRequests: bookingDetails.special_requests || "",
              });
            }

            // Create notification
            await supabase.from("notifications").insert({
              user_id: bookingDetails.host_id,
              type: "booking_confirmed",
              title: "Booking Confirmed! 💳",
              message: `Payment received for ${propertyInfo?.title}`,
              data: {
                booking_id: bookingDetails.id,
                property_id: bookingDetails.property_id,
                property_title: propertyInfo?.title,
                guest_name: bookingDetails.guest_name,
                check_in_date: bookingDetails.check_in_date,
                check_out_date: bookingDetails.check_out_date,
                total_amount: bookingDetails.total_amount,
              },
              is_read: false,
              created_at: new Date().toISOString(),
            });

            console.log("✅ Email notifications sent successfully");
          }
        } catch (emailError) {
          console.error("❌ Failed to send email notifications:", emailError);
          // Don't fail the payment verification if email fails
        }

        return NextResponse.json({
          success: true,
          sessionId: session.id,
          paymentStatus: session.payment_status,
          booking: {
            id: bookingDetails.id,
            checkInDate: bookingDetails.check_in_date,
            checkOutDate: bookingDetails.check_out_date,
            guestsCount: bookingDetails.guests_count,
            totalAmount: bookingDetails.total_amount,
            propertyTitle: propertyInfo?.title || "Property",
            guestName: bookingDetails.guest_name,
            guestEmail: bookingDetails.guest_email,
          },
        });
      }
    }

    // Payment not yet completed
    return NextResponse.json({
      success: false,
      sessionId: session.id,
      paymentStatus: session.payment_status,
      message: "Payment not completed",
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);

    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: "Invalid session ID", message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify payment", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}