import {
  Section,
  Text,
  Button,
  Img,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface WelcomeEmailProps {
  name: string;
  role: 'host' | 'guest';
}

export const WelcomeEmail = ({ name, role }: WelcomeEmailProps) => {
  const isHost = role === 'host';

  return (
    <EmailLayout
      preview={
        isHost
          ? 'Welcome to HiddyStays - List your property and keep 100%!'
          : 'Welcome to HiddyStays - Discover your next stay!'
      }
    >
      {/* Hero Image with Overlay */}
      <Section style={heroSection}>
        <Img
          src={
            isHost
              ? 'https://hiddystays.com/images/welcome-host.jpg'
              : 'https://hiddystays.com/images/welcome-guest.jpg'
          }
          alt="Welcome to HiddyStays"
          width="600"
          height="300"
          style={heroImage}
        />
        <Section style={heroOverlay}>
          <Text style={heroText}>
            {isHost ? 'Welcome to the Zero-Fee Revolution' : 'Welcome to HiddyStays'}
          </Text>
        </Section>
      </Section>

      {/* Welcome Message */}
      <Section style={greetingSection}>
        <Text style={greeting}>Hey {name}! 👋</Text>
        <Text style={message}>
          {isHost ? (
            <>
              Welcome to HiddyStays, where Canadian property owners keep{' '}
              <strong>100% of their earnings!</strong>
            </>
          ) : (
            <>
              Welcome to HiddyStays - where you can book amazing stays at{' '}
              <strong>transparent prices with zero platform fees!</strong>
            </>
          )}
        </Text>
      </Section>

      {/* Value Props - 3 Columns */}
      <Section style={valuePropsSection}>
        <Text style={sectionTitle}>
          {isHost ? '🎉 You\'re Part of the Zero-Fee Revolution' : '✨ What Makes HiddyStays Different?'}
        </Text>

        <Row style={propsRow}>
          <Column style={propColumn}>
            <Text style={propEmoji}>💰</Text>
            <Text style={propTitle}>
              {isHost ? 'Zero Fees' : 'Transparent Pricing'}
            </Text>
            <Text style={propText}>
              {isHost
                ? 'Keep 100% of your bookings'
                : 'See the full price upfront - no surprises'}
            </Text>
          </Column>

          <Column style={propColumn}>
            <Text style={propEmoji}>🤝</Text>
            <Text style={propTitle}>
              {isHost ? 'Direct Connect' : 'Direct Communication'}
            </Text>
            <Text style={propText}>
              {isHost
                ? 'Build real relationships with guests'
                : 'Connect directly with your host'}
            </Text>
          </Column>

          <Column style={propColumn}>
            <Text style={propEmoji}>🚀</Text>
            <Text style={propTitle}>
              {isHost ? 'Modern Platform' : 'Easy Booking'}
            </Text>
            <Text style={propText}>
              {isHost
                ? 'Easy management tools'
                : 'Simple, streamlined booking process'}
            </Text>
          </Column>
        </Row>
      </Section>

      {isHost && (
        <>
          {/* Quick Start Guide for Hosts */}
          <Section style={quickStartSection}>
            <Text style={quickStartTitle}>📋 Getting Started is Easy</Text>
            <Text style={divider}>━━━━━━━━━━━━━━━━━━━━</Text>

            <Section style={stepSection}>
              <Row>
                <Column style={stepNumberColumn}>
                  <Text style={stepNumber}>1</Text>
                </Column>
                <Column>
                  <Text style={stepText}>List your property (5 minutes)</Text>
                </Column>
              </Row>
            </Section>

            <Section style={stepSection}>
              <Row>
                <Column style={stepNumberColumn}>
                  <Text style={stepNumber}>2</Text>
                </Column>
                <Column>
                  <Text style={stepText}>Add photos and details</Text>
                </Column>
              </Row>
            </Section>

            <Section style={stepSection}>
              <Row>
                <Column style={stepNumberColumn}>
                  <Text style={stepNumber}>3</Text>
                </Column>
                <Column>
                  <Text style={stepText}>Set your pricing</Text>
                </Column>
              </Row>
            </Section>

            <Section style={stepSection}>
              <Row>
                <Column style={stepNumberColumn}>
                  <Text style={stepNumber}>4</Text>
                </Column>
                <Column>
                  <Text style={stepText}>Start accepting bookings!</Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* CTA for Hosts */}
          <Section style={ctaSection}>
            <Button href="https://hiddystays.com/host-dashboard?utm_source=email&utm_medium=welcome_host&utm_campaign=onboarding" style={primaryButton}>
              List Your First Property
            </Button>
          </Section>
        </>
      )}

      {!isHost && (
        <>
          {/* Features for Guests */}
          <Section style={featuresSection}>
            <Text style={featuresTitle}>🏠 Start Exploring</Text>
            <Text style={featuresText}>
              Browse unique properties across Canada and book your next getaway with confidence.
            </Text>
          </Section>

          {/* CTA for Guests */}
          <Section style={ctaSection}>
            <Button href="https://hiddystays.com/properties?utm_source=email&utm_medium=welcome_guest&utm_campaign=onboarding" style={primaryButton}>
              Browse Properties
            </Button>
          </Section>
        </>
      )}

      {/* Help Section */}
      <Section style={helpSection}>
        <Text style={helpTitle}>💡 Need Help?</Text>
        <Text style={helpText}>
          Our support team is here for you at{' '}
          <a href="mailto:admin@hiddystays.com" style={emailLink}>
            admin@hiddystays.com
          </a>
        </Text>
      </Section>

      {/* Closing */}
      <Section style={closingSection}>
        <Text style={closingText}>
          {isHost ? "Here's to your success!" : 'Happy browsing!'}
        </Text>
        <Text style={closingText}>The HiddyStays Team</Text>
        {isHost && (
          <Text style={psText}>P.S. Did we mention you keep 100% of your earnings? 😊</Text>
        )}
      </Section>
    </EmailLayout>
  );
};

export default WelcomeEmail;

// Styles
const heroSection = {
  position: 'relative' as const,
  padding: '0',
};

const heroImage = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const heroOverlay = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center' as const,
  width: '100%',
};

const heroText = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#ffffff',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
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

const message = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#111827',
  margin: '0',
};

const valuePropsSection = {
  padding: '30px',
  backgroundColor: '#F9FAFB',
};

const sectionTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const propsRow = {
  margin: '20px 0',
};

const propColumn = {
  textAlign: 'center' as const,
  padding: '0 16px',
};

const propEmoji = {
  fontSize: '48px',
  margin: '0 0 12px 0',
};

const propTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 8px 0',
};

const propText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0',
  lineHeight: '1.4',
};

const quickStartSection = {
  padding: '30px',
};

const quickStartTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const divider = {
  fontSize: '14px',
  color: '#E5E7EB',
  margin: '12px 0 24px 0',
  letterSpacing: '2px',
};

const stepSection = {
  margin: '16px 0',
};

const stepNumberColumn = {
  width: '40px',
};

const stepNumber = {
  width: '32px',
  height: '32px',
  backgroundColor: '#10B981',
  color: '#ffffff',
  borderRadius: '50%',
  display: 'inline-block',
  textAlign: 'center' as const,
  lineHeight: '32px',
  fontWeight: 'bold',
  fontSize: '16px',
  margin: '0',
};

const stepText = {
  fontSize: '16px',
  color: '#111827',
  margin: '0',
  paddingTop: '4px',
};

const featuresSection = {
  padding: '30px',
  textAlign: 'center' as const,
};

const featuresTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const featuresText = {
  fontSize: '16px',
  color: '#6B7280',
  margin: '0',
  lineHeight: '1.6',
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

const helpSection = {
  padding: '30px',
  textAlign: 'center' as const,
  backgroundColor: '#F9FAFB',
};

const helpTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const helpText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0',
};

const emailLink = {
  color: '#1E3A5F',
  textDecoration: 'none',
};

const closingSection = {
  padding: '30px',
  textAlign: 'center' as const,
};

const closingText = {
  fontSize: '16px',
  color: '#111827',
  margin: '8px 0',
};

const psText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '16px 0 0 0',
  fontStyle: 'italic',
};
