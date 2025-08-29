import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Type definitions for better IDE support
declare global {
  interface Window {
    Deno: {
      env: {
        get(key: string): string | undefined;
      };
    };
  }
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type:
    | "welcome_verification"
    | "password_reset"
    | "booking_confirmation"
    | "host_notification";
  to: string;
  data: Record<string, any>;
}

interface EmailTemplateData {
  name?: string;
  verifyUrl?: string;
  resetUrl?: string;
  ip?: string;
  city?: string;
  propertyName?: string;
  address?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  total?: string;
  manageUrl?: string;
  receiptUrl?: string;
  hostName?: string;
  guestName?: string;
  payout?: string;
  approveUrl?: string;
  declineUrl?: string;
  detailsUrl?: string;
}

// Email template generator functions
function generateWelcomeVerificationEmail(data: EmailTemplateData): {
  subject: string;
  html: string;
} {
  const { name = "Guest", verifyUrl = "#" } = data;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your HiddyStays account</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 24px; background-color: #F8FAFC; }
        .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15,23,42,.06); }
        .header { padding: 24px 24px 12px; border-bottom: 1px solid #E2E8F0; }
        .logo { font-size: 20px; font-weight: 700; color: #0F172A; }
        .content { padding: 24px; }
        .title { color: #0F172A; font-size: 24px; margin: 0 0 16px 0; font-weight: 600; }
        .text { color: #64748B; line-height: 1.5; margin-bottom: 16px; }
        .button { display: inline-block; background-color: #F97316; color: #FFFFFF; padding: 12px 20px; border-radius: 9999px; text-decoration: none; font-weight: 600; }
        .fallback { font-size: 12px; color: #64748B; margin-top: 16px; }
        .footer { padding: 16px; color: #64748B; font-size: 12px; border-top: 1px solid #E2E8F0; }
        .footer a { color: #0F172A; text-decoration: none; margin-left: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HiddyStays</div>
        </div>
        <div class="content">
          <h1 class="title">Welcome to HiddyStays</h1>
          <p class="text">Hi ${name}, thanks for signing up. Please verify your email to secure your account and start booking premium stays.</p>
          <a href="${verifyUrl}" class="button">Verify Email</a>
          <p class="fallback">If the button doesn't work, paste this link into your browser: ${verifyUrl}</p>
        </div>
        <div class="footer">
          <div>© ${new Date().getFullYear()} HiddyStays. All rights reserved.</div>
          <div style="margin-top: 8px;">
            <a href="https://www.hiddystays.com">Website</a> •
            <a href="mailto:support@hiddystays.com">Support</a> •
            <a href="{{unsubscribe_url}}">Manage Preferences</a> •
            <a href="https://www.hiddystays.com/privacy">Privacy</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: "Verify your HiddyStays account",
    html,
  };
}

function generatePasswordResetEmail(data: EmailTemplateData): {
  subject: string;
  html: string;
} {
  const { name = "Guest", resetUrl = "#", ip = "", city = "" } = data;

  const securityNote =
    ip || city
      ? `<p style="color: #94A3B8; font-size: 12px; margin-top: 12px;">Security note: request detected from ${city} ${ip && `(${ip})`}.</p>`
      : "";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your HiddyStays password</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 24px; background-color: #F8FAFC; }
        .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15,23,42,.06); }
        .header { padding: 24px 24px 12px; border-bottom: 1px solid #E2E8F0; }
        .logo { font-size: 20px; font-weight: 700; color: #0F172A; }
        .content { padding: 24px; }
        .title { color: #0F172A; font-size: 22px; margin: 0 0 16px 0; font-weight: 600; }
        .text { color: #64748B; line-height: 1.5; margin-bottom: 16px; }
        .button { display: inline-block; background-color: #F97316; color: #FFFFFF; padding: 12px 20px; border-radius: 9999px; text-decoration: none; font-weight: 600; }
        .security { color: #94A3B8; font-size: 12px; margin-top: 12px; }
        .footer { padding: 16px; color: #64748B; font-size: 12px; border-top: 1px solid #E2E8F0; }
        .footer a { color: #0F172A; text-decoration: none; margin-left: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HiddyStays</div>
        </div>
        <div class="content">
          <h1 class="title">Password reset requested</h1>
          <p class="text">Hi ${name}, we received a request to reset your password. If this was you, click the button below. This link expires in 30 minutes.</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          ${securityNote}
          <p class="text" style="font-size: 12px;">If you didn't request this, you can ignore this email or contact support.</p>
        </div>
        <div class="footer">
          <div>© ${new Date().getFullYear()} HiddyStays. All rights reserved.</div>
          <div style="margin-top: 8px;">
            <a href="https://www.hiddystays.com">Website</a> •
            <a href="mailto:support@hiddystays.com">Support</a> •
            <a href="{{unsubscribe_url}}">Manage Preferences</a> •
            <a href="https://www.hiddystays.com/privacy">Privacy</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: "Reset your HiddyStays password",
    html,
  };
}

function generateBookingConfirmationEmail(data: EmailTemplateData): {
  subject: string;
  html: string;
} {
  const {
    name = "Guest",
    propertyName = "Hiddy Loft",
    address = "123 Ocean View, Lagos",
    checkIn = "2025-09-01",
    checkOut = "2025-09-05",
    guests = 2,
    total = "$420",
    manageUrl = "#",
    receiptUrl = "#",
  } = data;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking confirmed — ${propertyName}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 24px; background-color: #F8FAFC; }
        .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15,23,42,.06); }
        .header { padding: 24px 24px 12px; border-bottom: 1px solid #E2E8F0; }
        .logo { font-size: 20px; font-weight: 700; color: #0F172A; }
        .hero { background: #FFF7ED; padding: 24px; }
        .hero-title { margin: 0; color: #0F172A; font-size: 24px; font-weight: 600; }
        .status-rail { display: flex; align-items: center; gap: 16px; margin-top: 12px; }
        .status-dot { width: 14px; height: 14px; border-radius: 7px; background: #F97316; }
        .status-text { font-size: 12px; color: #0F172A; }
        .content { padding: 24px; }
        .property-title { margin: 0 0 8px 0; font-size: 18px; color: #0F172A; font-weight: 600; }
        .property-address { color: #64748B; margin: 0 0 16px 0; }
        .details-card { border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .detail-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; font-size: 14px; }
        .detail-label { color: #64748B; }
        .detail-value { color: #0F172A; font-weight: 600; text-align: right; }
        .divider { border-top: 1px solid #E2E8F0; margin: 8px 0; }
        .actions { display: flex; gap: 12px; margin-bottom: 12px; }
        .button { display: inline-block; background-color: #F97316; color: #FFFFFF; padding: 12px 20px; border-radius: 9999px; text-decoration: none; font-weight: 600; }
        .link { color: #0F172A; font-weight: 600; text-decoration: none; }
        .help-text { color: #64748B; font-size: 12px; }
        .footer { padding: 16px; color: #64748B; font-size: 12px; border-top: 1px solid #E2E8F0; }
        .footer a { color: #0F172A; text-decoration: none; margin-left: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HiddyStays</div>
        </div>
        <div class="hero">
          <h1 class="hero-title">Hooray! Your booking is confirmed.</h1>
          <div class="status-rail">
            <div class="status-dot"></div>
            <div class="status-text">Confirmed</div>
            <div style="width: 40px; height: 2px; background: #E2E8F0;"></div>
            <div style="width: 14px; height: 14px; border-radius: 7px; background: #E2E8F0;"></div>
            <div style="font-size: 12px; color: #94A3B8;">Preparing</div>
            <div style="width: 40px; height: 2px; background: #E2E8F0;"></div>
            <div style="width: 14px; height: 14px; border-radius: 7px; background: #E2E8F0;"></div>
            <div style="font-size: 12px; color: #94A3B8;">Stay</div>
          </div>
        </div>
        <div class="content">
          <h2 class="property-title">${propertyName}</h2>
          <p class="property-address">${address}</p>
          <div class="details-card">
            <div class="detail-row">
              <div class="detail-label">Guest</div>
              <div class="detail-value">${name}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Check‑in</div>
              <div class="detail-value">${checkIn}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Check‑out</div>
              <div class="detail-value">${checkOut}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Guests</div>
              <div class="detail-value">${guests}</div>
            </div>
            <div class="divider"></div>
            <div class="detail-row">
              <div class="detail-label">Total Paid</div>
              <div class="detail-value">${total}</div>
            </div>
          </div>
          <div class="actions">
            <a href="${manageUrl}" class="button">View / Manage Booking</a>
            <a href="${receiptUrl}" class="link">Download Receipt</a>
          </div>
          <p class="help-text">Need help? Reply to this email or contact support@hiddystays.com.</p>
        </div>
        <div class="footer">
          <div>© ${new Date().getFullYear()} HiddyStays. All rights reserved.</div>
          <div style="margin-top: 8px;">
            <a href="https://www.hiddystays.com">Website</a> •
            <a href="mailto:support@hiddystays.com">Support</a> •
            <a href="{{unsubscribe_url}}">Manage Preferences</a> •
            <a href="https://www.hiddystays.com/privacy">Privacy</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `Booking confirmed — ${propertyName} on ${checkIn}`,
    html,
  };
}

function generateHostNotificationEmail(data: EmailTemplateData): {
  subject: string;
  html: string;
} {
  const {
    hostName = "",
    guestName = "",
    propertyName = "",
    checkIn = "",
    checkOut = "",
    guests = 1,
    payout = "$0.00",
    approveUrl = "#",
    declineUrl = "#",
    detailsUrl = "#",
  } = data;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New booking request — ${propertyName}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 24px; background-color: #F8FAFC; }
        .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15,23,42,.06); }
        .header { padding: 24px 24px 12px; border-bottom: 1px solid #E2E8F0; }
        .logo { font-size: 20px; font-weight: 700; color: #0F172A; }
        .content { padding: 24px; }
        .title { color: #0F172A; font-size: 22px; margin: 0 0 16px 0; font-weight: 600; }
        .text { color: #64748B; line-height: 1.5; margin-bottom: 16px; }
        .details-card { border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .detail-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; font-size: 14px; }
        .detail-label { color: #64748B; }
        .detail-value { color: #0F172A; font-weight: 600; text-align: right; }
        .actions { display: flex; gap: 12px; margin-bottom: 12px; }
        .button { display: inline-block; background-color: #F97316; color: #FFFFFF; padding: 12px 20px; border-radius: 9999px; text-decoration: none; font-weight: 600; }
        .button-secondary { display: inline-block; padding: 12px 20px; border-radius: 9999px; text-decoration: none; border: 1px solid #E2E8F0; color: #0F172A; font-weight: 600; }
        .link { color: #0F172A; font-weight: 600; text-decoration: none; align-self: center; }
        .footer { padding: 16px; color: #64748B; font-size: 12px; border-top: 1px solid #E2E8F0; }
        .footer a { color: #0F172A; text-decoration: none; margin-left: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HiddyStays</div>
        </div>
        <div class="content">
          <h1 class="title">New booking request</h1>
          <p class="text">Hi ${hostName}, you have a new request for <strong>${propertyName}</strong>.</p>
          <div class="details-card">
            <div class="detail-row">
              <div class="detail-label">Guest</div>
              <div class="detail-value">${guestName}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Dates</div>
              <div class="detail-value">${checkIn} → ${checkOut}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Guests</div>
              <div class="detail-value">${guests}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Estimated payout</div>
              <div class="detail-value">${payout}</div>
            </div>
          </div>
          <div class="actions">
            <a href="${approveUrl}" class="button">Approve</a>
            <a href="${declineUrl}" class="button-secondary">Decline</a>
            <a href="${detailsUrl}" class="link">View details</a>
          </div>
        </div>
        <div class="footer">
          <div>© ${new Date().getFullYear()} HiddyStays. All rights reserved.</div>
          <div style="margin-top: 8px;">
            <a href="https://www.hiddystays.com">Website</a> •
            <a href="mailto:support@hiddystays.com">Support</a> •
            <a href="{{unsubscribe_url}}">Manage Preferences</a> •
            <a href="https://www.hiddystays.com/privacy">Privacy</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `New booking request — ${propertyName} on ${checkIn}`,
    html,
  };
}

// Email template router
function generateEmailTemplate(
  type: string,
  data: EmailTemplateData
): { subject: string; html: string } {
  switch (type) {
    case "welcome_verification":
      return generateWelcomeVerificationEmail(data);
    case "password_reset":
      return generatePasswordResetEmail(data);
    case "booking_confirmation":
      return generateBookingConfirmationEmail(data);
    case "host_notification":
      return generateHostNotificationEmail(data);
    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
}

// Helper function to get appropriate from address
function getFromAddress(type: string): string {
  switch (type) {
    case "welcome_verification":
      return "HiddyStays Welcome <welcome@hiddystays.com>";
    case "password_reset":
      return "HiddyStays Security <security@hiddystays.com>";
    case "booking_confirmation":
      return "HiddyStays Reservations <bookings@hiddystays.com>";
    case "host_notification":
      return "HiddyStays Notifications <notifications@hiddystays.com>";
    default:
      return "HiddyStays <noreply@hiddystays.com>";
  }
}

// Main function
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 Email service request received");

    const { type, to, data }: EmailRequest = await req.json();

    if (!to || !type) {
      throw new Error("Email address and type are required");
    }

    console.log(`📤 Generating ${type} email for ${to}`);

    const { subject, html } = generateEmailTemplate(type, data);

    console.log(`📬 Sending email with subject: ${subject}`);

    const result = await resend.emails.send({
      from: getFromAddress(type),
      to: [to],
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", result.data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: result.data?.id,
        type,
        subject,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
