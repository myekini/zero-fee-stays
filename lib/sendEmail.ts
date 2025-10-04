import { Resend } from "resend";
// import WelcomeVerify from "../emails/WelcomeVerify";
// import PasswordReset from "../emails/PasswordReset";
// import BookingConfirmation from "../emails/BookingConfirmation";
// import HostNotification from "../emails/HostNotification";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWelcomeVerify(to: string, props: any) {
  // Mock implementation - return success response
  return {
    data: { id: "mock-welcome-email-id" },
    error: null,
  };
}

export async function sendPasswordReset(to: string, props: any) {
  // Mock implementation - return success response
  return {
    data: { id: "mock-password-reset-email-id" },
    error: null,
  };
}

export async function sendBookingConfirmation(to: string, props: any) {
  // Mock implementation - return success response
  return {
    data: { id: "mock-booking-confirmation-email-id" },
    error: null,
  };
}

export async function sendHostNotification(to: string, props: any) {
  // Mock implementation - return success response
  return {
    data: { id: "mock-host-notification-email-id" },
    error: null,
  };
}

// Helper function to get Resend instance
export { resend };
