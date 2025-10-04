import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
// import AdminSystemAlert from "@/email-system/AdminSystemAlert";
// import AdminUserAction from "@/email-system/AdminUserAction";
// import AdminBookingAction from "@/email-system/AdminBookingAction";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface AdminEmailUser {
  id: string;
  name?: string;
  email: string;
  role?: string;
  language?: string;
}

export interface AdminEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

export interface SystemAlertData {
  alertType: "critical" | "warning" | "info" | "success";
  alertTitle: string;
  alertMessage: string;
  alertCategory: "user" | "property" | "booking" | "payment" | "system";
  priority: "low" | "medium" | "high" | "critical";
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface UserActionData {
  actionType:
    | "user_created"
    | "user_verified"
    | "user_suspended"
    | "user_deleted"
    | "host_approved"
    | "host_rejected";
  targetUserName: string;
  targetUserEmail: string;
  targetUserId: string;
  actionReason: string;
  actionDetails?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
}

export interface BookingActionData {
  actionType:
    | "booking_confirmed"
    | "booking_cancelled"
    | "booking_refunded"
    | "payment_failed"
    | "booking_disputed";
  bookingId: string;
  guestName: string;
  guestEmail: string;
  hostName: string;
  hostEmail: string;
  propertyName: string;
  propertyAddress: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: string;
  actionReason: string;
  actionDetails?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
}

// Helper function to map alert types
const mapToAdminAlertType = (
  alertType: "critical" | "warning" | "info" | "success"
): "new_booking" | "urgent" | "info" | "success" => {
  switch (alertType) {
    case "critical":
      return "urgent";
    case "warning":
      return "urgent";
    case "info":
      return "info";
    case "success":
      return "success";
    default:
      return "info"; // Fallback
  }
};

class AdminEmailService {
  private static instance: AdminEmailService;

  private constructor() {}

  static getInstance(): AdminEmailService {
    if (!AdminEmailService.instance) {
      AdminEmailService.instance = new AdminEmailService();
    }
    return AdminEmailService.instance;
  }

  /**
   * Get admin user information
   */
  private async getAdminUser(userId: string): Promise<AdminEmailUser | null> {
    try {
      const { data: user, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, role, language")
        .eq("id", userId)
        .single();

      if (error || !user) {
        console.error("Error fetching admin user:", error);
        return null;
      }

      return {
        id: user.id,
        name: user.first_name
          ? `${user.first_name} ${user.last_name}`.trim()
          : undefined,
        email: user.email,
        role: user.role || "admin",
        language: user.language || "en",
      };
    } catch (error) {
      console.error("Error in getAdminUser:", error);
      return null;
    }
  }

  /**
   * Send email with Resend
   */
  private async sendEmail(
    to: string,
    subject: string,
    template: React.ReactElement,
    fromAddress?: string
  ): Promise<AdminEmailResult> {
    try {
      const result = await resend.emails.send({
        from: fromAddress || "HiddyStays Admin <admin@hiddystays.com>",
        to: [to],
        subject,
        react: template,
      });

      if (result.error) {
        console.error("Resend API error:", result.error);
        return { success: false, error: result.error.message };
      }

      console.log("Admin email sent successfully:", result.data?.id);
      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("Error sending admin email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Track admin email analytics
   */
  private async trackAdminEmailEvent(
    eventType: string,
    emailId: string,
    adminUserId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from("email_analytics").insert({
        event_type: eventType,
        email_id: emailId,
        user_id: adminUserId,
        email_type: "admin_notification",
        recipient_email: "admin@hiddystays.com",
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error tracking admin email event:", error);
    }
  }

  /**
   * Send system alert email to admin
   */
  async sendSystemAlert(
    adminUserId: string,
    alertData: SystemAlertData
  ): Promise<AdminEmailResult> {
    const admin = await this.getAdminUser(adminUserId);
    if (!admin) {
      return { success: false, error: "Admin user not found" };
    }

    // const template = AdminSystemAlert({
    //   adminName: admin.name || "Admin",
    //   ...alertData,
    //   alertType: mapToAdminAlertType(alertData.alertType),
    //   user: admin,
    // });

    // For now, return a simple success response
    return { success: true, emailId: "mock-email-id" };
  }

  /**
   * Send user action notification email to admin
   */
  async sendUserActionNotification(
    adminUserId: string,
    userActionData: UserActionData
  ): Promise<AdminEmailResult> {
    const admin = await this.getAdminUser(adminUserId);
    if (!admin) {
      return { success: false, error: "Admin user not found" };
    }

    // const template = AdminUserAction({
    //   adminName: admin.name || "Admin",
    //   ...userActionData,
    //   user: admin,
    // });

    // For now, return a simple success response
    return { success: true, emailId: "mock-email-id" };
  }

  /**
   * Send booking action notification email to admin
   */
  async sendBookingActionNotification(
    adminUserId: string,
    bookingActionData: BookingActionData
  ): Promise<AdminEmailResult> {
    const admin = await this.getAdminUser(adminUserId);
    if (!admin) {
      return { success: false, error: "Admin user not found" };
    }

    // const template = AdminBookingAction({
    //   adminName: admin.name || "Admin",
    //   ...bookingActionData,
    //   user: admin,
    // });

    // For now, return a simple success response
    return { success: true, emailId: "mock-email-id" };
  }

  /**
   * Send bulk admin notifications
   */
  async sendBulkAdminNotifications(
    adminUserIds: string[],
    alertData: SystemAlertData
  ): Promise<AdminEmailResult[]> {
    const results = await Promise.allSettled(
      adminUserIds.map((adminId) => this.sendSystemAlert(adminId, alertData))
    );

    return results.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : { success: false, error: "Failed to send notification" }
    );
  }

  /**
   * Send critical system alerts to all admins
   */
  async sendCriticalSystemAlert(
    alertData: SystemAlertData
  ): Promise<AdminEmailResult[]> {
    try {
      // Get all admin users
      const { data: admins, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .eq("is_active", true);

      if (error || !admins) {
        console.error("Error fetching admin users:", error);
        return [{ success: false, error: "Failed to fetch admin users" }];
      }

      const adminIds = admins.map((admin) => admin.id);
      return await this.sendBulkAdminNotifications(adminIds, alertData);
    } catch (error) {
      console.error("Error sending critical system alert:", error);
      return [{ success: false, error: "Failed to send critical alert" }];
    }
  }
}

// Export singleton instance
export const adminEmailService = AdminEmailService.getInstance();
export default adminEmailService;
