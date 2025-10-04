-- Email Analytics Table
CREATE TABLE IF NOT EXISTS email_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  email_id VARCHAR(255),
  recipient_email VARCHAR(255) NOT NULL,
  email_type VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  source VARCHAR(100) DEFAULT 'footer',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'bounced')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Analytics Table
CREATE TABLE IF NOT EXISTS newsletter_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  source VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Templates Table (for future template management)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Campaigns Table (for future campaign management)
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_analytics_recipient_email ON email_analytics(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_analytics_email_type ON email_analytics(email_type);
CREATE INDEX IF NOT EXISTS idx_email_analytics_created_at ON email_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_source ON newsletter_subscriptions(source);

CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_email ON newsletter_analytics(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_event_type ON newsletter_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_created_at ON newsletter_analytics(created_at);

-- RLS Policies
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Email Analytics Policies
CREATE POLICY "Service role can manage email analytics" ON email_analytics
  FOR ALL USING (auth.role() = 'service_role');

-- Newsletter Subscriptions Policies
CREATE POLICY "Users can view their own subscriptions" ON newsletter_subscriptions
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Service role can manage newsletter subscriptions" ON newsletter_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Newsletter Analytics Policies
CREATE POLICY "Service role can manage newsletter analytics" ON newsletter_analytics
  FOR ALL USING (auth.role() = 'service_role');

-- Email Templates Policies
CREATE POLICY "Service role can manage email templates" ON email_templates
  FOR ALL USING (auth.role() = 'service_role');

-- Email Campaigns Policies
CREATE POLICY "Service role can manage email campaigns" ON email_campaigns
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, text_content, variables) VALUES
(
  'welcome',
  '🎉 Welcome to HiddyStays - Your Journey Begins!',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Welcome to HiddyStays</title></head><body><h1>Welcome {{name}}!</h1><p>Thank you for joining HiddyStays.</p></body></html>',
  'Welcome {{name}}! Thank you for joining HiddyStays.',
  '["name", "email"]'
),
(
  'booking_confirmation',
  '🎉 Booking Confirmed - {{propertyTitle}}',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Booking Confirmed</title></head><body><h1>Booking Confirmed!</h1><p>Your stay at {{propertyTitle}} is confirmed.</p></body></html>',
  'Booking Confirmed! Your stay at {{propertyTitle}} is confirmed.',
  '["guestName", "propertyTitle", "checkInDate", "checkOutDate", "guests", "totalAmount", "bookingId"]'
),
(
  'host_notification',
  '🎉 New Booking - {{guestName}} booked your {{propertyTitle}}',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>New Booking</title></head><body><h1>New Booking Received!</h1><p>{{guestName}} booked your {{propertyTitle}}.</p></body></html>',
  'New Booking Received! {{guestName}} booked your {{propertyTitle}}.',
  '["hostName", "guestName", "propertyTitle", "checkInDate", "checkOutDate", "guests", "totalAmount", "bookingId"]'
),
(
  'password_reset',
  '🔒 Reset Your HiddyStays Password',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Password Reset</title></head><body><h1>Password Reset</h1><p>Click the link to reset your password: {{resetUrl}}</p></body></html>',
  'Password Reset. Click the link to reset your password: {{resetUrl}}',
  '["name", "resetUrl"]'
),
(
  'newsletter_welcome',
  '📧 Welcome to Our Newsletter - Travel Tips & Deals Await!',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Newsletter Welcome</title></head><body><h1>Welcome to Our Newsletter!</h1><p>Thank you for subscribing, {{name}}!</p></body></html>',
  'Welcome to Our Newsletter! Thank you for subscribing, {{name}}!',
  '["name", "email"]'
)
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_newsletter_subscriptions_updated_at BEFORE UPDATE ON newsletter_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
