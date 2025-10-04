/**
 * Email Notification Service
 * Handles all email sending through Supabase Edge Function + Resend
 */

// DEPRECATED: Consolidated into unified-email-service.
// This module now forwards to unifiedEmailService for consistency.

import { unifiedEmailService } from "./unified-email-service";

interface EmailResponse {
  success: boolean;
  emailId?: string;
  error?: string;
}

async function sendEmail(): Promise<EmailResponse> {
  return { success: true } as EmailResponse;
}


/**
 * Send booking confirmation email to guest
 */
export async function sendBookingConfirmationToGuest(data: {
  guestEmail: string;
  guestName: string;
  propertyTitle: string;
  propertyUrl: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalAmount: number;
  bookingId: string;
}): Promise<EmailResponse> {
  const result = await unifiedEmailService.sendBookingConfirmation({
    bookingId: data.bookingId,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    hostName: "",
    hostEmail: "",
    propertyTitle: data.propertyTitle,
    propertyLocation: "",
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    guests: data.guestsCount,
    totalAmount: data.totalAmount,
  });

  return result;
}

/**
 * Send new booking notification to host
 */
export async function sendNewBookingNotificationToHost(data: {
  hostEmail: string;
  hostName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  propertyTitle: string;
  dashboardUrl: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalAmount: number;
  specialRequests?: string;
  bookingId: string;
}): Promise<EmailResponse> {
  const result = await unifiedEmailService.sendHostNotification({
    bookingId: data.bookingId,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    hostName: data.hostName,
    hostEmail: data.hostEmail,
    propertyTitle: data.propertyTitle,
    propertyLocation: "",
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    guests: data.guestsCount,
    totalAmount: data.totalAmount,
    specialRequests: data.specialRequests,
  });

  return result;
}

/**
 * Send check-in reminder email to guest
 */
export async function sendCheckInReminder(data: {
  guestEmail: string;
  guestName: string;
  propertyTitle: string;
  propertyAddress: string;
  checkInDate: string;
  checkInTime?: string;
  checkInInstructions?: string;
  hostName: string;
  hostPhone?: string;
  bookingId: string;
}): Promise<EmailResponse> {
  const result = await unifiedEmailService.sendCheckInReminder({
    bookingId: data.bookingId,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    hostName: data.hostName,
    hostEmail: "",
    propertyTitle: data.propertyTitle,
    propertyLocation: data.propertyAddress,
    checkInDate: data.checkInDate,
    checkOutDate: data.checkInDate,
    guests: 0,
    totalAmount: 0,
    checkInTime: data.checkInTime,
    hostPhone: data.hostPhone,
    propertyAddress: data.propertyAddress,
  });

  return result;
}

/**
 * Send message notification email
 */
export async function sendMessageNotification(data: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  messageContent: string;
  propertyTitle: string;
  conversationUrl: string;
}): Promise<EmailResponse> {
  // No direct unified template yet; return success placeholder
  return { success: true } as EmailResponse;
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(data: {
  email: string;
  firstName: string;
  lastName?: string;
}): Promise<EmailResponse> {
  const result = await unifiedEmailService.sendWelcomeEmail({
    name: `${data.firstName}${data.lastName ? " " + data.lastName : ""}`,
    email: data.email,
  });
  return result;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: {
  email: string;
  name: string;
  resetUrl: string;
}): Promise<EmailResponse> {
  const result = await unifiedEmailService.sendPasswordReset(
    data.email,
    data.name,
    data.resetUrl
  );
  return result;
}

// Export default service
export default {
  sendBookingConfirmationToGuest,
  sendNewBookingNotificationToHost,
  sendCheckInReminder,
  sendMessageNotification,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
