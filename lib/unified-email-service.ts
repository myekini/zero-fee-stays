import { render } from "@react-email/components";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { EmailTemplates } from "./email-templates";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface EmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

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
  guests: number;
  totalAmount: number;
  specialRequests?: string;
  hostInstructions?: string;
}

export interface NewsletterSubscriptionData {
  email: string;
  name?: string;
  source?: string;
}

class UnifiedEmailService {
  private static instance: UnifiedEmailService;

  private constructor() {}

  static getInstance(): UnifiedEmailService {
    if (!UnifiedEmailService.instance) {
      UnifiedEmailService.instance = new UnifiedEmailService();
    }
    return UnifiedEmailService.instance;
  }

  /**
   * Send email using Resend with React Email templates
   */
  private async sendEmail(
    to: string,
    subject: string,
    template: React.ReactElement,
    fromAddress?: string
  ): Promise<EmailResult> {
    try {
      const html = await render(template);
      const text = this.htmlToText(html);

      const result = await resend.emails.send({
        from: fromAddress || "HiddyStays <hello@hiddystays.com>",
        to: [to],
        subject,
        html,
        text,
      });

      if (result.error) {
        console.error("Resend API error:", result.error);
        return { success: false, error: result.error.message };
      }

      console.log("Email sent successfully:", result.data?.id);
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Track email analytics
   */
  private async trackEmailEvent(
    eventType: string,
    emailId: string,
    recipientEmail: string,
    emailType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from("email_analytics").insert({
        event_type: eventType,
        email_id: emailId,
        recipient_email: recipientEmail,
        email_type: emailType,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error tracking email event:", error);
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(userData: UserData): Promise<EmailResult> {
    const template = EmailTemplates.WelcomeEmail({
      name: userData.name,
      email: userData.email,
    });

    const result = await this.sendEmail(
      userData.email,
      "🎉 Welcome to HiddyStays - Your Journey Begins!",
      template,
      "HiddyStays Welcome <welcome@hiddystays.com>"
    );

    if (result.success && result.emailId) {
      await this.trackEmailEvent(
        "welcome_sent",
        result.emailId,
        userData.email,
        "welcome",
        {
          userId: userData.userId,
        }
      );
    }

    return result;
  }

  /**
   * Send booking confirmation to guest
   */
  async sendBookingConfirmation(data: BookingEmailData): Promise<EmailResult> {
    const template = EmailTemplates.BookingConfirmationEmail({
      guestName: data.guestName,
      propertyTitle: data.propertyTitle,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guests: data.guests,
      totalAmount: data.totalAmount,
      bookingId: data.bookingId,
    });

    const result = await this.sendEmail(
      data.guestEmail,
      `🎉 Booking Confirmed - ${data.propertyTitle}`,
      template,
      "HiddyStays Reservations <bookings@hiddystays.com>"
    );

    if (result.success && result.emailId) {
      await this.trackEmailEvent(
        "booking_confirmation_sent",
        result.emailId,
        data.guestEmail,
        "booking_confirmation",
        {
          bookingId: data.bookingId,
          propertyTitle: data.propertyTitle,
        }
      );
    }

    return result;
  }

  /**
   * Send booking notification to host
   */
  async sendHostNotification(data: BookingEmailData): Promise<EmailResult> {
    const template = EmailTemplates.HostNotificationEmail({
      hostName: data.hostName,
      guestName: data.guestName,
      propertyTitle: data.propertyTitle,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guests: data.guests,
      totalAmount: data.totalAmount,
      bookingId: data.bookingId,
    });

    const result = await this.sendEmail(
      data.hostEmail,
      `🎉 New Booking - ${data.guestName} booked your ${data.propertyTitle}`,
      template,
      "HiddyStays Notifications <notifications@hiddystays.com>"
    );

    if (result.success && result.emailId) {
      await this.trackEmailEvent(
        "host_notification_sent",
        result.emailId,
        data.hostEmail,
        "host_notification",
        {
          bookingId: data.bookingId,
          propertyTitle: data.propertyTitle,
          guestName: data.guestName,
        }
      );
    }

    return result;
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    email: string,
    name: string,
    resetUrl: string
  ): Promise<EmailResult> {
    const template = EmailTemplates.PasswordResetEmail({
      name,
      resetUrl,
    });

    const result = await this.sendEmail(
      email,
      "🔒 Reset Your HiddyStays Password",
      template,
      "HiddyStays Security <security@hiddystays.com>"
    );

    if (result.success && result.emailId) {
      await this.trackEmailEvent(
        "password_reset_sent",
        result.emailId,
        email,
        "password_reset"
      );
    }

    return result;
  }

  /**
   * Send newsletter welcome email
   */
  async sendNewsletterWelcome(
    data: NewsletterSubscriptionData
  ): Promise<EmailResult> {
    const template = EmailTemplates.NewsletterWelcomeEmail({
      name: data.name || "Friend",
      email: data.email,
    });

    const result = await this.sendEmail(
      data.email,
      "📧 Welcome to Our Newsletter - Travel Tips & Deals Await!",
      template,
      "HiddyStays Newsletter <newsletter@hiddystays.com>"
    );

    if (result.success && result.emailId) {
      await this.trackEmailEvent(
        "newsletter_welcome_sent",
        result.emailId,
        data.email,
        "newsletter",
        {
          source: data.source,
        }
      );
    }

    return result;
  }

  /**
   * Send bulk booking emails (guest + host)
   */
  async sendBookingEmails(data: BookingEmailData): Promise<{
    guestEmail: EmailResult;
    hostEmail: EmailResult;
  }> {
    const [guestResult, hostResult] = await Promise.allSettled([
      this.sendBookingConfirmation(data),
      this.sendHostNotification(data),
    ]);

    return {
      guestEmail:
        guestResult.status === "fulfilled"
          ? guestResult.value
          : { success: false, error: "Failed to send guest confirmation" },
      hostEmail:
        hostResult.status === "fulfilled"
          ? hostResult.value
          : { success: false, error: "Failed to send host notification" },
    };
  }

  /**
   * Send check-in reminder email
   */
  async sendCheckInReminder(data: BookingEmailData): Promise<EmailResult> {
    // For now, reuse booking confirmation template with different subject
    // You can create a dedicated check-in reminder template later
    const template = EmailTemplates.BookingConfirmationEmail({
      guestName: data.guestName,
      propertyTitle: data.propertyTitle,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guests: data.guests,
      totalAmount: data.totalAmount,
      bookingId: data.bookingId,
    });

    const result = await this.sendEmail(
      data.guestEmail,
      `🎒 Check-in Tomorrow - ${data.propertyTitle}`,
      template,
      "HiddyStays Reminders <reminders@hiddystays.com>"
    );

    if (result.success && result.emailId) {
      await this.trackEmailEvent(
        "check_in_reminder_sent",
        result.emailId,
        data.guestEmail,
        "check_in_reminder",
        {
          bookingId: data.bookingId,
          propertyTitle: data.propertyTitle,
        }
      );
    }

    return result;
  }

  /**
   * Send post-stay follow-up email
   */
  async sendPostStayFollowup(data: BookingEmailData): Promise<EmailResult> {
    // For now, reuse booking confirmation template with different subject
    // You can create a dedicated post-stay template later
    const template = EmailTemplates.BookingConfirmationEmail({
      guestName: data.guestName,
      propertyTitle: data.propertyTitle,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guests: data.guests,
      totalAmount: data.totalAmount,
      bookingId: data.bookingId,
    });

    const result = await this.sendEmail(
      data.guestEmail,
      `🌟 How was your stay at ${data.propertyTitle}?`,
      template,
      "HiddyStays Follow-up <followup@hiddystays.com>"
    );

    if (result.success && result.emailId) {
      await this.trackEmailEvent(
        "post_stay_followup_sent",
        result.emailId,
        data.guestEmail,
        "post_stay_followup",
        {
          bookingId: data.bookingId,
          propertyTitle: data.propertyTitle,
        }
      );
    }

    return result;
  }

  /**
   * Get email analytics
   */
  async getEmailAnalytics(
    emailType?: string,
    days: number = 30
  ): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from("email_analytics")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (emailType) {
        query = query.eq("email_type", emailType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching email analytics:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export singleton instance
export const unifiedEmailService = UnifiedEmailService.getInstance();
export default unifiedEmailService;
