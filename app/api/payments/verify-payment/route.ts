import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

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

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Update booking status to confirmed
      const bookingId = session.metadata?.booking_id;
      if (bookingId) {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq("id", bookingId);

        if (updateError) {
          console.error("Error updating booking status:", updateError);
        }

        // Fetch booking details with property and host info
        const { data: booking, error: fetchError } = await supabase
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

        if (!fetchError && booking) {
          const propertyInfo = Array.isArray(booking.properties)
            ? booking.properties[0]
            : booking.properties;

          // Fetch host details
          const { data: hostProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", booking.host_id)
            .single();

          // Send confirmation email notifications asynchronously
          try {
            const appUrl = process.env.APP_URL || "http://localhost:3000";

            // Send email to guest
            await supabase.functions.invoke("send-email-notification", {
              body: {
                to: booking.guest_email,
                template: "booking_confirmation_guest",
                data: {
                  propertyTitle: propertyInfo?.title || "Property",
                  guestName: booking.guest_name,
                  checkInDate: booking.check_in_date,
                  checkOutDate: booking.check_out_date,
                  guestsCount: booking.guests_count,
                  totalAmount: booking.total_amount,
                  propertyUrl: `${appUrl}/bookings/${booking.id}`,
                },
              },
            });

            // Send email to host
            if (hostProfile?.email) {
              await supabase.functions.invoke("send-email-notification", {
                body: {
                  to: hostProfile.email,
                  template: "new_booking_host",
                  data: {
                    propertyTitle: propertyInfo?.title || "Property",
                    hostName: hostProfile.full_name || "Host",
                    guestName: booking.guest_name,
                    guestEmail: booking.guest_email,
                    guestPhone: booking.guest_phone || "Not provided",
                    checkInDate: booking.check_in_date,
                    checkOutDate: booking.check_out_date,
                    guestsCount: booking.guests_count,
                    totalAmount: booking.total_amount,
                    specialRequests: booking.special_requests || "",
                    dashboardUrl: `${appUrl}/host-dashboard`,
                  },
                },
              });
            }

            // Create notification for confirmed booking
            await supabase.from("notifications").insert({
              user_id: booking.host_id,
              type: "booking_confirmed",
              title: "Booking Confirmed! 💳",
              message: `Payment received for ${propertyInfo?.title}`,
              data: {
                booking_id: booking.id,
                property_id: booking.property_id,
                property_title: propertyInfo?.title,
                guest_name: booking.guest_name,
                check_in_date: booking.check_in_date,
                check_out_date: booking.check_out_date,
                total_amount: booking.total_amount,
              },
              is_read: false,
              created_at: new Date().toISOString(),
            });

            console.log("✅ Email notifications sent successfully");
          } catch (emailError) {
            console.error("❌ Failed to send email notifications:", emailError);
            // Don't fail the payment verification if email fails
          }

          return NextResponse.json({
            sessionId: session.id,
            paymentStatus: session.payment_status,
            checkInDate: booking.check_in_date,
            checkOutDate: booking.check_out_date,
            guestsCount: booking.guests_count,
            totalAmount: booking.total_amount,
            propertyTitle: propertyInfo?.title || "Property",
            guestName: booking.guest_name,
            guestEmail: booking.guest_email,
          });
        }
      }
    }

    return NextResponse.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      customerEmail: session.customer_email,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
