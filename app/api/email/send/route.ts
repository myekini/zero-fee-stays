import { NextRequest, NextResponse } from "next/server";
import { unifiedEmailService } from "@/lib/unified-email-service";

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: "Type and data are required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "welcome":
        result = await unifiedEmailService.sendWelcomeEmail({
          name: data.name,
          email: data.email,
          role: data.role,
        });
        break;

      case "booking_confirmation":
        result = await unifiedEmailService.sendBookingConfirmation({
          bookingId: data.bookingId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          hostName: data.hostName,
          hostEmail: data.hostEmail,
          propertyTitle: data.propertyTitle,
          propertyLocation: data.propertyLocation,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          guests: data.guests,
          totalAmount: data.totalAmount,
          specialRequests: data.specialRequests,
          hostInstructions: data.hostInstructions,
        });
        break;

      case "host_notification":
        result = await unifiedEmailService.sendHostNotification({
          bookingId: data.bookingId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          hostName: data.hostName,
          hostEmail: data.hostEmail,
          propertyTitle: data.propertyTitle,
          propertyLocation: data.propertyLocation,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          guests: data.guests,
          totalAmount: data.totalAmount,
          specialRequests: data.specialRequests,
          hostInstructions: data.hostInstructions,
        });
        break;

      case "booking_emails":
        result = await unifiedEmailService.sendBookingEmails({
          bookingId: data.bookingId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          hostName: data.hostName,
          hostEmail: data.hostEmail,
          propertyTitle: data.propertyTitle,
          propertyLocation: data.propertyLocation,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          guests: data.guests,
          totalAmount: data.totalAmount,
          specialRequests: data.specialRequests,
          hostInstructions: data.hostInstructions,
        });
        break;

      case "password_reset":
        result = await unifiedEmailService.sendPasswordReset(
          data.email,
          data.name,
          data.resetUrl
        );
        break;

      case "check_in_reminder":
        result = await unifiedEmailService.sendCheckInReminder({
          bookingId: data.bookingId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          propertyName: data.propertyTitle,
          checkInDate: data.checkInDate,
          checkInTime: data.checkInTime,
          propertyAddress: data.propertyAddress,
          hostName: data.hostName,
          hostPhone: data.hostPhone,
          wifiNetwork: data.wifiNetwork,
          wifiPassword: data.wifiPassword,
          parkingInstructions: data.parkingInstructions,
          entryInstructions: data.hostInstructions,
        });
        break;

      case "booking_cancellation":
        result = await unifiedEmailService.sendBookingCancellation({
          bookingId: data.bookingId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          hostName: data.hostName,
          hostEmail: data.hostEmail,
          propertyTitle: data.propertyTitle,
          propertyLocation: data.propertyLocation,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          guests: data.guests,
          totalAmount: data.totalAmount,
          refundAmount: data.refundAmount,
          refundPercentage: data.refundPercentage,
          cancellationReason: data.cancellationReason,
        });
        break;

      case "payment_receipt":
        result = await unifiedEmailService.sendPaymentReceipt({
          bookingId: data.bookingId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          propertyName: data.propertyTitle,
          transactionId: data.transactionId || data.bookingId,
          paymentDate: data.paymentDate,
          paymentTime: data.paymentTime || new Date().toLocaleTimeString(),
          paymentMethod: data.paymentMethod || 'Credit Card',
          accommodationAmount: data.accommodationAmount || data.totalAmount,
          cleaningFee: data.cleaningFee,
          serviceFee: data.serviceFee || 0,
          paymentProcessingFee: data.paymentProcessingFee || 0,
          totalAmount: data.totalAmount,
          receiptUrl: data.receiptUrl,
        });
        break;

      case "post_stay_followup":
        result = await unifiedEmailService.sendPostStayFollowup({
          bookingId: data.bookingId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          hostName: data.hostName,
          hostEmail: data.hostEmail,
          propertyTitle: data.propertyTitle,
          propertyLocation: data.propertyLocation,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          guests: data.guests,
          totalAmount: data.totalAmount,
          specialRequests: data.specialRequests,
          hostInstructions: data.hostInstructions,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
