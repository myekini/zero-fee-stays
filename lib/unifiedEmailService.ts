import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock implementation of UnifiedEmailService
class UnifiedEmailService {
  private static instance: UnifiedEmailService;

  private constructor() {}

  static getInstance(): UnifiedEmailService {
    if (!UnifiedEmailService.instance) {
      UnifiedEmailService.instance = new UnifiedEmailService();
    }
    return UnifiedEmailService.instance;
  }

  // Mock implementations for all email methods
  async sendWelcomeVerification(to: string, props: any) {
    return { success: true, emailId: "mock-welcome-verification" };
  }

  async sendPasswordReset(to: string, props: any) {
    return { success: true, emailId: "mock-password-reset" };
  }

  async sendBookingConfirmation(to: string, props: any) {
    return { success: true, emailId: "mock-booking-confirmation" };
  }

  async sendHostNotification(to: string, props: any) {
    return { success: true, emailId: "mock-host-notification" };
  }

  async sendPaymentConfirmation(to: string, props: any) {
    return { success: true, emailId: "mock-payment-confirmation" };
  }

  async sendBookingReminder(to: string, props: any) {
    return { success: true, emailId: "mock-booking-reminder" };
  }

  async sendBulkBookingEmails(emails: any[]) {
    return emails.map(() => ({ success: true, emailId: "mock-bulk-email" }));
  }

  async sendEnhancedBookingConfirmation(to: string, props: any) {
    return { success: true, emailId: "mock-enhanced-booking-confirmation" };
  }

  async sendEnhancedHostNotification(to: string, props: any) {
    return { success: true, emailId: "mock-enhanced-host-notification" };
  }

  async sendBulkEnhancedBookingEmails(emails: any[]) {
    return emails.map(() => ({
      success: true,
      emailId: "mock-bulk-enhanced-email",
    }));
  }

  async sendModernWelcomeEmail(to: string, props: any) {
    return { success: true, emailId: "mock-modern-welcome" };
  }

  async sendModernPasswordResetEmail(to: string, props: any) {
    return { success: true, emailId: "mock-modern-password-reset" };
  }

  async sendModernBookingReminderEmail(to: string, props: any) {
    return { success: true, emailId: "mock-modern-booking-reminder" };
  }

  async sendAdminSystemAlert(to: string, props: any) {
    return { success: true, emailId: "mock-admin-system-alert" };
  }

  async sendAdminUserActionNotification(to: string, props: any) {
    return { success: true, emailId: "mock-admin-user-action" };
  }

  async sendAdminBookingActionNotification(to: string, props: any) {
    return { success: true, emailId: "mock-admin-booking-action" };
  }
}

// Export singleton instance
export const unifiedEmailService = UnifiedEmailService.getInstance();
export default unifiedEmailService;
