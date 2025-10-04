// DEPRECATED: Consolidated into unified-email-service.
// This module now forwards calls to unifiedEmailService to avoid breaking imports.

import { unifiedEmailService } from "@/lib/unified-email-service";

export interface UserData {
  name: string;
  email: string;
  userId?: string;
}

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
  specialRequests?: string;
  hostInstructions?: string;
}

class ProfessionalEmailService {
  private static instance: ProfessionalEmailService;
  private constructor() {}
  static getInstance(): ProfessionalEmailService {
    if (!ProfessionalEmailService.instance) {
      ProfessionalEmailService.instance = new ProfessionalEmailService();
    }
    return ProfessionalEmailService.instance;
  }

  async sendWelcomeEmail(user: UserData) {
    return unifiedEmailService.sendWelcomeEmail({ name: user.name, email: user.email, userId: user.userId });
  }

  async sendBookingConfirmation(data: BookingEmailData) {
    return unifiedEmailService.sendBookingConfirmation({
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
  }

  async sendBookingNotificationToHost(data: BookingEmailData) {
    return unifiedEmailService.sendHostNotification({
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
  }

  // Backward-compat alias
  async sendBookingConfirmationToGuest(data: BookingEmailData) {
    return this.sendBookingConfirmation(data);
  }

  // Backward-compat alias
  async sendHostNotification(data: BookingEmailData) {
    return this.sendBookingNotificationToHost(data);
  }
}

export default ProfessionalEmailService.getInstance();
export const professionalEmailService = ProfessionalEmailService.getInstance();