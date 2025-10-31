import {
  Section,
  Text,
  Button,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface PaymentReceiptProps {
  guestName: string;
  propertyName: string;
  bookingId: string;
  transactionId: string;
  paymentDate: string;
  paymentMethod: string;
  accommodationFee: number;
  cleaningFee: number;
  serviceFee: number;
  paymentProcessing: number;
  totalAmount: number;
}

export const PaymentReceipt = ({
  guestName,
  propertyName,
  bookingId,
  transactionId,
  paymentDate,
  paymentMethod,
  accommodationFee,
  cleaningFee,
  serviceFee,
  paymentProcessing,
  totalAmount,
}: PaymentReceiptProps) => {
  return (
    <EmailLayout preview={`Payment Receipt - Booking at ${propertyName}`}>
      {/* Header */}
      <Section style={headerSection}>
        <Text style={title}>Payment Receipt</Text>
        <Text style={subtitle}>Thank you for your payment</Text>
      </Section>

      {/* Greeting */}
      <Section style={greetingSection}>
        <Text style={greeting}>Hi {guestName},</Text>
        <Text style={message}>
          This is your payment receipt for your booking at <strong>{propertyName}</strong>.
        </Text>
      </Section>

      {/* Transaction Details */}
      <Section style={cardSection}>
        <Section style={detailsCard}>
          <Text style={cardTitle}>Transaction Details</Text>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Transaction ID:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{transactionId}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Payment Date:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{paymentDate}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Payment Method:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{paymentMethod}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Booking ID:</Text>
            </Column>
            <Column>
              <Text style={detailValue}>{bookingId}</Text>
            </Column>
          </Row>
        </Section>
      </Section>

      {/* Payment Breakdown */}
      <Section style={breakdownSection}>
        <Section style={breakdownCard}>
          <Text style={breakdownTitle}>Payment Breakdown</Text>
          <Text style={divider}>━━━━━━━━━━━━━━━━━━━━</Text>

          <Row style={lineItem}>
            <Column>
              <Text style={lineLabel}>Accommodation:</Text>
            </Column>
            <Column align="right">
              <Text style={lineValue}>${accommodationFee.toFixed(2)}</Text>
            </Column>
          </Row>

          {cleaningFee > 0 && (
            <Row style={lineItem}>
              <Column>
                <Text style={lineLabel}>Cleaning fee:</Text>
              </Column>
              <Column align="right">
                <Text style={lineValue}>${cleaningFee.toFixed(2)}</Text>
              </Column>
            </Row>
          )}

          <Row style={lineItem}>
            <Column>
              <Text style={lineLabel}>Service fee:</Text>
            </Column>
            <Column align="right">
              <Text style={zeroFee}>$0.00 ✨</Text>
            </Column>
          </Row>

          <Row style={lineItem}>
            <Column>
              <Text style={lineLabel}>Payment processing:</Text>
            </Column>
            <Column align="right">
              <Text style={lineValue}>${paymentProcessing.toFixed(2)}</Text>
            </Column>
          </Row>

          <Text style={divider}>━━━━━━━━━━━━━━━━━━━━</Text>

          <Row style={totalRow}>
            <Column>
              <Text style={totalLabel}>Total Paid:</Text>
            </Column>
            <Column align="right">
              <Text style={totalValue}>${totalAmount.toFixed(2)}</Text>
            </Column>
          </Row>

          <Text style={transparentNote}>
            Transparent pricing - Zero platform fees!
          </Text>
        </Section>
      </Section>

      {/* Download Button */}
      <Section style={ctaSection}>
        <Button
          href={`https://hiddystays.com/receipts/${transactionId}/download?utm_source=email&utm_medium=payment_receipt&utm_campaign=guest_experience`}
          style={primaryButton}
        >
          Download PDF Receipt
        </Button>
      </Section>

      {/* Footer Message */}
      <Section style={footerMessageSection}>
        <Text style={footerMessageText}>
          Keep this receipt for your records. If you have any questions about this payment,
          please contact us at{' '}
          <a href="mailto:admin@hiddystays.com" style={emailLink}>
            admin@hiddystays.com
          </a>
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default PaymentReceipt;

// Styles
const headerSection = {
  padding: '40px 30px 20px',
  textAlign: 'center' as const,
};

const title = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 8px 0',
};

const subtitle = {
  fontSize: '16px',
  color: '#6B7280',
  margin: '0',
};

const greetingSection = {
  padding: '20px 30px',
};

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 12px 0',
};

const message = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#6B7280',
  margin: '0',
};

const cardSection = {
  padding: '20px 30px',
};

const detailsCard = {
  backgroundColor: '#F9FAFB',
  borderRadius: '12px',
  padding: '24px',
};

const cardTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
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

const breakdownSection = {
  padding: '20px 30px',
};

const breakdownCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '24px',
};

const breakdownTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 8px 0',
};

const divider = {
  fontSize: '14px',
  color: '#E5E7EB',
  margin: '12px 0',
  letterSpacing: '2px',
};

const lineItem = {
  margin: '12px 0',
};

const lineLabel = {
  fontSize: '16px',
  color: '#111827',
  margin: '0',
};

const lineValue = {
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

const transparentNote = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '12px 0 0 0',
  textAlign: 'center' as const,
  fontStyle: 'italic',
};

const ctaSection = {
  padding: '40px 30px',
  textAlign: 'center' as const,
};

const primaryButton = {
  backgroundColor: '#1E3A5F',
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
  margin: '0',
  lineHeight: '1.6',
};

const emailLink = {
  color: '#1E3A5F',
  textDecoration: 'none',
};
