import {
  Section,
  Text,
  Button,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface HostBookingNotificationProps {
  hostName: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  guests: number;
  bookingAmount: number;
  stripeFee: number;
  netAmount: number;
  bookingId: string;
  specialRequests?: string;
}

export const HostBookingNotification = ({
  hostName,
  propertyName,
  guestName,
  guestEmail,
  guestPhone,
  checkInDate,
  checkInTime,
  checkOutDate,
  checkOutTime,
  guests,
  bookingAmount,
  stripeFee,
  netAmount,
  bookingId,
  specialRequests,
}: HostBookingNotificationProps) => {
  return (
    <EmailLayout preview={`New booking for ${propertyName} - You earned $${netAmount}!`}>
      {/* Earnings Hero */}
      <Section style={earningsHero}>
        <Text style={heroEmoji}>💰</Text>
        <Text style={heroTitle}>New Booking!</Text>
        <Text style={heroAmount}>You earned ${netAmount.toFixed(2)}</Text>
      </Section>

      {/* Greeting */}
      <Section style={greetingSection}>
        <Text style={greeting}>Hey {hostName}! 🎉</Text>
        <Text style={mainMessage}>
          Fantastic news! You have a new booking for <strong>{propertyName}</strong>.
        </Text>
      </Section>

      {/* Guest Info Card */}
      <Section style={cardSection}>
        <Section style={infoCard}>
          <Text style={cardTitle}>👤 Guest Information</Text>
          <Text style={divider}>━━━━━━━━━━━━━━━━━━━━</Text>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Name:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{guestName}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Check-in:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{checkInDate}, {checkInTime}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Check-out:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{checkOutDate}, {checkOutTime}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Guests:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{guests}</Text>
            </Column>
          </Row>

          {guestPhone && (
            <Row style={detailRow}>
              <Column>
                <Text style={detailLabel}>Phone:</Text>
              </Column>
              <Column>
                <Text style={detailValue}>{guestPhone}</Text>
              </Column>
            </Row>
          )}

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Email:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{guestEmail}</Text>
            </Column>
          </Row>
        </Section>
      </Section>

      {/* Earnings Breakdown */}
      <Section style={earningsSection}>
        <Section style={earningsCard}>
          <Text style={earningsTitle}>💰 Your Earnings (100% Kept!)</Text>
          <Text style={divider}>━━━━━━━━━━━━━━━━━━━━</Text>

          <Row style={earningsRow}>
            <Column>
              <Text style={earningsLabel}>Booking Amount:</Text>
            </Column>
            <Column align="right">
              <Text style={earningsValue}>${bookingAmount.toFixed(2)}</Text>
            </Column>
          </Row>

          <Row style={earningsRow}>
            <Column>
              <Text style={earningsLabel}>Platform Fee:</Text>
            </Column>
            <Column align="right">
              <Text style={zeroFee}>$0.00 ✨</Text>
            </Column>
          </Row>

          <Row style={earningsRow}>
            <Column>
              <Text style={earningsLabel}>Payment Processing:</Text>
            </Column>
            <Column align="right">
              <Text style={earningsValue}>-${stripeFee.toFixed(2)}</Text>
            </Column>
          </Row>

          <Text style={divider}>━━━━━━━━━━━━━━━━━━━━</Text>

          <Row style={totalRow}>
            <Column>
              <Text style={totalLabel}>You Keep:</Text>
            </Column>
            <Column align="right">
              <Text style={totalValue}>${netAmount.toFixed(2)}</Text>
            </Column>
          </Row>

          <Text style={keepNote}>
            That's 100% of the booking amount!
          </Text>
          <Text style={keepNote}>
            No hidden fees. Ever.
          </Text>
        </Section>
      </Section>

      {/* Special Requests */}
      {specialRequests && (
        <Section style={requestsSection}>
          <Text style={requestsTitle}>💬 Special Requests</Text>
          <Text style={requestsText}>{specialRequests}</Text>
        </Section>
      )}

      {/* Next Steps */}
      <Section style={stepsSection}>
        <Text style={stepsTitle}>📋 Next Steps</Text>
        <Text style={stepText}>1. Review the booking details</Text>
        <Text style={stepText}>2. Prepare your property</Text>
        <Text style={stepText}>3. Send a welcome message to your guest</Text>
      </Section>

      {/* Action Buttons */}
      <Section style={ctaSection}>
        <Button
          href={`https://hiddystays.com/bookings/${bookingId}?utm_source=email&utm_medium=host_notification&utm_campaign=host_experience`}
          style={primaryButton}
        >
          View Booking
        </Button>
        <Button
          href={`mailto:${guestEmail}`}
          style={secondaryButton}
        >
          Contact Guest
        </Button>
      </Section>

      {/* Footer Message */}
      <Section style={footerMessageSection}>
        <Text style={footerMessageText}>
          Questions? We're here to help at{' '}
          <a href="mailto:admin@hiddystays.com" style={emailLink}>
            admin@hiddystays.com
          </a>
        </Text>
        <Text style={footerMessageText}>Cheers,</Text>
        <Text style={footerMessageText}>The HiddyStays Team</Text>
      </Section>
    </EmailLayout>
  );
};

export default HostBookingNotification;

// Styles
const earningsHero = {
  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  padding: '60px 30px',
  textAlign: 'center' as const,
};

const heroEmoji = {
  fontSize: '48px',
  margin: '0 0 16px 0',
};

const heroTitle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 8px 0',
};

const heroAmount = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
};

const greetingSection = {
  padding: '40px 30px 20px',
};

const greeting = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
};

const mainMessage = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#111827',
  margin: '0',
};

const cardSection = {
  padding: '0 30px 20px',
};

const infoCard = {
  backgroundColor: '#F9FAFB',
  borderRadius: '12px',
  padding: '30px',
};

const cardTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const divider = {
  fontSize: '14px',
  color: '#E5E7EB',
  margin: '12px 0',
  letterSpacing: '2px',
};

const detailRow = {
  margin: '8px 0',
};

const detailLabel = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0',
};

const detailValue = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#111827',
  margin: '0',
};

const earningsSection = {
  padding: '20px 30px',
};

const earningsCard = {
  backgroundColor: '#FEF3C7',
  borderRadius: '12px',
  padding: '30px',
};

const earningsTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const earningsRow = {
  margin: '12px 0',
};

const earningsLabel = {
  fontSize: '16px',
  color: '#111827',
  margin: '0',
};

const earningsValue = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#111827',
  margin: '0',
};

const zeroFee = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#10B981',
  margin: '0',
};

const totalRow = {
  margin: '16px 0 0 0',
};

const totalLabel = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0',
};

const totalValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#10B981',
  margin: '0',
};

const keepNote = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '8px 0 0 0',
  textAlign: 'center' as const,
};

const requestsSection = {
  padding: '20px 30px',
};

const requestsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const requestsText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0',
  backgroundColor: '#F9FAFB',
  padding: '16px',
  borderRadius: '8px',
};

const stepsSection = {
  padding: '20px 30px',
};

const stepsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const stepText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '4px 0',
};

const ctaSection = {
  padding: '40px 30px',
  textAlign: 'center' as const,
};

const primaryButton = {
  backgroundColor: '#10B981',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  borderRadius: '8px',
  margin: '0 8px 8px 8px',
};

const secondaryButton = {
  backgroundColor: '#1E3A5F',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  borderRadius: '8px',
  margin: '0 8px 8px 8px',
};

const footerMessageSection = {
  padding: '30px',
  textAlign: 'center' as const,
  borderTop: '1px solid #E5E7EB',
};

const footerMessageText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '8px 0',
};

const emailLink = {
  color: '#1E3A5F',
  textDecoration: 'none',
};
