import {
  Section,
  Text,
  Button,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface CheckInReminderProps {
  guestName: string;
  propertyName: string;
  propertyAddress: string;
  checkInDate: string;
  checkInTime: string;
  hostName: string;
  hostPhone: string;
  wifiNetwork?: string;
  wifiPassword?: string;
  parkingInstructions?: string;
  entryInstructions?: string;
  specialInstructions?: string;
  googleMapsUrl: string;
  bookingId: string;
}

export const CheckInReminder = ({
  guestName,
  propertyName,
  propertyAddress,
  checkInDate,
  checkInTime,
  hostName,
  hostPhone,
  wifiNetwork,
  wifiPassword,
  parkingInstructions,
  entryInstructions,
  specialInstructions,
  googleMapsUrl,
  bookingId,
}: CheckInReminderProps) => {
  return (
    <EmailLayout preview={`Your stay begins tomorrow at ${propertyName}!`}>
      {/* Greeting */}
      <Section style={greetingSection}>
        <Text style={greeting}>Hey {guestName}! 🎉</Text>
        <Text style={message}>
          Your stay at <strong>{propertyName}</strong> begins tomorrow!
        </Text>
      </Section>

      {/* Check-in Details Card */}
      <Section style={cardSection}>
        <Section style={checkInCard}>
          <Text style={cardTitle}>⏰ Check-in Details</Text>
          <Text style={divider}>━━━━━━━━━━━━━━━━━━━━</Text>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Date:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{checkInDate}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Time:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{checkInTime}</Text>
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
        </Section>
      </Section>

      {/* Google Maps Button */}
      <Section style={mapSection}>
        <Button href={`${googleMapsUrl}?utm_source=email&utm_medium=checkin_reminder&utm_campaign=guest_experience`} style={mapsButton}>
          📍 View on Google Maps
        </Button>
      </Section>

      {/* Host Contact */}
      <Section style={contactSection}>
        <Text style={contactTitle}>📞 Host Contact</Text>
        <Text style={contactText}>
          {hostName}: <a href={`tel:${hostPhone}`} style={phoneLink}>{hostPhone}</a>
        </Text>
      </Section>

      {/* Important Reminders */}
      <Section style={remindersSection}>
        <Text style={remindersTitle}>📝 Important Reminders</Text>

        <Text style={reminderItem}>• Bring a valid ID</Text>
        <Text style={reminderItem}>• Check-in time: {checkInTime}</Text>
        {specialInstructions && (
          <Text style={reminderItem}>• {specialInstructions}</Text>
        )}
      </Section>

      {/* Property Details */}
      <Section style={detailsSection}>
        <Text style={detailsTitle}>🏠 Property Details</Text>

        {wifiNetwork && (
          <Section style={infoBox}>
            <Text style={infoLabel}>WiFi:</Text>
            <Text style={infoValue}>Network: {wifiNetwork}</Text>
            {wifiPassword && (
              <Text style={infoValue}>Password: {wifiPassword}</Text>
            )}
          </Section>
        )}

        {parkingInstructions && (
          <Section style={infoBox}>
            <Text style={infoLabel}>Parking:</Text>
            <Text style={infoValue}>{parkingInstructions}</Text>
          </Section>
        )}

        {entryInstructions && (
          <Section style={infoBox}>
            <Text style={infoLabel}>Entry:</Text>
            <Text style={infoValue}>{entryInstructions}</Text>
          </Section>
        )}
      </Section>

      {/* CTA */}
      <Section style={ctaSection}>
        <Button
          href={`https://hiddystays.com/bookings/${bookingId}?utm_source=email&utm_medium=checkin_reminder&utm_campaign=guest_experience`}
          style={primaryButton}
        >
          View Full Booking Details
        </Button>
      </Section>

      {/* Footer Message */}
      <Section style={footerMessageSection}>
        <Text style={footerMessageText}>
          Need to make changes or have questions?
        </Text>
        <Text style={footerMessageText}>
          Contact {hostName} directly or reach us at{' '}
          <a href="mailto:admin@hiddystays.com" style={emailLink}>
            admin@hiddystays.com
          </a>
        </Text>
        <Text style={{ ...footerMessageText, marginTop: '20px' }}>
          Safe travels!
        </Text>
        <Text style={footerMessageText}>The HiddyStays Team</Text>
      </Section>

      {/* Booking ID */}
      <Section style={bookingIdSection}>
        <Text style={bookingIdText}>
          Your booking ID: {bookingId}
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default CheckInReminder;

// Styles
const greetingSection = {
  padding: '40px 30px 20px',
};

const greeting = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
};

const message = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#111827',
  margin: '0',
};

const cardSection = {
  padding: '30px',
};

const checkInCard = {
  backgroundColor: '#F0F9FF',
  border: '2px solid #10B981',
  borderRadius: '12px',
  padding: '30px',
};

const cardTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const divider = {
  fontSize: '14px',
  color: '#E5E7EB',
  margin: '12px 0 20px 0',
  letterSpacing: '2px',
};

const detailRow = {
  margin: '12px 0',
};

const detailLabel = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0',
};

const detailValue = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
};

const mapSection = {
  padding: '0 30px 30px',
  textAlign: 'center' as const,
};

const mapsButton = {
  backgroundColor: '#1E3A5F',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  borderRadius: '8px',
};

const contactSection = {
  padding: '20px 30px',
  backgroundColor: '#F9FAFB',
};

const contactTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const contactText = {
  fontSize: '16px',
  color: '#111827',
  margin: '0',
};

const phoneLink = {
  color: '#1E3A5F',
  textDecoration: 'none',
  fontWeight: '600',
};

const remindersSection = {
  padding: '30px',
};

const remindersTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
};

const reminderItem = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '8px 0',
};

const detailsSection = {
  padding: '20px 30px',
};

const detailsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 20px 0',
};

const infoBox = {
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 0',
};

const infoLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px 0',
};

const infoValue = {
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

const bookingIdSection = {
  padding: '0 30px 30px',
  textAlign: 'center' as const,
};

const bookingIdText = {
  fontSize: '12px',
  color: '#9CA3AF',
  fontFamily: 'monospace',
  margin: '0',
};
