// @ts-nocheck
// DEPRECATED: Consolidated into unified-email-service.
// Keep a thin wrapper for backward compatibility.

import { unifiedEmailService } from "@/lib/unified-email-service";

export interface BookingEmailData {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  hostName: string;
  hostEmail: string;
  propertyTitle: string;
  propertyLocation: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalAmount: number;
  bookingStatus: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  cancellationPolicy?: string;
  checkInTime?: string;
  checkOutTime?: string;
  propertyAddress?: string;
  hostPhone?: string;
  hostInstructions?: string;
}

class EmailNotificationService {
  async sendBookingConfirmationToGuest(data: BookingEmailData): Promise<boolean> {
    const res = await unifiedEmailService.sendBookingConfirmation({
      bookingId: data.bookingId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      hostName: data.hostName,
      hostEmail: data.hostEmail,
      propertyTitle: data.propertyTitle,
      propertyLocation: data.propertyLocation,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guests: data.guestsCount,
      totalAmount: data.totalAmount,
      specialRequests: data.specialRequests,
      hostInstructions: data.hostInstructions,
    });
    return res.success;
  }

  async sendBookingNotificationToHost(data: BookingEmailData): Promise<boolean> {
    const res = await unifiedEmailService.sendHostNotification({
      bookingId: data.bookingId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      hostName: data.hostName,
      hostEmail: data.hostEmail,
      propertyTitle: data.propertyTitle,
      propertyLocation: data.propertyLocation,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guests: data.guestsCount,
      totalAmount: data.totalAmount,
      specialRequests: data.specialRequests,
    });
    return res.success;
  }
}

export const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;
