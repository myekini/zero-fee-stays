/**
 * Email Notification Service
 * Handles all email sending through Supabase Edge Function + Resend
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

interface EmailResponse {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Send email via Supabase Edge Function
 */
async function sendEmail(payload: EmailPayload): Promise<EmailResponse> {
  try {
    console.log(`📧 Sending ${payload.template} email to ${payload.to}`);

    const { data, error } = await supabase.functions.invoke(
      "send-email-notification",
      {
        body: payload,
      }
    );

    if (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    if (data?.success) {
      console.log(`✅ Email sent successfully: ${data.emailId}`);
      return {
        success: true,
        emailId: data.emailId,
      };
    }

    return {
      success: false,
      error: data?.error || "Unknown error occurred",
    };
  } catch (error: any) {
    console.error("Email service error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

/**
 * Track email analytics
 */
async function trackEmailAnalytics(
  emailType: string,
  recipientEmail: string,
  eventType: string,
  emailId?: string,
  metadata?: Record<string, any>
) {
  try {
    const { error } = await supabase.from("email_analytics").insert({
      event_type: eventType,
      email_id: emailId,
      recipient_email: recipientEmail,
      email_type: emailType,
      metadata: metadata || {},
    });

    if (error) {
      console.warn("Failed to track email analytics:", error);
    }
  } catch (error) {
    console.warn("Error tracking email analytics:", error);
  }
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
  const result = await sendEmail({
    to: data.guestEmail,
    subject: `Booking Confirmed - ${data.propertyTitle}`,
    template: "booking_confirmation_guest",
    data,
  });

  // Track analytics
  if (result.success) {
    await trackEmailAnalytics(
      "booking_confirmation_guest",
      data.guestEmail,
      "sent",
      result.emailId,
      { bookingId: data.bookingId }
    );
  }

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
  const result = await sendEmail({
    to: data.hostEmail,
    subject: `New Booking Request - ${data.propertyTitle}`,
    template: "new_booking_host",
    data,
  });

  // Track analytics
  if (result.success) {
    await trackEmailAnalytics(
      "new_booking_host",
      data.hostEmail,
      "sent",
      result.emailId,
      { bookingId: data.bookingId }
    );
  }

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
  const result = await sendEmail({
    to: data.guestEmail,
    subject: `Check-in Tomorrow - ${data.propertyTitle}`,
    template: "check_in_reminder",
    data,
  });

  // Track analytics
  if (result.success) {
    await trackEmailAnalytics(
      "check_in_reminder",
      data.guestEmail,
      "sent",
      result.emailId,
      { bookingId: data.bookingId }
    );
  }

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
  const result = await sendEmail({
    to: data.recipientEmail,
    subject: `New Message from ${data.senderName}`,
    template: "new_message_notification",
    data,
  });

  // Track analytics
  if (result.success) {
    await trackEmailAnalytics(
      "new_message_notification",
      data.recipientEmail,
      "sent",
      result.emailId
    );
  }

  return result;
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(data: {
  email: string;
  firstName: string;
  lastName?: string;
}): Promise<EmailResponse> {
  const result = await sendEmail({
    to: data.email,
    subject: "Welcome to HiddyStays! 🎉",
    template: "welcome",
    data: {
      name: `${data.firstName}${data.lastName ? " " + data.lastName : ""}`,
      email: data.email,
    },
  });

  // Track analytics
  if (result.success) {
    await trackEmailAnalytics(
      "welcome",
      data.email,
      "sent",
      result.emailId
    );
  }

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
  const result = await sendEmail({
    to: data.email,
    subject: "Reset Your HiddyStays Password 🔒",
    template: "password_reset",
    data,
  });

  // Track analytics
  if (result.success) {
    await trackEmailAnalytics(
      "password_reset",
      data.email,
      "sent",
      result.emailId
    );
  }

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
