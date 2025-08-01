import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
  Row,
  Column,
} from "npm:@react-email/components@0.0.22";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'booking_confirmation' | 'host_notification' | 'payment_notification' | 'welcome_host' | 'check_in_reminder' | 'message_notification';
  to: string;
  data: Record<string, any>;
}

// Brand colors for BookDirect/HostDirect
const brandColors = {
  primary: '#0066CC',
  secondary: '#FF0000',
  background: '#f8fafc',
  white: '#ffffff',
  text: '#1e293b',
  muted: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

// React Email Template Components
const BookingConfirmationEmail = ({ booking, guest, property }: any) => {
  return React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Body, { style: { fontFamily: 'Inter, sans-serif', backgroundColor: brandColors.background } },
      React.createElement(Container, { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
        
        // Header
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px', backgroundColor: brandColors.white, padding: '20px', borderRadius: '8px' } },
          React.createElement(Text, { style: { fontSize: '28px', fontWeight: 'bold', color: brandColors.primary, margin: '0' } }, 'BookDirect'),
          React.createElement(Text, { style: { fontSize: '18px', color: brandColors.success, marginTop: '10px' } }, '✅ Booking Confirmed!')
        ),

        // Property Details
        React.createElement(Section, { style: { backgroundColor: brandColors.white, padding: '30px', borderRadius: '8px', marginBottom: '20px', border: `2px solid ${brandColors.primary}` } },
          React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: brandColors.text } }, property.name),
          React.createElement(Text, { style: { color: brandColors.muted, marginBottom: '20px', fontSize: '16px' } }, property.address),
          
          React.createElement(Row, { style: { marginBottom: '20px' } },
            React.createElement(Column, { style: { textAlign: 'center', padding: '10px', backgroundColor: brandColors.background, borderRadius: '6px', margin: '0 5px' } },
              React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0', fontSize: '14px' } }, 'Check-in'),
              React.createElement(Text, { style: { color: brandColors.primary, margin: '5px 0 0 0', fontSize: '16px', fontWeight: 'bold' } }, booking.checkIn)
            ),
            React.createElement(Column, { style: { textAlign: 'center', padding: '10px', backgroundColor: brandColors.background, borderRadius: '6px', margin: '0 5px' } },
              React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0', fontSize: '14px' } }, 'Check-out'),
              React.createElement(Text, { style: { color: brandColors.primary, margin: '5px 0 0 0', fontSize: '16px', fontWeight: 'bold' } }, booking.checkOut)
            ),
            React.createElement(Column, { style: { textAlign: 'center', padding: '10px', backgroundColor: brandColors.background, borderRadius: '6px', margin: '0 5px' } },
              React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0', fontSize: '14px' } }, 'Guests'),
              React.createElement(Text, { style: { color: brandColors.primary, margin: '5px 0 0 0', fontSize: '16px', fontWeight: 'bold' } }, booking.numGuests?.toString() || '1')
            )
          ),

          React.createElement(Section, { style: { backgroundColor: brandColors.background, padding: '15px', borderRadius: '6px', marginTop: '20px' } },
            React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0 0 5px 0' } }, 'Total Amount'),
            React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold', color: brandColors.success, margin: '0' } }, `$${booking.totalAmount} CAD`)
          )
        ),

        // Host Contact
        React.createElement(Section, { style: { backgroundColor: brandColors.white, padding: '20px', borderRadius: '8px', marginBottom: '20px' } },
          React.createElement(Text, { style: { fontWeight: 'bold', marginBottom: '15px', color: brandColors.text, fontSize: '18px' } }, '👤 Your Host'),
          React.createElement(Text, { style: { margin: '5px 0', color: brandColors.text } }, `Name: ${property.host?.name || 'BookDirect Team'}`),
          React.createElement(Text, { style: { margin: '5px 0', color: brandColors.text } }, `Email: ${property.host?.email || 'support@bookdirect.ca'}`),
          React.createElement(Text, { style: { margin: '5px 0', color: brandColors.text } }, `Phone: ${property.host?.phone || 'Available via platform'}`)
        ),

        // Action Button
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px' } },
          React.createElement(Button, {
            href: `https://bookdirect.ca/booking/${booking.id}`,
            style: {
              backgroundColor: brandColors.primary,
              color: brandColors.white,
              padding: '15px 30px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'inline-block'
            }
          }, 'View Booking Details')
        ),

        // Footer
        React.createElement(Section, { style: { textAlign: 'center', padding: '20px', backgroundColor: brandColors.white, borderRadius: '8px', color: brandColors.muted, fontSize: '14px' } },
          React.createElement(Text, { style: { margin: '0' } }, 'Questions? Contact us at support@bookdirect.ca'),
          React.createElement(Text, { style: { margin: '10px 0 0 0' } }, '🍁 Proudly Canadian • BookDirect.ca')
        )
      )
    )
  );
};

const HostNotificationEmail = ({ booking, host, property }: any) => {
  return React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Body, { style: { fontFamily: 'Inter, sans-serif', backgroundColor: brandColors.background } },
      React.createElement(Container, { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
        
        // Header
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px', backgroundColor: brandColors.white, padding: '20px', borderRadius: '8px' } },
          React.createElement(Text, { style: { fontSize: '28px', fontWeight: 'bold', color: brandColors.primary, margin: '0' } }, 'BookDirect'),
          React.createElement(Text, { style: { fontSize: '18px', color: brandColors.warning, marginTop: '10px' } }, '🔔 New Booking Request!')
        ),

        // Urgent Alert
        React.createElement(Section, { style: { backgroundColor: brandColors.warning, padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' } },
          React.createElement(Text, { style: { color: brandColors.white, fontWeight: 'bold', margin: '0', fontSize: '16px' } }, 'ACTION REQUIRED: Please review and respond promptly')
        ),

        // Booking Details
        React.createElement(Section, { style: { backgroundColor: brandColors.white, padding: '30px', borderRadius: '8px', marginBottom: '20px', border: `2px solid ${brandColors.warning}` } },
          React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: brandColors.text } }, property.name),
          
          React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, fontSize: '18px', marginBottom: '10px' } }, '👤 Guest Information'),
          React.createElement(Text, { style: { margin: '5px 0', color: brandColors.text } }, `Name: ${booking.guestName}`),
          React.createElement(Text, { style: { margin: '5px 0', color: brandColors.text } }, `Email: ${booking.guestEmail}`),
          React.createElement(Text, { style: { margin: '5px 0 20px 0', color: brandColors.text } }, `Phone: ${booking.guestPhone || 'Not provided'}`),
          
          React.createElement(Row, { style: { marginBottom: '20px' } },
            React.createElement(Column, { style: { textAlign: 'center', padding: '10px', backgroundColor: brandColors.background, borderRadius: '6px', margin: '0 5px' } },
              React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0', fontSize: '14px' } }, 'Check-in'),
              React.createElement(Text, { style: { color: brandColors.primary, margin: '5px 0 0 0', fontSize: '16px', fontWeight: 'bold' } }, booking.checkIn)
            ),
            React.createElement(Column, { style: { textAlign: 'center', padding: '10px', backgroundColor: brandColors.background, borderRadius: '6px', margin: '0 5px' } },
              React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0', fontSize: '14px' } }, 'Check-out'),
              React.createElement(Text, { style: { color: brandColors.primary, margin: '5px 0 0 0', fontSize: '16px', fontWeight: 'bold' } }, booking.checkOut)
            ),
            React.createElement(Column, { style: { textAlign: 'center', padding: '10px', backgroundColor: brandColors.background, borderRadius: '6px', margin: '0 5px' } },
              React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0', fontSize: '14px' } }, 'Revenue'),
              React.createElement(Text, { style: { color: brandColors.success, margin: '5px 0 0 0', fontSize: '16px', fontWeight: 'bold' } }, `$${booking.totalAmount} CAD`)
            )
          ),

          booking.specialRequests && React.createElement(Section, { style: { backgroundColor: brandColors.background, padding: '15px', borderRadius: '6px', marginTop: '20px' } },
            React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0 0 5px 0' } }, '📝 Special Requests'),
            React.createElement(Text, { style: { color: brandColors.text, margin: '0' } }, booking.specialRequests)
          )
        ),

        // Action Buttons
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px' } },
          React.createElement(Row, {},
            React.createElement(Column, { style: { textAlign: 'center' } },
              React.createElement(Button, {
                href: `https://bookdirect.ca/admin/bookings/${booking.id}/approve`,
                style: {
                  backgroundColor: brandColors.success,
                  color: brandColors.white,
                  padding: '15px 25px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'inline-block',
                  margin: '0 10px'
                }
              }, '✅ Approve Booking')
            ),
            React.createElement(Column, { style: { textAlign: 'center' } },
              React.createElement(Button, {
                href: `https://bookdirect.ca/admin/bookings/${booking.id}/decline`,
                style: {
                  backgroundColor: brandColors.error,
                  color: brandColors.white,
                  padding: '15px 25px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'inline-block',
                  margin: '0 10px'
                }
              }, '❌ Decline Booking')
            )
          )
        ),

        // Footer
        React.createElement(Section, { style: { textAlign: 'center', padding: '20px', backgroundColor: brandColors.white, borderRadius: '8px', color: brandColors.muted, fontSize: '14px' } },
          React.createElement(Text, { style: { margin: '0' } }, 'Manage all bookings in your admin dashboard'),
          React.createElement(Text, { style: { margin: '10px 0 0 0' } }, '🍁 BookDirect Admin Portal')
        )
      )
    )
  );
};

const PaymentNotificationEmail = ({ payment, host }: any) => {
  return React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Body, { style: { fontFamily: 'Inter, sans-serif', backgroundColor: brandColors.background } },
      React.createElement(Container, { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
        
        // Header
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px', backgroundColor: brandColors.white, padding: '20px', borderRadius: '8px' } },
          React.createElement(Text, { style: { fontSize: '28px', fontWeight: 'bold', color: brandColors.primary, margin: '0' } }, 'BookDirect'),
          React.createElement(Text, { style: { fontSize: '18px', color: brandColors.success, marginTop: '10px' } }, '💰 Payment Received!')
        ),

        // Payment Details
        React.createElement(Section, { style: { backgroundColor: brandColors.white, padding: '30px', borderRadius: '8px', marginBottom: '20px', border: `2px solid ${brandColors.success}` } },
          React.createElement(Text, { style: { fontSize: '32px', fontWeight: 'bold', textAlign: 'center', color: brandColors.success, margin: '0 0 20px 0' } }, `$${payment.amount} CAD`),
          React.createElement(Text, { style: { textAlign: 'center', color: brandColors.text, fontSize: '16px', margin: '0 0 20px 0' } }, `Payment ID: ${payment.id}`),
          React.createElement(Text, { style: { textAlign: 'center', color: brandColors.muted, fontSize: '14px', margin: '0' } }, `Received on ${new Date(payment.createdAt).toLocaleDateString()}`)
        ),

        // Action Button
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px' } },
          React.createElement(Button, {
            href: 'https://bookdirect.ca/admin/payments',
            style: {
              backgroundColor: brandColors.primary,
              color: brandColors.white,
              padding: '15px 30px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'inline-block'
            }
          }, 'View Payment Dashboard')
        ),

        // Footer
        React.createElement(Section, { style: { textAlign: 'center', padding: '20px', backgroundColor: brandColors.white, borderRadius: '8px', color: brandColors.muted, fontSize: '14px' } },
          React.createElement(Text, { style: { margin: '0' } }, 'Track all your earnings at bookdirect.ca'),
          React.createElement(Text, { style: { margin: '10px 0 0 0' } }, '🍁 Your Canadian Vacation Rental Partner')
        )
      )
    )
  );
};

const WelcomeHostEmail = ({ host }: any) => {
  return React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Body, { style: { fontFamily: 'Inter, sans-serif', backgroundColor: brandColors.background } },
      React.createElement(Container, { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
        
        // Header
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px', backgroundColor: brandColors.white, padding: '30px', borderRadius: '8px' } },
          React.createElement(Text, { style: { fontSize: '32px', fontWeight: 'bold', color: brandColors.primary, margin: '0' } }, 'Welcome to BookDirect! 🍁'),
          React.createElement(Text, { style: { fontSize: '18px', color: brandColors.text, marginTop: '10px' } }, `Hi ${host.name}, let's get you started!`)
        ),

        // Welcome Message
        React.createElement(Section, { style: { backgroundColor: brandColors.white, padding: '30px', borderRadius: '8px', marginBottom: '20px' } },
          React.createElement(Text, { style: { fontSize: '18px', color: brandColors.text, lineHeight: '1.6', margin: '0 0 20px 0' } }, 
            'Welcome to Canada\'s premier vacation rental platform! We\'re excited to help you maximize your property\'s potential and connect with amazing guests.'
          ),
          
          React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, fontSize: '16px', margin: '20px 0 10px 0' } }, '🎯 Here\'s what you can do next:'),
          React.createElement(Text, { style: { color: brandColors.text, margin: '5px 0 5px 20px' } }, '• Complete your profile setup'),
          React.createElement(Text, { style: { color: brandColors.text, margin: '5px 0 5px 20px' } }, '• Add stunning photos of your property'),
          React.createElement(Text, { style: { color: brandColors.text, margin: '5px 0 5px 20px' } }, '• Set your availability and pricing'),
          React.createElement(Text, { style: { color: brandColors.text, margin: '5px 0 5px 20px' } }, '• Start receiving bookings!')
        ),

        // Action Buttons
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px' } },
          React.createElement(Button, {
            href: 'https://bookdirect.ca/admin/dashboard',
            style: {
              backgroundColor: brandColors.primary,
              color: brandColors.white,
              padding: '15px 30px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'inline-block',
              margin: '0 10px'
            }
          }, 'Complete Setup'),
          React.createElement(Button, {
            href: 'https://bookdirect.ca/help',
            style: {
              backgroundColor: brandColors.white,
              color: brandColors.primary,
              padding: '15px 30px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'inline-block',
              margin: '0 10px',
              border: `2px solid ${brandColors.primary}`
            }
          }, 'Get Help')
        ),

        // Footer
        React.createElement(Section, { style: { textAlign: 'center', padding: '20px', backgroundColor: brandColors.white, borderRadius: '8px', color: brandColors.muted, fontSize: '14px' } },
          React.createElement(Text, { style: { margin: '0' } }, 'Need assistance? Contact our Canadian support team'),
          React.createElement(Text, { style: { margin: '5px 0 0 0' } }, 'support@bookdirect.ca • 1-800-BOOK-DIRECT'),
          React.createElement(Text, { style: { margin: '10px 0 0 0' } }, '🍁 Proudly serving Canadian hosts since 2024')
        )
      )
    )
  );
};

const CheckInReminderEmail = ({ booking, guest, property }: any) => {
  return React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Body, { style: { fontFamily: 'Inter, sans-serif', backgroundColor: brandColors.background } },
      React.createElement(Container, { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
        
        // Header
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px', backgroundColor: brandColors.white, padding: '20px', borderRadius: '8px' } },
          React.createElement(Text, { style: { fontSize: '28px', fontWeight: 'bold', color: brandColors.primary, margin: '0' } }, 'BookDirect'),
          React.createElement(Text, { style: { fontSize: '18px', color: brandColors.warning, marginTop: '10px' } }, '🎒 Check-in Tomorrow!')
        ),

        // Check-in Details
        React.createElement(Section, { style: { backgroundColor: brandColors.white, padding: '30px', borderRadius: '8px', marginBottom: '20px', border: `2px solid ${brandColors.warning}` } },
          React.createElement(Text, { style: { fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: brandColors.text } }, property.name),
          React.createElement(Text, { style: { color: brandColors.muted, marginBottom: '20px', fontSize: '16px' } }, property.address),
          
          React.createElement(Section, { style: { backgroundColor: brandColors.background, padding: '20px', borderRadius: '8px', marginBottom: '20px' } },
            React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0 0 10px 0', fontSize: '18px' } }, '📅 Check-in Information'),
            React.createElement(Text, { style: { margin: '5px 0', color: brandColors.text } }, `Date: ${booking.checkIn}`),
            React.createElement(Text, { style: { margin: '5px 0', color: brandColors.text } }, `Time: ${booking.checkInTime || '3:00 PM'}`),
            React.createElement(Text, { style: { margin: '5px 0', color: brandColors.text } }, `Guests: ${booking.numGuests}`)
          ),

          booking.checkInInstructions && React.createElement(Section, { style: { backgroundColor: brandColors.background, padding: '15px', borderRadius: '6px' } },
            React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0 0 10px 0' } }, '📋 Check-in Instructions'),
            React.createElement(Text, { style: { color: brandColors.text, margin: '0', lineHeight: '1.6' } }, booking.checkInInstructions)
          )
        ),

        // Host Contact
        React.createElement(Section, { style: { backgroundColor: brandColors.white, padding: '20px', borderRadius: '8px', marginBottom: '20px' } },
          React.createElement(Text, { style: { fontWeight: 'bold', marginBottom: '15px', color: brandColors.text, fontSize: '18px' } }, '📞 Host Contact'),
          React.createElement(Text, { style: { margin: '5px 0', color: brandColors.text } }, `${property.host?.name || 'BookDirect Team'}`),
          React.createElement(Text, { style: { margin: '5px 0', color: brandColors.text } }, `${property.host?.phone || 'Available via platform'}`)
        ),

        // Footer
        React.createElement(Section, { style: { textAlign: 'center', padding: '20px', backgroundColor: brandColors.white, borderRadius: '8px', color: brandColors.muted, fontSize: '14px' } },
          React.createElement(Text, { style: { margin: '0' } }, 'Have a wonderful stay! 🇨🇦'),
          React.createElement(Text, { style: { margin: '10px 0 0 0' } }, 'Questions? Message your host via BookDirect')
        )
      )
    )
  );
};

const MessageNotificationEmail = ({ message, sender, recipient }: any) => {
  return React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Body, { style: { fontFamily: 'Inter, sans-serif', backgroundColor: brandColors.background } },
      React.createElement(Container, { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
        
        // Header
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px', backgroundColor: brandColors.white, padding: '20px', borderRadius: '8px' } },
          React.createElement(Text, { style: { fontSize: '28px', fontWeight: 'bold', color: brandColors.primary, margin: '0' } }, 'BookDirect'),
          React.createElement(Text, { style: { fontSize: '18px', color: '#8b5cf6', marginTop: '10px' } }, '💬 New Message!')
        ),

        // Message Details
        React.createElement(Section, { style: { backgroundColor: brandColors.white, padding: '30px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #8b5cf6' } },
          React.createElement(Text, { style: { fontWeight: 'bold', color: brandColors.text, margin: '0 0 15px 0', fontSize: '18px' } }, `Message from ${sender.name}`),
          React.createElement(Section, { style: { backgroundColor: brandColors.background, padding: '20px', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' } },
            React.createElement(Text, { style: { color: brandColors.text, margin: '0', lineHeight: '1.6', fontStyle: 'italic' } }, `"${message.content}"`)
          ),
          React.createElement(Text, { style: { color: brandColors.muted, margin: '15px 0 0 0', fontSize: '14px' } }, `Sent on ${new Date(message.createdAt).toLocaleDateString()}`)
        ),

        // Action Button
        React.createElement(Section, { style: { textAlign: 'center', marginBottom: '30px' } },
          React.createElement(Button, {
            href: `https://bookdirect.ca/messages/${message.conversationId}`,
            style: {
              backgroundColor: '#8b5cf6',
              color: brandColors.white,
              padding: '15px 30px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'inline-block'
            }
          }, 'Reply to Message')
        ),

        // Footer
        React.createElement(Section, { style: { textAlign: 'center', padding: '20px', backgroundColor: brandColors.white, borderRadius: '8px', color: brandColors.muted, fontSize: '14px' } },
          React.createElement(Text, { style: { margin: '0' } }, 'Keep the conversation going on BookDirect'),
          React.createElement(Text, { style: { margin: '10px 0 0 0' } }, '🍁 Connecting Canadians through travel')
        )
      )
    )
  );
};

// Email rendering function
async function renderEmailTemplate(type: string, data: any): Promise<{ subject: string; html: string }> {
  let component;
  let subject;

  switch (type) {
    case 'booking_confirmation':
      component = BookingConfirmationEmail(data);
      subject = `Booking Confirmed - ${data.property?.name || 'Your Reservation'}`;
      break;
    case 'host_notification':
      component = HostNotificationEmail(data);
      subject = `New Booking Request - ${data.property?.name || 'Your Property'}`;
      break;
    case 'payment_notification':
      component = PaymentNotificationEmail(data);
      subject = `Payment Received - $${data.payment?.amount || '0'} CAD`;
      break;
    case 'welcome_host':
      component = WelcomeHostEmail(data);
      subject = `Welcome to BookDirect - Let's Get Started! 🍁`;
      break;
    case 'check_in_reminder':
      component = CheckInReminderEmail(data);
      subject = `Check-in Tomorrow - ${data.property?.name || 'Your Stay'}`;
      break;
    case 'message_notification':
      component = MessageNotificationEmail(data);
      subject = `New Message from ${data.sender?.name || 'BookDirect User'}`;
      break;
    default:
      throw new Error(`Unknown email template type: ${type}`);
  }

  const html = await renderAsync(component);
  return { subject, html };
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

    console.log(`📤 Rendering ${type} email for ${to}`);
    
    const { subject, html } = await renderEmailTemplate(type, data);
    
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
        subject 
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
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper function to get appropriate from address
function getFromAddress(type: string): string {
  switch (type) {
    case 'booking_confirmation':
      return 'BookDirect Bookings <bookings@bookdirect.ca>';
    case 'host_notification':
      return 'BookDirect Notifications <notifications@bookdirect.ca>';
    case 'payment_notification':
      return 'BookDirect Payments <payments@bookdirect.ca>';
    case 'welcome_host':
      return 'BookDirect Welcome <welcome@bookdirect.ca>';
    case 'check_in_reminder':
      return 'BookDirect Travel <travel@bookdirect.ca>';
    case 'message_notification':
      return 'BookDirect Messages <messages@bookdirect.ca>';
    default:
      return 'BookDirect <noreply@bookdirect.ca>';
  }
}