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
          userId: data.userId,
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
