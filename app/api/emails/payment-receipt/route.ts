import { NextRequest, NextResponse } from "next/server";
import { unifiedEmailService } from "@/lib/unified-email-service";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, paymentIntentId, totalAmount } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        properties!bookings_property_id_fkey(
          id,
          title,
          address,
          location
        ),
        guest:profiles!bookings_guest_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Prepare payment receipt data
    const receiptData = {
      guestName:
        `${booking.guest?.first_name || ""} ${booking.guest?.last_name || ""}`.trim(),
      guestEmail: booking.guest?.email || "",
      propertyName: booking.properties?.title || "",
      transactionId: paymentIntentId || `txn_${booking.id.slice(0, 8)}`,
      paymentDate: new Date().toLocaleDateString(),
      paymentTime: new Date().toLocaleTimeString(),
      paymentMethod: "**** **** **** 4242", // This would come from Stripe
      accommodationAmount: totalAmount || booking.total_amount,
      cleaningFee: 0, // This would be calculated based on property settings
      serviceFee: 0, // Zero platform fee
      paymentProcessingFee: Math.round(
        (totalAmount || booking.total_amount) * 0.029 + 30
      ), // Stripe fee
      totalAmount: totalAmount || booking.total_amount,
      bookingId: booking.id,
      receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}/receipt`,
    };

    // Send payment receipt email
    const result = await unifiedEmailService.sendPaymentReceipt(receiptData);

    if (!result.success) {
      console.error("Failed to send payment receipt:", result.error);
      return NextResponse.json(
        { error: "Failed to send payment receipt" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment receipt sent successfully",
      emailId: result.emailId,
    });
  } catch (error) {
    console.error("Error sending payment receipt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

