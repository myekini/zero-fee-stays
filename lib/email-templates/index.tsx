import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface EmailTemplateProps {
  name?: string;
  email?: string;
  [key: string]: any;
}

// Base template with consistent branding (premium minimal)
const brand = "#1E3A5F"; // deep navy
const accent = "#F59E0B"; // amber
const textMain = "#0F172A"; // slate-900
const textMuted = "#475569"; // slate-600

export const BaseTemplate = ({
  children,
  preview,
  title,
}: {
  children: React.ReactNode;
  preview?: string;
  title?: string;
}) => (
  <Html>
    <Head />
    <Preview>{preview || title || ""}</Preview>
    <Tailwind>
      <Body style={{ backgroundColor: "#F7FAFC", margin: "0", fontFamily: 'Inter, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, margin: "40px auto", padding: 24, maxWidth: 600 }}>
          {/* Header */}
          <Section>
            <Row>
              <Column align="center">
                <Heading style={{ color: textMain, fontSize: 20, fontWeight: 800, margin: 0 }}>HiddyStays</Heading>
                <Text style={{ color: textMuted, fontSize: 12, margin: 4 }}>Direct stays. Zero fees.</Text>
              </Column>
            </Row>
          </Section>

          {/* Content */}
          <Section style={{ marginTop: 24 }}>{children}</Section>

          {/* Footer */}
          <Hr style={{ borderColor: "#E2E8F0", margin: "24px 0" }} />
          <Section>
            <Row>
              <Column align="center">
                <Text style={{ color: "#64748B", fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} HiddyStays</Text>
                <Text style={{ color: "#64748B", fontSize: 12, margin: 0 }}>hello@hiddystays.com</Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

// Welcome Email Template
export const WelcomeEmail = ({ name, email }: EmailTemplateProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://hiddystays.com";
  return (
    <BaseTemplate
      title="Welcome to HiddyStays!"
      preview="Your journey to authentic travel begins here"
    >
      <Heading style={{ color: textMain, fontSize: 20, fontWeight: 800, margin: 0 }}>
        Welcome to HiddyStays{name ? `, ${name}` : ''}
      </Heading>

      <Text style={{ color: textMuted, fontSize: 14, lineHeight: '22px' }}>
        Thanks for joining. Book direct and skip platform fees.
      </Text>

      <Section style={{ textAlign: 'center', margin: '20px 0' }}>
        <Button
          style={{ backgroundColor: brand, color: '#FFFFFF', padding: '10px 16px', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}
          href={`${baseUrl}/properties`}
        >
          Explore properties
        </Button>
      </Section>

      <Text style={{ color: textMuted, fontSize: 14 }}>Questions? Reply to this email.</Text>
    </BaseTemplate>
  );
};

// Booking Confirmation Template
export const BookingConfirmationEmail = ({
  guestName,
  propertyTitle,
  checkInDate,
  checkOutDate,
  guests,
  totalAmount,
  bookingId,
}: EmailTemplateProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://hiddystays.com";
  return (
    <BaseTemplate
      title="Booking Confirmed!"
      preview={`Your stay at ${propertyTitle} is confirmed`}
    >
      <Heading style={{ color: textMain, fontSize: 20, fontWeight: 800, margin: 0 }}>
        Booking confirmed
      </Heading>

      <Text style={{ color: textMuted, fontSize: 14 }}>
        Hi {guestName}, your booking at <strong>{propertyTitle}</strong> is confirmed.
      </Text>

      <Section style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, margin: '16px 0' }}>
        <Heading style={{ color: textMain, fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>
          Booking details
        </Heading>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Property:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">
              {propertyTitle}
            </Text>
          </Column>
        </Row>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Check-in:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">
              {checkInDate}
            </Text>
          </Column>
        </Row>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Check-out:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">
              {checkOutDate}
            </Text>
          </Column>
        </Row>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Guests:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">
              {guests}
            </Text>
          </Column>
        </Row>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Total:</Text>
          </Column>
          <Column>
            <Text style={{ color: brand, fontSize: 16, fontWeight: 700, margin: 0 }}>
              ${totalAmount}
            </Text>
          </Column>
        </Row>

        <Row>
          <Column>
            <Text className="text-sm text-gray-600 m-0">Booking ID:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-mono text-gray-900 m-0">
              #{bookingId}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section className="text-center my-8">
        <Button
          style={{ backgroundColor: brand, color: '#FFFFFF', padding: '10px 16px', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}
          href={`${baseUrl}/bookings/${bookingId}`}
        >
          View booking
        </Button>
      </Section>

      <Text style={{ color: textMuted, fontSize: 14 }}>
        Need help? Contact support@hiddystays.com
      </Text>
    </BaseTemplate>
  );
};

// Host Notification Template
export const HostNotificationEmail = ({
  hostName,
  guestName,
  propertyTitle,
  checkInDate,
  checkOutDate,
  guests,
  totalAmount,
  bookingId,
}: EmailTemplateProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://hiddystays.com";
  return (
    <BaseTemplate
      title="New Booking Received!"
      preview={`${guestName} booked your ${propertyTitle}`}
    >
      <Heading style={{ color: textMain, fontSize: 20, fontWeight: 800, margin: 0 }}>
        New booking received
      </Heading>

      <Text style={{ color: textMuted, fontSize: 14 }}>
        Hi {hostName}, you have a new booking for <strong>{propertyTitle}</strong>.
      </Text>

      <Section style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, margin: '16px 0' }}>
        <Heading className="text-lg font-semibold text-gray-900 m-0 mb-4">
          📋 Guest & Booking Information
        </Heading>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Guest:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">
              {guestName}
            </Text>
          </Column>
        </Row>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Property:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">
              {propertyTitle}
            </Text>
          </Column>
        </Row>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Check-in:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">
              {checkInDate}
            </Text>
          </Column>
        </Row>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Check-out:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">
              {checkOutDate}
            </Text>
          </Column>
        </Row>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Guests:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">
              {guests}
            </Text>
          </Column>
        </Row>

        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Earnings:</Text>
          </Column>
          <Column>
            <Text style={{ color: brand, fontSize: 16, fontWeight: 700, margin: 0 }}>
              ${totalAmount}
            </Text>
          </Column>
        </Row>

        <Row>
          <Column>
            <Text className="text-sm text-gray-600 m-0">Booking ID:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-mono text-gray-900 m-0">
              #{bookingId}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section className="text-center my-8">
        <Button
          style={{ backgroundColor: brand, color: '#FFFFFF', padding: '10px 16px', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}
          href={`${baseUrl}/host-dashboard?booking=${bookingId}`}
        >
          View booking
        </Button>
      </Section>

      <Text className="text-base text-gray-700 leading-6">
        Pro tip: Send a personal welcome message within 24 hours! Guests who
        receive a warm welcome are 73% more likely to leave 5-star reviews.
      </Text>

      <Text className="text-base text-gray-700 leading-6 font-semibold">
        Here's to another amazing authentic experience!
        <br />
        Your Host Success Team at HiddyStays 🌟
      </Text>
    </BaseTemplate>
  );
};

// Password Reset Template
export const PasswordResetEmail = ({ name, resetUrl }: EmailTemplateProps) => (
  <BaseTemplate
    title="Reset Your Password"
    preview="Reset your HiddyStays password"
  >
      <Heading style={{ color: textMain, fontSize: 20, fontWeight: 800, margin: 0 }}>
      Password reset
    </Heading>

    <Text className="text-base text-gray-700 leading-6">
      Hi {name}, we received a request to reset your password. If this was you,
      click the button below.
    </Text>

    <Section style={{ textAlign: 'center', margin: '20px 0' }}>
      <Button
        style={{ backgroundColor: brand, color: '#FFFFFF', padding: '10px 16px', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}
        href={resetUrl}
      >
        Reset password
      </Button>
    </Section>

    <Text className="text-sm text-gray-600 leading-6">
      This link expires in 30 minutes. If you didn't request this, you can
      ignore this email or contact support.
    </Text>

    <Text className="text-base text-gray-700 leading-6">
      Need help? Contact us at support@hiddystays.com
    </Text>
  </BaseTemplate>
);

// Check-in Reminder Template
export const CheckInReminderEmail = ({
  guestName,
  propertyTitle,
  checkInDate,
  checkInTime,
  hostName,
  hostPhone,
  propertyAddress,
  bookingId,
}: EmailTemplateProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://hiddystays.com";
  return (
    <BaseTemplate
      title="Check-in Reminder"
      preview={`Your stay at ${propertyTitle} starts soon`}
    >
      <Heading style={{ color: textMain, fontSize: 20, fontWeight: 800, margin: 0 }}>
        Check‑in reminder
      </Heading>

      <Text className="text-base text-gray-700 leading-6">
        Hi {guestName}, just a friendly reminder that your stay at <strong>{propertyTitle}</strong> starts soon.
      </Text>

      <Section style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, margin: '16px 0' }}>
        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Check-in date:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">{checkInDate}</Text>
          </Column>
        </Row>
        {checkInTime && (
          <Row className="mb-2">
            <Column>
              <Text className="text-sm text-gray-600 m-0">Check-in time:</Text>
            </Column>
            <Column>
              <Text className="text-sm font-semibold text-gray-900 m-0">{checkInTime}</Text>
            </Column>
          </Row>
        )}
        {propertyAddress && (
          <Row>
            <Column>
              <Text className="text-sm text-gray-600 m-0">Address:</Text>
            </Column>
            <Column>
              <Text className="text-sm font-semibold text-gray-900 m-0">{propertyAddress}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {hostName && (
        <Section style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, margin: '16px 0' }}>
          <Heading className="text-lg font-semibold text-gray-900 m-0 mb-4">Your Host</Heading>
          <Text className="text-sm text-gray-700 m-0"><strong>{hostName}</strong>{hostPhone ? ` • ${hostPhone}` : ""}</Text>
        </Section>
      )}

      <Section style={{ textAlign: 'center', margin: '20px 0' }}>
        <Button
          style={{ backgroundColor: brand, color: '#FFFFFF', padding: '10px 16px', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}
          href={`${baseUrl}/bookings/${bookingId}`}
        >
          View booking
        </Button>
      </Section>
    </BaseTemplate>
  );
};

// Booking Cancellation Template
export const BookingCancellationEmail = ({
  guestName,
  propertyTitle,
  checkInDate,
  checkOutDate,
  refundAmount,
  refundPercentage,
  cancellationReason,
  bookingId,
}: EmailTemplateProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://hiddystays.com";
  return (
    <BaseTemplate
      title="Booking Cancelled"
      preview={`Your booking at ${propertyTitle} has been cancelled`}
    >
      <Heading style={{ color: textMain, fontSize: 20, fontWeight: 800, margin: 0 }}>Booking cancelled</Heading>

      <Text className="text-base text-gray-700 leading-6">
        Hi {guestName}, your booking for <strong>{propertyTitle}</strong> has been cancelled.
      </Text>

      <Section style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: 16, margin: '16px 0' }}>
        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Check-in:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">{checkInDate}</Text>
          </Column>
        </Row>
        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Check-out:</Text>
          </Column>
          <Column>
            <Text className="text-sm font-semibold text-gray-900 m-0">{checkOutDate}</Text>
          </Column>
        </Row>
        {typeof refundAmount !== "undefined" && (
          <Row className="mb-2">
            <Column>
              <Text className="text-sm text-gray-600 m-0">Refund:</Text>
            </Column>
            <Column>
              <Text className="text-sm font-semibold text-gray-900 m-0">${'{'}refundAmount{'}'}{refundPercentage ? ` (${refundPercentage}%)` : ""}</Text>
            </Column>
          </Row>
        )}
        {cancellationReason && (
          <Row>
            <Column>
              <Text className="text-sm text-gray-600 m-0">Reason:</Text>
            </Column>
            <Column>
              <Text className="text-sm font-semibold text-gray-900 m-0">{cancellationReason}</Text>
            </Column>
          </Row>
        )}
      </Section>

      <Section style={{ textAlign: 'center', margin: '20px 0' }}>
        <Button style={{ backgroundColor: brand, color: '#FFFFFF', padding: '10px 16px', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }} href={`${baseUrl}/properties`}>
          Browse other stays
        </Button>
      </Section>
    </BaseTemplate>
  );
};

// Payment Receipt Template
export const PaymentReceiptEmail = ({
  guestName,
  propertyTitle,
  amountPaid,
  paymentDate,
  bookingId,
  receiptUrl,
}: EmailTemplateProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://hiddystays.com";
  return (
    <BaseTemplate
      title="Payment Receipt"
      preview={`Your payment for ${propertyTitle} was received`}
    >
      <Heading style={{ color: textMain, fontSize: 20, fontWeight: 800, margin: 0 }}>Payment receipt</Heading>

      <Text className="text-base text-gray-700 leading-6">
        Hi {guestName}, we've received your payment for <strong>{propertyTitle}</strong>.
      </Text>

      <Section style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, margin: '16px 0' }}>
        <Row className="mb-2">
          <Column>
            <Text className="text-sm text-gray-600 m-0">Amount:</Text>
          </Column>
          <Column>
            <Text style={{ color: brand, fontSize: 16, fontWeight: 700, margin: 0 }}>${'{'}amountPaid{'}'}</Text>
          </Column>
        </Row>
        {paymentDate && (
          <Row>
            <Column>
              <Text className="text-sm text-gray-600 m-0">Date:</Text>
            </Column>
            <Column>
              <Text className="text-sm font-semibold text-gray-900 m-0">{paymentDate}</Text>
            </Column>
          </Row>
        )}
      </Section>

      <Section style={{ textAlign: 'center', margin: '20px 0' }}>
        <Button
          style={{ backgroundColor: brand, color: '#FFFFFF', padding: '10px 16px', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}
          href={receiptUrl || `${baseUrl}/bookings/${bookingId}`}
        >
          View receipt
        </Button>
      </Section>
    </BaseTemplate>
  );
};

// Newsletter Subscription Template
export const NewsletterWelcomeEmail = ({ name, email }: EmailTemplateProps) => (
  <BaseTemplate
    title="Welcome to Our Newsletter!"
    preview="Stay updated with the latest travel tips and deals"
  >
      <Heading style={{ color: textMain, fontSize: 20, fontWeight: 800, margin: 0 }}>
      Welcome to our newsletter
    </Heading>

    <Text style={{ color: textMuted, fontSize: 14 }}>
      Thanks for subscribing. Expect occasional tips, deals, and new stays.
    </Text>

    <Section style={{ textAlign: 'center', margin: '20px 0' }}>
      <Button
        style={{ backgroundColor: brand, color: '#FFFFFF', padding: '10px 16px', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}
        href="/properties"
      >
        Explore properties
      </Button>
    </Section>

    <Text style={{ color: textMuted, fontSize: 14 }}>You can unsubscribe any time.</Text>
  </BaseTemplate>
);

// Export all templates
export const EmailTemplates = {
  WelcomeEmail,
  BookingConfirmationEmail,
  HostNotificationEmail,
  PasswordResetEmail,
  NewsletterWelcomeEmail,
  CheckInReminderEmail,
  BookingCancellationEmail,
  PaymentReceiptEmail,
};
