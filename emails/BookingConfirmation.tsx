import {
  Section,
  Text,
  Img,
  Button,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface BookingConfirmationProps {
  guestName: string;
  propertyName: string;
  propertyImage: string;
  propertyAddress: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  guests: number;
  totalAmount: number;
  bookingId: string;
  hostName: string;
  hostAvatar?: string;
  hostEmail: string;
  specialInstructions?: string;
  googleMapsUrl: string;
}

export const BookingConfirmation = ({
  guestName,
  propertyName,
  propertyImage,
  propertyAddress,
  checkInDate,
  checkInTime,
  checkOutDate,
  checkOutTime,
  guests,
  totalAmount,
  bookingId,
  hostName,
  hostAvatar,
  hostEmail,
  specialInstructions,
  googleMapsUrl,
}: BookingConfirmationProps) => {
  return (
    <EmailLayout preview={`Your stay at ${propertyName} is confirmed!`}>
      {/* Hero Image */}
      <Section style={heroSection}>
        <Img
          src={propertyImage}
          alt={propertyName}
          width="600"
          height="300"
          style={heroImage}
        />
      </Section>

      {/* Greeting */}
      <Section style={greetingSection}>
        <Text style={greeting}>Hey {guestName}! 🎉</Text>
        <Text style={mainMessage}>
          Great news! Your booking at <strong>{propertyName}</strong> is confirmed.
        </Text>
        <Text style={subMessage}>
          {hostName} is excited to welcome you on {checkInDate}.
        </Text>
      </Section>

      {/* Booking Details Card */}
      <Section style={cardSection}>
        <Section style={detailsCard}>
          <Text style={cardTitle}>🏠 Your Booking Details</Text>
          <Text style={divider}>━━━━━━━━━━━━━━━━━━━━</Text>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Property:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{propertyName}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Address:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{propertyAddress}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Check-in:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{checkInDate} at {checkInTime}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Check-out:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{checkOutDate} at {checkOutTime}</Text>
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

          <Text style={divider}>━━━━━━━━━━━━━━━━━━━━</Text>

          <Text style={paymentTitle}>💰 Payment Summary</Text>
          <Text style={totalAmountStyle}>Total Paid: ${totalAmount.toFixed(2)}</Text>
          <Text style={zeroFeeNote}>
            (Zero platform fees - transparent pricing!)
          </Text>
        </Section>
      </Section>

      {/* CTA Button */}
      <Section style={ctaSection}>
        <Button
          href={`https://hiddystays.com/bookings/${bookingId}?utm_source=email&utm_medium=booking_confirmation&utm_campaign=guest_experience`}
          style={primaryButton}
        >
          View Booking Details
        </Button>
      </Section>

      {/* Getting There */}
      <Section style={infoSection}>
        <Text style={infoTitle}>📍 Getting There</Text>
        <Button href={googleMapsUrl} style={secondaryButton}>
          Open in Google Maps
        </Button>
      </Section>

      {/* Special Instructions */}
      {specialInstructions && (
        <Section style={infoSection}>
          <Text style={infoTitle}>📝 Important Notes</Text>
          <Text style={infoText}>• Check-in time: {checkInTime}</Text>
          <Text style={infoText}>• {specialInstructions}</Text>
        </Section>
      )}

      {/* Host Contact Card */}
      <Section style={hostCardSection}>
        <Section style={hostCard}>
          {hostAvatar && (
            <Img
              src={hostAvatar}
              alt={hostName}
              width="60"
              height="60"
              style={hostAvatarStyle}
            />
          )}
          <Text style={hostNameStyle}>Your Host: {hostName}</Text>
          <Button href={`mailto:${hostEmail}`} style={messageHostButton}>
            Message Host
          </Button>
        </Section>
      </Section>

      {/* Footer Message */}
      <Section style={footerMessageSection}>
        <Text style={footerMessageText}>
          Need to make changes? Contact us at{' '}
          <a href="mailto:admin@hiddystays.com" style={emailLink}>
            admin@hiddystays.com
          </a>
        </Text>
        <Text style={footerMessageText}>Happy travels!</Text>
        <Text style={footerMessageText}>The HiddyStays Team</Text>
      </Section>
    </EmailLayout>
  );
};

export default BookingConfirmation;

// Styles
const heroSection = {
  padding: '0',
};

const heroImage = {
  width: '100%',
  height: 'auto',
  display: 'block',
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
  margin: '0 0 12px 0',
};

const subMessage = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#6B7280',
  margin: '0',
};

const cardSection = {
  padding: '0 30px 30px',
};

const detailsCard = {
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

const paymentTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '20px 0 12px 0',
};

const totalAmountStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#10B981',
  margin: '8px 0',
};

const zeroFeeNote = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '4px 0 0 0',
  fontStyle: 'italic',
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
};

const secondaryButton = {
  backgroundColor: '#1E3A5F',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  borderRadius: '8px',
};

const infoSection = {
  padding: '20px 30px',
};

const infoTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const infoText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '4px 0',
};

const hostCardSection = {
  padding: '30px',
};

const hostCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};

const hostAvatarStyle = {
  borderRadius: '50%',
  margin: '0 auto 12px',
};

const hostNameStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '12px 0',
};

const messageHostButton = {
  backgroundColor: '#1E3A5F',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  borderRadius: '6px',
  marginTop: '12px',
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
