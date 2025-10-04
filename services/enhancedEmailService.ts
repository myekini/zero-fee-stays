// @ts-nocheck
// DEPRECATED: This file has been consolidated into unified-email-service.
// For backward compatibility, we forward to unifiedEmailService.

import { unifiedEmailService } from "@/lib/unified-email-service";

export interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  propertyAddress?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  bookingId: string;
  hostName?: string;
  hostPhone?: string;
  hostEmail?: string;
  specialRequests?: string;
  cancellationPolicy?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface HostNotificationData {
  hostName: string;
  hostEmail: string;
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  propertyAddress?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  bookingId: string;
  specialRequests?: string;
}

class EnhancedEmailService {
  private static instance: EnhancedEmailService;
  private constructor() {}
  static getInstance(): EnhancedEmailService {
    if (!EnhancedEmailService.instance) {
      EnhancedEmailService.instance = new EnhancedEmailService();
    }
    return EnhancedEmailService.instance;
  }

  async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    const res = await unifiedEmailService.sendBookingConfirmation({
      bookingId: data.bookingId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      hostName: data.hostName || "",
      hostEmail: data.hostEmail || "",
      propertyTitle: data.propertyTitle,
      propertyLocation: data.propertyAddress || "",
      checkInDate: data.checkIn,
      checkOutDate: data.checkOut,
      guests: data.guests,
      totalAmount: data.totalAmount,
      specialRequests: data.specialRequests,
    });
    return res.success;
  }

  async sendHostBookingNotification(data: HostNotificationData): Promise<boolean> {
    const res = await unifiedEmailService.sendHostNotification({
      bookingId: data.bookingId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      hostName: data.hostName,
      hostEmail: data.hostEmail,
      propertyTitle: data.propertyTitle,
      propertyLocation: data.propertyAddress || "",
      checkInDate: data.checkIn,
      checkOutDate: data.checkOut,
      guests: data.guests,
      totalAmount: data.totalAmount,
      specialRequests: data.specialRequests,
    });
    return res.success;
  }

  async sendBookingReminder(data: BookingEmailData): Promise<boolean> {
    const res = await unifiedEmailService.sendCheckInReminder({
      bookingId: data.bookingId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      hostName: data.hostName || "",
      hostEmail: data.hostEmail || "",
      propertyTitle: data.propertyTitle,
      propertyLocation: data.propertyAddress || "",
      checkInDate: data.checkIn,
      checkOutDate: data.checkOut,
      guests: data.guests,
      totalAmount: data.totalAmount,
      checkInTime: data.checkInTime,
      hostPhone: data.hostPhone,
      propertyAddress: data.propertyAddress,
    });
    return res.success;
  }

  async sendBookingCancellation(data: BookingEmailData & { refundAmount?: number; refundPercentage?: number; cancellationReason?: string }): Promise<boolean> {
    const res = await unifiedEmailService.sendBookingCancellation({
      bookingId: data.bookingId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      hostName: data.hostName || "",
      hostEmail: data.hostEmail || "",
      propertyTitle: data.propertyTitle,
      propertyLocation: data.propertyAddress || "",
      checkInDate: data.checkIn,
      checkOutDate: data.checkOut,
      guests: data.guests,
      totalAmount: data.totalAmount,
      refundAmount: data.refundAmount,
      refundPercentage: data.refundPercentage,
      cancellationReason: data.cancellationReason,
    });
    return res.success;
  }
}

export default EnhancedEmailService.getInstance();
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
            .booking-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .detail-label { font-weight: 600; color: #374151; }
            .detail-value { color: #6b7280; }
            .total-amount { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
            .cta-button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .zero-fee-badge { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your stay is all set with zero platform fees</p>
              <div class="zero-fee-badge">✓ Zero Platform Fees</div>
            </div>
            
            <div class="content">
              <h2>Hello ${data.guestName}!</h2>
              <p>Great news! Your booking has been confirmed. Here are all the details:</p>
              
              <div class="booking-details">
                <h3>📋 Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Property:</span>
                  <span class="detail-value">${data.propertyTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${data.propertyAddress}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span class="detail-value">${new Date(data.checkIn).toLocaleDateString()} ${data.checkInTime || '3:00 PM'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span class="detail-value">${new Date(data.checkOut).toLocaleDateString()} ${data.checkOutTime || '11:00 AM'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests:</span>
                  <span class="detail-value">${data.guests} ${data.guests === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">#${data.bookingId.slice(-8)}</span>
                </div>
              </div>

              <div class="total-amount">
                Total Paid: $${data.totalAmount}
              </div>

              ${data.specialRequests ? `
                <div class="booking-details">
                  <h3>📝 Special Requests</h3>
                  <p>${data.specialRequests}</p>
                </div>
              ` : ''}

              <div class="booking-details">
                <h3>👤 Host Contact</h3>
                <p><strong>Host:</strong> ${data.hostName}</p>
                ${data.hostEmail ? `<p><strong>Email:</strong> ${data.hostEmail}</p>` : ''}
                ${data.hostPhone ? `<p><strong>Phone:</strong> ${data.hostPhone}</p>` : ''}
              </div>

              ${data.cancellationPolicy ? `
                <div class="booking-details">
                  <h3>📋 Cancellation Policy</h3>
                  <p>${data.cancellationPolicy}</p>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" class="cta-button">View Booking Details</a>
              </div>

              <p><strong>What's next?</strong></p>
              <ul>
                <li>You'll receive a check-in reminder 24 hours before your stay</li>
                <li>Contact your host directly for any questions</li>
                <li>Enjoy your stay with zero platform fees!</li>
              </ul>
            </div>

            <div class="footer">
              <p>Thank you for choosing HiddyStays!</p>
              <p>Questions? Contact us at support@hiddystays.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate host notification HTML
  private generateHostNotificationHTML(data: HostNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking Notification</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
            .booking-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .detail-label { font-weight: 600; color: #374151; }
            .detail-value { color: #6b7280; }
            .total-amount { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
            .cta-button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .zero-fee-badge { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Booking Received!</h1>
              <p>You have a new guest booking your property</p>
              <div class="zero-fee-badge">✓ Zero Platform Fees</div>
            </div>
            
            <div class="content">
              <h2>Hello ${data.hostName}!</h2>
              <p>Congratulations! You have a new booking for your property. Here are the details:</p>
              
              <div class="booking-details">
                <h3>📋 Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Property:</span>
                  <span class="detail-value">${data.propertyTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${data.propertyAddress}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span class="detail-value">${new Date(data.checkIn).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span class="detail-value">${new Date(data.checkOut).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests:</span>
                  <span class="detail-value">${data.guests} ${data.guests === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">#${data.bookingId.slice(-8)}</span>
                </div>
              </div>

              <div class="booking-details">
                <h3>👤 Guest Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${data.guestName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${data.guestEmail}</span>
                </div>
              </div>

              <div class="total-amount">
                You'll Receive: $${data.totalAmount}
              </div>

              ${data.specialRequests ? `
                <div class="booking-details">
                  <h3>📝 Special Requests</h3>
                  <p>${data.specialRequests}</p>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/host-dashboard" class="cta-button">Manage Booking</a>
              </div>

              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Prepare your property for the guest's arrival</li>
                <li>Send check-in instructions to the guest</li>
                <li>Be available for any questions</li>
                <li>Enjoy hosting with zero platform fees!</li>
              </ul>
            </div>

            <div class="footer">
              <p>Thank you for hosting with HiddyStays!</p>
              <p>Questions? Contact us at support@hiddystays.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate booking reminder HTML
  private generateBookingReminderHTML(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Check-in Reminder</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
            .booking-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .detail-label { font-weight: 600; color: #374151; }
            .detail-value { color: #6b7280; }
            .cta-button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Check-in Reminder</h1>
              <p>Your stay starts tomorrow!</p>
            </div>
            
            <div class="content">
              <h2>Hello ${data.guestName}!</h2>
              <p>Just a friendly reminder that your stay at <strong>${data.propertyTitle}</strong> starts tomorrow!</p>
              
              <div class="booking-details">
                <h3>📋 Check-in Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Check-in Date:</span>
                  <span class="detail-value">${new Date(data.checkIn).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in Time:</span>
                  <span class="detail-value">${data.checkInTime || '3:00 PM'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Property:</span>
                  <span class="detail-value">${data.propertyTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${data.propertyAddress}</span>
                </div>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" class="cta-button">View Booking Details</a>
              </div>

              <p><strong>Before you arrive:</strong></p>
              <ul>
                <li>Contact your host if you have any questions</li>
                <li>Check the property's house rules</li>
                <li>Plan your arrival time</li>
                <li>Pack everything you need for your stay</li>
              </ul>

              <p>We hope you have an amazing stay!</p>
            </div>

            <div class="footer">
              <p>Safe travels from the HiddyStays team!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateBookingCancellationHTML(data: BookingEmailData & { refundAmount?: number }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancelled</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
            .booking-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .detail-label { font-weight: 600; color: #374151; }
            .detail-value { color: #6b7280; }
            .refund-amount { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
            .cta-button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Booking Cancelled</h1>
              <p>Your booking has been cancelled</p>
            </div>
            
            <div class="content">
              <h2>Hello ${data.guestName}!</h2>
              <p>We're sorry to inform you that your booking for <strong>${data.propertyTitle}</strong> has been cancelled.</p>
              
              <div class="booking-details">
                <h3>📋 Cancelled Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Property:</span>
                  <span class="detail-value">${data.propertyTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Original Check-in:</span>
                  <span class="detail-value">${new Date(data.checkIn).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Original Check-out:</span>
                  <span class="detail-value">${new Date(data.checkOut).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">#${data.bookingId.slice(-8)}</span>
                </div>
              </div>

              ${data.refundAmount ? `
                <div class="refund-amount">
                  Refund Amount: $${data.refundAmount}
                </div>
                <p style="text-align: center; color: #6b7280;">
                  Your refund will be processed within 5-7 business days.
                </p>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/properties" class="cta-button">Find Another Stay</a>
              </div>

              <p><strong>What happens next?</strong></p>
              <ul>
                ${data.refundAmount ? '<li>Your refund will be processed automatically</li>' : ''}
                <li>You'll receive a confirmation email once the refund is processed</li>
                <li>You can book another property anytime</li>
                <li>Contact us if you have any questions</li>
              </ul>
            </div>

            <div class="footer">
              <p>We're sorry for any inconvenience.</p>
              <p>Questions? Contact us at support@hiddystays.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const enhancedEmailService = EnhancedEmailService.getInstance();

