import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

const getEmailTemplate = (template: string, data: Record<string, any>) => {
  switch (template) {
    case 'booking_confirmation_guest':
      return {
        subject: `Booking Confirmation - ${data.propertyTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #1e293b; margin: 0;">BookDirect</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Booking Confirmed!</h2>
              
              <p style="color: #64748b; line-height: 1.6;">
                Great news! Your booking has been confirmed. Here are your booking details:
              </p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">${data.propertyTitle}</h3>
                <p style="margin: 5px 0;"><strong>Guest:</strong> ${data.guestName}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${data.checkInDate}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${data.checkOutDate}</p>
                <p style="margin: 5px 0;"><strong>Guests:</strong> ${data.guestsCount}</p>
                <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${data.totalAmount} CAD</p>
              </div>
              
              <h3 style="color: #1e293b;">What's Next?</h3>
              <ul style="color: #64748b; line-height: 1.6;">
                <li>You'll receive check-in instructions 24 hours before arrival</li>
                <li>Your host may contact you with additional information</li>
                <li>Feel free to message your host if you have any questions</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.propertyUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Booking Details
                </a>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Need help? Contact us at support@bookdirect.com</p>
            </div>
          </div>
        `
      };

    case 'new_booking_host':
      return {
        subject: `New Booking Request - ${data.propertyTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #1e293b; margin: 0;">BookDirect</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">New Booking Request</h2>
              
              <p style="color: #64748b; line-height: 1.6;">
                You have a new booking request for your property. Please review and respond promptly.
              </p>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #1e293b; margin-top: 0;">${data.propertyTitle}</h3>
                <p style="margin: 5px 0;"><strong>Guest:</strong> ${data.guestName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${data.guestEmail}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.guestPhone || 'Not provided'}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${data.checkInDate}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${data.checkOutDate}</p>
                <p style="margin: 5px 0;"><strong>Guests:</strong> ${data.guestsCount}</p>
                <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${data.totalAmount} CAD</p>
              </div>
              
              ${data.specialRequests ? `
                <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                  <strong>Special Requests:</strong>
                  <p style="margin: 5px 0 0 0;">${data.specialRequests}</p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                  Approve Booking
                </a>
                <a href="${data.dashboardUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Decline Booking
                </a>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Manage all your bookings at your host dashboard</p>
            </div>
          </div>
        `
      };

    case 'check_in_reminder':
      return {
        subject: `Check-in Tomorrow - ${data.propertyTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #1e293b; margin: 0;">BookDirect</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Check-in Tomorrow!</h2>
              
              <p style="color: #64748b; line-height: 1.6;">
                Your stay at <strong>${data.propertyTitle}</strong> begins tomorrow. Here are your check-in details:
              </p>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e293b; margin-top: 0;">Check-in Information</h3>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${data.checkInDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${data.checkInTime || '3:00 PM'}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${data.propertyAddress}</p>
              </div>
              
              <h3 style="color: #1e293b;">Check-in Instructions</h3>
              <div style="color: #64748b; line-height: 1.6;">
                ${data.checkInInstructions || `
                  <p>1. Arrive at the specified check-in time</p>
                  <p>2. Contact your host upon arrival</p>
                  <p>3. Complete the check-in process</p>
                  <p>4. Enjoy your stay!</p>
                `}
              </div>
              
              <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>Host Contact:</strong>
                <p style="margin: 5px 0 0 0;">Name: ${data.hostName}</p>
                <p style="margin: 5px 0 0 0;">Phone: ${data.hostPhone || 'Available through platform'}</p>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Have questions? Message your host directly through the platform</p>
            </div>
          </div>
        `
      };

    case 'new_message_notification':
      return {
        subject: `New Message from ${data.senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #1e293b; margin: 0;">BookDirect</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">New Message</h2>
              
              <p style="color: #64748b; line-height: 1.6;">
                You have a new message from <strong>${data.senderName}</strong> regarding your booking at <strong>${data.propertyTitle}</strong>.
              </p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
                <p style="margin: 0; font-style: italic;">"${data.messageContent}"</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.conversationUrl}" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Reply to Message
                </a>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>Keep the conversation going on BookDirect</p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: 'BookDirect Notification',
        html: '<p>Default email template</p>'
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 Email notification request received");
    
    const { to, subject, template, data }: EmailRequest = await req.json();
    
    if (!to || !template) {
      throw new Error("Email address and template are required");
    }

    const emailTemplate = getEmailTemplate(template, data);
    
    console.log(`📤 Sending ${template} email to ${to}`);
    
    const result = await resend.emails.send({
      from: "BookDirect <bookings@yourdomain.com>",
      to: [to],
      subject: subject || emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("✅ Email sent successfully:", result.data?.id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: result.data?.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});