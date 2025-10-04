import { render } from "@react-email/components";
// import WelcomeVerify from "@/email-system/WelcomeVerify";
// import PasswordReset from "@/email-system/PasswordReset";
// import BookingConfirmation from "@/email-system/BookingConfirmation";
// import HostNotification from "@/email-system/HostNotification";

export interface EmailTemplateData {
  [key: string]: any;
}

export interface RenderedEmail {
  html: string;
  text: string;
}

class EmailRenderer {
  /**
   * Render a React email template to HTML and text
   */
  static async renderTemplate(
    templateName: string,
    data: EmailTemplateData
  ): Promise<RenderedEmail> {
    // Mock email templates for now
    let html = "";
    let text = "";

    switch (templateName) {
      case "welcome-verify":
        html = `<h1>Welcome ${data.name || "Guest"}!</h1><p>Please verify your email.</p>`;
        text = `Welcome ${data.name || "Guest"}! Please verify your email.`;
        break;

      case "password-reset":
        html = `<h1>Password Reset</h1><p>Hello ${data.name || "Guest"}, please reset your password.</p>`;
        text = `Password Reset - Hello ${data.name || "Guest"}, please reset your password.`;
        break;

      case "booking-confirmation":
        html = `<h1>Booking Confirmed</h1><p>Your booking ${data.bookingId} has been confirmed.</p>`;
        text = `Booking Confirmed - Your booking ${data.bookingId} has been confirmed.`;
        break;

      case "host-notification":
        html = `<h1>New Booking</h1><p>You have a new booking ${data.bookingId}.</p>`;
        text = `New Booking - You have a new booking ${data.bookingId}.`;
        break;

      default:
        throw new Error(`Unknown email template: ${templateName}`);
    }

    return { html, text };
  }

  /**
   * Convert HTML to plain text
   */
  private static htmlToText(html: string): string {
    // Remove HTML tags and decode entities
    let text = html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    // Add line breaks for better readability
    text = text
      .replace(/\n\s*\n/g, "\n\n") // Replace multiple newlines with double newlines
      .replace(/\s*\n\s*/g, "\n"); // Clean up spaces around newlines

    return text;
  }

  /**
   * Get available template names
   */
  static getAvailableTemplates(): string[] {
    return [
      "welcome-verify",
      "password-reset",
      "booking-confirmation",
      "host-notification",
    ];
  }
}

export default EmailRenderer;
