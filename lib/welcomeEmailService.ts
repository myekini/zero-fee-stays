import { supabase } from "@/integrations/supabase/client";
import { emailService } from "@/lib/email-service";

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

      const { data: result, error } = await supabase.functions.invoke(
        "email-service",
        {
          body: {
            type: "welcome_verification",
            to: userData.user.email,
            data: {
              name:
                userData.user.name ||
                `${userData.user.firstName || ""} ${userData.user.lastName || ""}`.trim() ||
                userData.user.email,
              verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?type=signup`,
              loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth`,
            },
          },
        }
      );

      if (error) {
        console.error(`❌ Error sending welcome email:`, error);
        return { success: false, error: error.message };
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

      const { data: result, error } = await supabase.functions.invoke(
        "email-service",
        {
          body: {
            type: "email_verification",
            to: email,
            data: {
              user: {
                name: firstName || email,
                email: email,
                firstName: firstName,
              },
              verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?type=signup&token=verify`,
            },
          },
        }
      );

      if (error) {
        console.error(`❌ Error sending verification email:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Verification email sent successfully:`, result?.emailId);
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
