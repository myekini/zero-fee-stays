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

// Base template with consistent branding
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
    <Preview>
      {(preview || title || "")
        .split(" ")
        .map(
          (word, index) =>
            word +
            (index < (preview || title || "").split(" ").length - 1 ? " " : "")
        )}
    </Preview>
    <Tailwind>
      <Body className="bg-gray-50 my-auto mx-auto font-sans">
        <Container className="border border-solid border-gray-200 rounded-lg my-[40px] mx-auto p-[20px] max-w-[600px]">
          {/* Header */}
          <Section className="mt-[32px]">
            <Row>
              <Column align="center">
                <Heading className="text-2xl font-bold text-gray-900 m-0">
                  🏡 HiddyStays
                </Heading>
                <Text className="text-sm text-gray-600 m-0">
                  Stay Direct. Save More. Experience Authentic.
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Content */}
          <Section className="mt-[32px]">{children}</Section>

          {/* Footer */}
          <Hr className="border border-solid border-gray-200 my-[26px] mx-0 w-full" />
          <Section>
            <Row>
              <Column align="center">
                <Text className="text-xs text-gray-500 m-0">
                  © 2024 HiddyStays. All rights reserved.
                </Text>
                <Text className="text-xs text-gray-500 m-0">
                  📧 hello@hiddystays.com | 📞 1-800-HIDDY-STAY
                </Text>
                <Text className="text-xs text-gray-500 m-0">
                  <Link href="#" className="text-gray-500">
                    Unsubscribe
                  </Link>{" "}
                  |
                  <Link href="#" className="text-gray-500">
                    {" "}
                    Update Preferences
                  </Link>
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

// Welcome Email Template
export const WelcomeEmail = ({ name, email }: EmailTemplateProps) => (
  <BaseTemplate
    title="Welcome to HiddyStays!"
    preview="Your journey to authentic travel begins here"
  >
    <Heading className="text-2xl font-bold text-gray-900 m-0">
      Welcome to HiddyStays, {name}! 🎉
    </Heading>

    <Text className="text-base text-gray-700 leading-6">
      Thank you for joining our community of smart travelers who value authentic
      experiences and zero platform fees.
    </Text>

    <Section className="bg-orange-50 border-l-4 border-orange-400 p-4 my-6">
      <Text className="text-orange-800 font-semibold m-0">
        🎁 Special Welcome Offer
      </Text>
      <Text className="text-orange-700 m-0">
        Save $50 on your first booking with code <strong>WELCOME50</strong>
      </Text>
    </Section>

    <Section className="text-center my-8">
      <Button
        className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg no-underline"
        href="/properties"
      >
        🏡 Explore Properties
      </Button>
    </Section>

    <Text className="text-base text-gray-700 leading-6">
      Over the next few days, we'll share insider tips on finding the perfect
      authentic stay and getting the most value from direct bookings.
    </Text>

    <Text className="text-base text-gray-700 leading-6">
      Questions? Just reply to this email - we read every message personally! 😊
    </Text>

    <Text className="text-base text-gray-700 leading-6 font-semibold">
      Welcome aboard!
      <br />
      Sarah Chen
      <br />
      <span className="font-normal text-gray-600">
        Community Manager, HiddyStays
      </span>
    </Text>
  </BaseTemplate>
);

// Booking Confirmation Template
export const BookingConfirmationEmail = ({
  guestName,
  propertyTitle,
  checkInDate,
  checkOutDate,
  guests,
  totalAmount,
  bookingId,
}: EmailTemplateProps) => (
  <BaseTemplate
    title="Booking Confirmed!"
    preview={`Your stay at ${propertyTitle} is confirmed`}
  >
    <Heading className="text-2xl font-bold text-gray-900 m-0">
      Booking Confirmed! 🎊
    </Heading>

    <Text className="text-base text-gray-700 leading-6">
      Fantastic news, {guestName}! Your booking at{" "}
      <strong>{propertyTitle}</strong> is officially confirmed.
    </Text>

    <Section className="bg-green-50 border border-green-200 rounded-lg p-6 my-6">
      <Heading className="text-lg font-semibold text-gray-900 m-0 mb-4">
        🏡 Booking Details
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
          <Text className="text-lg font-bold text-green-600 m-0">
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
        className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg no-underline"
        href={`/bookings/${bookingId}`}
      >
        📱 View Booking Details
      </Button>
    </Section>

    <Text className="text-base text-gray-700 leading-6">
      Need help or have questions? Our support team is here to help!
    </Text>

    <Text className="text-base text-gray-700 leading-6 font-semibold">
      Can't wait for your authentic stay experience!
      <br />
      The HiddyStays Team
    </Text>
  </BaseTemplate>
);

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
}: EmailTemplateProps) => (
  <BaseTemplate
    title="New Booking Received!"
    preview={`${guestName} booked your ${propertyTitle}`}
  >
    <Heading className="text-2xl font-bold text-gray-900 m-0">
      New Booking Received! 🎉
    </Heading>

    <Text className="text-base text-gray-700 leading-6">
      Fantastic news, {hostName}! You've received a new booking for{" "}
      <strong>{propertyTitle}</strong>.
    </Text>

    <Section className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6">
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
          <Text className="text-lg font-bold text-green-600 m-0">
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
        className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg no-underline"
        href={`/host/bookings/${bookingId}`}
      >
        📱 View Booking Details
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

// Password Reset Template
export const PasswordResetEmail = ({ name, resetUrl }: EmailTemplateProps) => (
  <BaseTemplate
    title="Reset Your Password"
    preview="Reset your HiddyStays password"
  >
    <Heading className="text-2xl font-bold text-gray-900 m-0">
      Password Reset Request
    </Heading>

    <Text className="text-base text-gray-700 leading-6">
      Hi {name}, we received a request to reset your password. If this was you,
      click the button below.
    </Text>

    <Section className="text-center my-8">
      <Button
        className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg no-underline"
        href={resetUrl}
      >
        🔒 Reset Password
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

// Newsletter Subscription Template
export const NewsletterWelcomeEmail = ({ name, email }: EmailTemplateProps) => (
  <BaseTemplate
    title="Welcome to Our Newsletter!"
    preview="Stay updated with the latest travel tips and deals"
  >
    <Heading className="text-2xl font-bold text-gray-900 m-0">
      Welcome to Our Newsletter! 📧
    </Heading>

    <Text className="text-base text-gray-700 leading-6">
      Hi {name}, thank you for subscribing to our newsletter! You'll now
      receive:
    </Text>

    <Section className="bg-orange-50 border-l-4 border-orange-400 p-4 my-6">
      <Text className="text-orange-800 font-semibold m-0 mb-2">
        🎯 What you'll get:
      </Text>
      <Text className="text-orange-700 m-0 text-sm">
        • Exclusive travel deals and discounts
        <br />
        • Insider tips for authentic stays
        <br />
        • New property announcements
        <br />• Travel inspiration and guides
      </Text>
    </Section>

    <Section className="text-center my-8">
      <Button
        className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg no-underline"
        href="/properties"
      >
        🏡 Explore Properties
      </Button>
    </Section>

    <Text className="text-base text-gray-700 leading-6">
      We promise to only send you valuable content and never spam your inbox.
    </Text>

    <Text className="text-base text-gray-700 leading-6">
      Happy travels!
      <br />
      The HiddyStays Team
    </Text>
  </BaseTemplate>
);

// Export all templates
export const EmailTemplates = {
  WelcomeEmail,
  BookingConfirmationEmail,
  HostNotificationEmail,
  PasswordResetEmail,
  NewsletterWelcomeEmail,
};
