import { unifiedEmailService } from "@/lib/unified-email-service";

export interface WelcomeEmailData {
  user: {
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export class WelcomeEmailService {
  static async sendWelcomeEmail(
    userData: WelcomeEmailData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📧 Sending welcome email to ${userData.user.email}`);

      const result = await unifiedEmailService.sendWelcomeEmail({
        name:
          userData.user.name ||
          `${userData.user.firstName || ""} ${userData.user.lastName || ""}`.trim() ||
          userData.user.email,
        email: userData.user.email,
      });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      console.log(`✅ Welcome email sent successfully:`, result?.emailId);
      return { success: true };
    } catch (error) {
      console.error(`❌ Exception sending welcome email:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async sendVerificationEmail(
    email: string,
    firstName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📧 Sending verification email to ${email}`);

      const result = await unifiedEmailService.sendWelcomeEmail({
        name: firstName || email,
        email,
      });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      console.log(`✅ Verification email requested successfully:`, result?.emailId);
      return { success: true };
    } catch (error) {
      console.error(`❌ Exception sending verification email:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export convenience functions
export const sendWelcomeEmail = (userData: WelcomeEmailData) =>
  WelcomeEmailService.sendWelcomeEmail(userData);

export const sendVerificationEmail = (email: string, firstName?: string) =>
  WelcomeEmailService.sendVerificationEmail(email, firstName);
