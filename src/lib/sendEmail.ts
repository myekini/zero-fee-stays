import { Resend } from "resend";
import WelcomeVerify from "../emails/WelcomeVerify";
import PasswordReset from "../emails/PasswordReset";
import BookingConfirmation from "../emails/BookingConfirmation";
import HostNotification from "../emails/HostNotification";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWelcomeVerify(to: string, props: any) {
  return resend.emails.send({
    from: "HiddyStays Welcome <welcome@hiddystays.com>",
    to,
    subject: "Verify your HiddyStays account",
    react: WelcomeVerify(props),
  });
}

export async function sendPasswordReset(to: string, props: any) {
  return resend.emails.send({
    from: "HiddyStays Security <security@hiddystays.com>",
    to,
    subject: "Reset your HiddyStays password",
    react: PasswordReset(props),
  });
}

export async function sendBookingConfirmation(to: string, props: any) {
  return resend.emails.send({
    from: "HiddyStays Reservations <bookings@hiddystays.com>",
    to,
    subject: `Booking confirmed — ${props.propertyName} on ${props.checkIn}`,
    react: BookingConfirmation(props),
  });
}

export async function sendHostNotification(to: string, props: any) {
  return resend.emails.send({
    from: "HiddyStays Notifications <notifications@hiddystays.com>",
    to,
    subject: `New booking request — ${props.propertyName} on ${props.checkIn}`,
    react: HostNotification(props),
  });
}

// Helper function to get Resend instance
export { resend };
