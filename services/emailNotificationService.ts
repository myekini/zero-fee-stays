import { supabase } from "@/integrations/supabase/client";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
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
  private async sendEmail(
    to: string,
    template: EmailTemplate
  ): Promise<boolean> {
    try {
      // Use Supabase Edge Function to send email
      const response = await fetch("/api/send-email-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  }

  // Booking Confirmation Email to Guest
  async sendBookingConfirmationToGuest(
    data: BookingEmailData
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `Booking Confirmed: ${data.propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your stay at ${data.propertyTitle} has been confirmed</p>
            </div>
            
            <div class="content">
              <h2>Hello ${data.guestName},</h2>
              <p>Great news! Your booking has been confirmed. Here are the details:</p>
              
              <div class="booking-details">
                <h3>📅 Booking Details</h3>
                <p><strong>Property:</strong> ${data.propertyTitle}</p>
                <p><strong>Location:</strong> ${data.propertyLocation}</p>
                <p><strong>Check-in:</strong> ${this.formatDate(data.checkInDate)} at ${data.checkInTime || "3:00 PM"}</p>
                <p><strong>Check-out:</strong> ${this.formatDate(data.checkOutDate)} at ${data.checkOutTime || "11:00 AM"}</p>
                <p><strong>Guests:</strong> ${data.guestsCount}</p>
                <p><strong>Total Amount:</strong> ${this.formatCurrency(data.totalAmount)}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              </div>

              ${
                data.propertyAddress
                  ? `
              <div class="booking-details">
                <h3>📍 Property Address</h3>
                <p>${data.propertyAddress}</p>
              </div>
              `
                  : ""
              }

              ${
                data.hostInstructions
                  ? `
              <div class="booking-details">
                <h3>📋 Host Instructions</h3>
                <p>${data.hostInstructions}</p>
              </div>
              `
                  : ""
              }

              ${
                data.cancellationPolicy
                  ? `
              <div class="booking-details">
                <h3>📋 Cancellation Policy</h3>
                <p>${data.cancellationPolicy}</p>
              </div>
              `
                  : ""
              }

              <div style="text-align: center; margin: 30px 0;">
                <a href="/bookings" class="button">View My Bookings</a>
              </div>

              <p>If you have any questions, please don't hesitate to contact your host or our support team.</p>
              
              <p>Enjoy your stay!</p>
              <p>The Zero Fee Stays Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${data.guestEmail}</p>
              <p>© 2024 Zero Fee Stays. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Booking Confirmed: ${data.propertyTitle}

Hello ${data.guestName},

Great news! Your booking has been confirmed. Here are the details:

BOOKING DETAILS:
Property: ${data.propertyTitle}
Location: ${data.propertyLocation}
Check-in: ${this.formatDate(data.checkInDate)} at ${data.checkInTime || "3:00 PM"}
Check-out: ${this.formatDate(data.checkOutDate)} at ${data.checkOutTime || "11:00 AM"}
Guests: ${data.guestsCount}
Total Amount: ${this.formatCurrency(data.totalAmount)}
Booking ID: ${data.bookingId}

${data.propertyAddress ? `PROPERTY ADDRESS: ${data.propertyAddress}` : ""}

${data.hostInstructions ? `HOST INSTRUCTIONS: ${data.hostInstructions}` : ""}

${data.cancellationPolicy ? `CANCELLATION POLICY: ${data.cancellationPolicy}` : ""}

View your bookings: /bookings

If you have any questions, please don't hesitate to contact your host or our support team.

Enjoy your stay!
The Zero Fee Stays Team
      `,
    };

    return this.sendEmail(data.guestEmail, template);
  }

  // Booking Notification Email to Host
  async sendBookingNotificationToHost(
    data: BookingEmailData
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `New Booking: ${data.propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 New Booking Received!</h1>
              <p>You have a new booking for ${data.propertyTitle}</p>
            </div>
            
            <div class="content">
              <h2>Hello ${data.hostName},</h2>
              <p>Congratulations! You have received a new booking. Here are the details:</p>
              
              <div class="booking-details">
                <h3>📅 Booking Details</h3>
                <p><strong>Property:</strong> ${data.propertyTitle}</p>
                <p><strong>Guest:</strong> ${data.guestName}</p>
                <p><strong>Guest Email:</strong> ${data.guestEmail}</p>
                <p><strong>Check-in:</strong> ${this.formatDate(data.checkInDate)} at ${data.checkInTime || "3:00 PM"}</p>
                <p><strong>Check-out:</strong> ${this.formatDate(data.checkOutDate)} at ${data.checkOutTime || "11:00 AM"}</p>
                <p><strong>Guests:</strong> ${data.guestsCount}</p>
                <p><strong>Total Amount:</strong> ${this.formatCurrency(data.totalAmount)}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                ${data.specialRequests ? `<p><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ""}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="/host/dashboard" class="button">View Dashboard</a>
              </div>

              <p>Please review the booking details and prepare for your guest's arrival. You can contact the guest directly if needed.</p>
              
              <p>Thank you for hosting with Zero Fee Stays!</p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${data.hostEmail}</p>
              <p>© 2024 Zero Fee Stays. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Booking: ${data.propertyTitle}

Hello ${data.hostName},

Congratulations! You have received a new booking. Here are the details:

BOOKING DETAILS:
Property: ${data.propertyTitle}
Guest: ${data.guestName}
Guest Email: ${data.guestEmail}
Check-in: ${this.formatDate(data.checkInDate)} at ${data.checkInTime || "3:00 PM"}
Check-out: ${this.formatDate(data.checkOutDate)} at ${data.checkOutTime || "11:00 AM"}
Guests: ${data.guestsCount}
Total Amount: ${this.formatCurrency(data.totalAmount)}
Booking ID: ${data.bookingId}
${data.specialRequests ? `Special Requests: ${data.specialRequests}` : ""}

View your dashboard: /host/dashboard

Please review the booking details and prepare for your guest's arrival. You can contact the guest directly if needed.

Thank you for hosting with Zero Fee Stays!
      `,
    };

    return this.sendEmail(data.hostEmail, template);
  }

  // Check-in Reminder Email to Guest
  async sendCheckInReminderToGuest(data: BookingEmailData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `Check-in Tomorrow: ${data.propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Check-in Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .reminder { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Check-in Tomorrow!</h1>
              <p>Your stay at ${data.propertyTitle} starts tomorrow</p>
            </div>
            
            <div class="content">
              <h2>Hello ${data.guestName},</h2>
              <p>Just a friendly reminder that your check-in is tomorrow!</p>
              
              <div class="reminder">
                <h3>📅 Check-in Details</h3>
                <p><strong>Date:</strong> ${this.formatDate(data.checkInDate)}</p>
                <p><strong>Time:</strong> ${data.checkInTime || "3:00 PM"}</p>
                <p><strong>Property:</strong> ${data.propertyTitle}</p>
                <p><strong>Location:</strong> ${data.propertyLocation}</p>
                ${data.propertyAddress ? `<p><strong>Address:</strong> ${data.propertyAddress}</p>` : ""}
              </div>

              <p>Make sure to:</p>
              <ul>
                <li>Pack all your essentials</li>
                <li>Have your booking confirmation ready</li>
                <li>Contact your host if you need early check-in or have any questions</li>
              </ul>

              <p>We hope you have a wonderful stay!</p>
              
              <p>The Zero Fee Stays Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${data.guestEmail}</p>
              <p>© 2024 Zero Fee Stays. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Check-in Tomorrow: ${data.propertyTitle}

Hello ${data.guestName},

Just a friendly reminder that your check-in is tomorrow!

CHECK-IN DETAILS:
Date: ${this.formatDate(data.checkInDate)}
Time: ${data.checkInTime || "3:00 PM"}
Property: ${data.propertyTitle}
Location: ${data.propertyLocation}
${data.propertyAddress ? `Address: ${data.propertyAddress}` : ""}

Make sure to:
- Pack all your essentials
- Have your booking confirmation ready
- Contact your host if you need early check-in or have any questions

We hope you have a wonderful stay!

The Zero Fee Stays Team
      `,
    };

    return this.sendEmail(data.guestEmail, template);
  }

  // Booking Cancellation Email
  async sendCancellationEmail(
    data: BookingEmailData,
    cancelledBy: "guest" | "host"
  ): Promise<boolean> {
    const isGuestCancellation = cancelledBy === "guest";
    const recipientEmail = isGuestCancellation
      ? data.hostEmail
      : data.guestEmail;
    const recipientName = isGuestCancellation ? data.hostName : data.guestName;

    const template: EmailTemplate = {
      subject: `Booking Cancelled: ${data.propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancelled</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .cancellation { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Booking Cancelled</h1>
              <p>The booking for ${data.propertyTitle} has been cancelled</p>
            </div>
            
            <div class="content">
              <h2>Hello ${recipientName},</h2>
              <p>The following booking has been cancelled:</p>
              
              <div class="cancellation">
                <h3>📅 Cancelled Booking Details</h3>
                <p><strong>Property:</strong> ${data.propertyTitle}</p>
                <p><strong>Guest:</strong> ${data.guestName}</p>
                <p><strong>Host:</strong> ${data.hostName}</p>
                <p><strong>Check-in:</strong> ${this.formatDate(data.checkInDate)}</p>
                <p><strong>Check-out:</strong> ${this.formatDate(data.checkOutDate)}</p>
                <p><strong>Total Amount:</strong> ${this.formatCurrency(data.totalAmount)}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                <p><strong>Cancelled by:</strong> ${isGuestCancellation ? "Guest" : "Host"}</p>
              </div>

              <p>If you have any questions about the cancellation or refund process, please contact our support team.</p>
              
              <p>The Zero Fee Stays Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${recipientEmail}</p>
              <p>© 2024 Zero Fee Stays. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Booking Cancelled: ${data.propertyTitle}

Hello ${recipientName},

The following booking has been cancelled:

CANCELLED BOOKING DETAILS:
Property: ${data.propertyTitle}
Guest: ${data.guestName}
Host: ${data.hostName}
Check-in: ${this.formatDate(data.checkInDate)}
Check-out: ${this.formatDate(data.checkOutDate)}
Total Amount: ${this.formatCurrency(data.totalAmount)}
Booking ID: ${data.bookingId}
Cancelled by: ${isGuestCancellation ? "Guest" : "Host"}

If you have any questions about the cancellation or refund process, please contact our support team.

The Zero Fee Stays Team
      `,
    };

    return this.sendEmail(recipientEmail, template);
  }

  // Review Request Email
  async sendReviewRequestEmail(data: BookingEmailData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `How was your stay at ${data.propertyTitle}?`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Review Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⭐ Share Your Experience</h1>
              <p>How was your stay at ${data.propertyTitle}?</p>
            </div>
            
            <div class="content">
              <h2>Hello ${data.guestName},</h2>
              <p>We hope you enjoyed your recent stay at ${data.propertyTitle}!</p>
              
              <p>Your feedback helps other travelers make informed decisions and helps hosts improve their properties. Would you mind taking a moment to share your experience?</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="/review/${data.bookingId}" class="button">Write a Review</a>
              </div>

              <p>Your review will help future guests and your host. Thank you for choosing Zero Fee Stays!</p>
              
              <p>The Zero Fee Stays Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${data.guestEmail}</p>
              <p>© 2024 Zero Fee Stays. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
How was your stay at ${data.propertyTitle}?

Hello ${data.guestName},

We hope you enjoyed your recent stay at ${data.propertyTitle}!

Your feedback helps other travelers make informed decisions and helps hosts improve their properties. Would you mind taking a moment to share your experience?

Write a review: /review/${data.bookingId}

Your review will help future guests and your host. Thank you for choosing Zero Fee Stays!

The Zero Fee Stays Team
      `,
    };

    return this.sendEmail(data.guestEmail, template);
  }
}

export const emailNotificationService = new EmailNotificationService();
