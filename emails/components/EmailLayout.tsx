import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://hiddystays.com/logo-white.png"
              alt="HiddyStays"
              width="160"
              height="40"
            />
          </Section>

          {/* Main Content */}
          {children}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              HiddyStays - Zero Fee Stays
            </Text>
            <Text style={footerText}>
              Keep 100% of your earnings
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerLinks}>
              <Link href="https://hiddystays.com" style={link}>Website</Link>
              {' • '}
              <Link href="mailto:admin@hiddystays.com" style={link}>Support</Link>
              {' • '}
              <Link href="https://hiddystays.com/unsubscribe" style={link}>Unsubscribe</Link>
            </Text>
            <Text style={footerSmall}>
              © 2025 HiddyStays. All rights reserved.
            </Text>
            <Text style={footerSmall}>
              123 Main Street, Toronto, ON M5V 3A8, Canada
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const container = {
  margin: '0 auto',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#1E3A5F',
  padding: '20px 30px',
  textAlign: 'center' as const,
};

const footer = {
  backgroundColor: '#F9FAFB',
  padding: '40px 30px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '4px 0',
};

const footerDivider = {
  borderColor: '#E5E7EB',
  margin: '20px 0',
};

const footerLinks = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '20px 0',
};

const link = {
  color: '#1E3A5F',
  textDecoration: 'none',
};

const footerSmall = {
  fontSize: '12px',
  color: '#9CA3AF',
  margin: '4px 0',
};
