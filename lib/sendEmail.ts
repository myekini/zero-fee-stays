// DEPRECATED: use unified-email-service instead of low-level sendEmail.
import { unifiedEmailService } from "./unified-email-service";

export async function sendWelcomeVerify(to: string, props: any) {
  const res = await unifiedEmailService.sendWelcomeEmail({ name: props?.name || to, email: to });
  return { data: { id: res.emailId }, error: res.success ? null : res.error } as any;
}

export async function sendPasswordReset(to: string, props: any) {
  const res = await unifiedEmailService.sendPasswordReset(to, props?.name || to, props?.resetUrl);
  return { data: { id: res.emailId }, error: res.success ? null : res.error } as any;
}

export async function sendBookingConfirmation(to: string, props: any) {
  const res = await unifiedEmailService.sendBookingConfirmation({
    bookingId: props.bookingId,
    guestName: props.guestName,
    guestEmail: to,
    hostName: props.hostName,
    hostEmail: props.hostEmail,
    propertyTitle: props.propertyTitle,
    propertyLocation: props.propertyLocation,
    checkInDate: props.checkInDate,
    checkOutDate: props.checkOutDate,
    guests: props.guests,
    totalAmount: props.totalAmount,
  });
  return { data: { id: res.emailId }, error: res.success ? null : res.error } as any;
}

export async function sendHostNotification(to: string, props: any) {
  const res = await unifiedEmailService.sendHostNotification({
    bookingId: props.bookingId,
    guestName: props.guestName,
    guestEmail: props.guestEmail,
    hostName: props.hostName,
    hostEmail: to,
    propertyTitle: props.propertyTitle,
    propertyLocation: props.propertyLocation,
    checkInDate: props.checkInDate,
    checkOutDate: props.checkOutDate,
    guests: props.guests,
    totalAmount: props.totalAmount,
    specialRequests: props.specialRequests,
  });
  return { data: { id: res.emailId }, error: res.success ? null : res.error } as any;
}

export const resend = undefined as any;
