# HiddyStays Email System Guide

## 🎨 Overview

The HiddyStays email system has been enhanced with beautiful, branded email templates that follow the zero-fee philosophy and provide a premium user experience. All emails are designed with the HiddyStays brand colors and modern typography.

## 🎯 Brand Colors & Design

### Brand Colors

- **Primary Blue**: `#1E3A5F`
- **Accent Green**: `#10B981`
- **Background**: `#F9FAFB`
- **Text Dark**: `#111827`
- **Text Light**: `#6B7280`

### Typography

- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Headings**: Bold, 24-32px
- **Body**: Regular, 16px, line-height 1.6
- **Small**: 14px

## 📧 Email Templates

### 1. Booking Confirmation (Guest)

**Purpose**: Sent to guests when their booking is confirmed
**Subject**: `Your stay at [Property Name] is confirmed! 🏠`

**Features**:

- Property hero image
- Complete booking details
- Host contact information
- Google Maps integration
- Zero platform fee messaging

### 2. New Booking Alert (Host)

**Purpose**: Sent to hosts when they receive a new booking
**Subject**: `New booking for [Property Name] - You earned $[Amount]! 🎉`

**Features**:

- Earnings breakdown highlighting 100% kept
- Guest information
- Action buttons (View Booking, Contact Guest)
- Zero platform fee emphasis

### 3. Payment Receipt

**Purpose**: Sent after successful payment
**Subject**: `Payment Receipt - Booking at [Property Name]`

**Features**:

- Transaction details
- Itemized payment breakdown
- PDF receipt download
- Zero service fee highlighted

### 4. Welcome Email (Host)

**Purpose**: Sent to new hosts after signup
**Subject**: `Welcome to HiddyStays - List your property and keep 100%! 👋`

**Features**:

- Hero image with value proposition
- Zero-fee benefits
- Getting started guide
- Call-to-action to list property

### 5. Check-in Reminder (24h)

**Purpose**: Sent 24 hours before check-in
**Subject**: `Your stay begins tomorrow at [Property Name]! 🗓️`

**Features**:

- Check-in details
- Property information (WiFi, parking, entry)
- Host contact
- Google Maps link

## 🛠️ Technical Implementation

### File Structure

```
lib/
├── email-templates/
│   ├── index.tsx (legacy templates)
│   └── hiddystays-templates.tsx (new branded templates)
├── unified-email-service.ts (main service)
└── email-service.ts (legacy compatibility)

app/api/
├── emails/
│   ├── welcome/route.ts
│   ├── checkin-reminder/route.ts
│   └── payment-receipt/route.ts
├── bookings/route.ts (updated with email triggers)
└── test/emails/route.ts (testing endpoint)

supabase/functions/
└── send-checkin-reminders/index.ts (scheduled function)
```

### Unified Email Service

The `UnifiedEmailService` is a singleton that handles all email operations:

```typescript
import { unifiedEmailService } from "@/lib/unified-email-service";

// Send booking confirmation
await unifiedEmailService.sendBookingConfirmation({
  bookingId: "booking-123",
  guestName: "John Doe",
  guestEmail: "john@example.com",
  // ... other booking data
});

// Send host notification
await unifiedEmailService.sendHostNotification({
  // ... booking data with host information
});
```

### Email Triggers

#### Booking Confirmation

- **Trigger**: When booking status changes to "confirmed"
- **Location**: `app/api/bookings/route.ts` (PUT method)
- **Recipients**: Guest (confirmation) + Host (notification)

#### Welcome Email

- **Trigger**: New user signup (manual or via API)
- **Endpoint**: `POST /api/emails/welcome`
- **Data**: `{ email, name, role }`

#### Check-in Reminders

- **Trigger**: Scheduled (daily at 9 AM)
- **Function**: `supabase/functions/send-checkin-reminders`
- **Logic**: Finds bookings with check-in tomorrow

#### Payment Receipts

- **Trigger**: After successful Stripe payment
- **Endpoint**: `POST /api/emails/payment-receipt`
- **Data**: `{ bookingId, paymentIntentId, totalAmount }`

## 🧪 Testing

### Test Endpoint

```bash
POST /api/test/emails
Content-Type: application/json

{
  "email": "your-email@example.com",
  "testType": "all" // or specific template type
}
```

### Test Script

```bash
# Set your email for testing
export TEST_EMAIL=your-email@example.com

# Run the test script
node scripts/test-email-system.js
```

### Test Types

- `all` - Test all email templates
- `welcome` - Test welcome email only
- `booking-confirmation` - Test booking confirmation
- `host-notification` - Test host notification
- `payment-receipt` - Test payment receipt
- `checkin-reminder` - Test check-in reminder

## 📊 Email Analytics

The system tracks email analytics in the `email_analytics` table:

```sql
CREATE TABLE email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  email_id TEXT,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Tracked Events

- `welcome_sent`
- `booking_confirmation_sent`
- `host_notification_sent`
- `payment_receipt_sent`
- `check_in_reminder_sent`

## 🔧 Configuration

### Environment Variables

```env
# Required
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=https://hiddystays.com

# Optional
TEST_EMAIL=test@example.com
```

### Resend Setup

1. Sign up for Resend account
2. Verify your domain
3. Get API key
4. Add to environment variables

## 📱 Responsive Design

All email templates are fully responsive and tested across:

- Gmail (Desktop & Mobile)
- Outlook (Desktop & Mobile)
- Apple Mail (iOS & macOS)
- Yahoo Mail
- ProtonMail

## 🎨 Design Features

### Visual Elements

- **Hero Images**: Property photos with overlay text
- **Gradient Backgrounds**: Green gradients for earnings sections
- **Card Layouts**: Clean, modern card-based design
- **Icons**: Emoji icons for visual appeal
- **Buttons**: Prominent CTA buttons with hover states

### Brand Messaging

- **Zero Platform Fees**: Emphasized throughout
- **100% Earnings**: Highlighted in host emails
- **Transparent Pricing**: Clear breakdown in receipts
- **Canadian Focus**: Local messaging for hosts

## 🚀 Deployment

### 1. Set Environment Variables

```bash
RESEND_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Deploy Supabase Functions

```bash
supabase functions deploy send-checkin-reminders
```

### 3. Set Up Scheduled Function

Create a cron job or use Supabase's pg_cron to call the check-in reminder function daily.

### 4. Test Email Delivery

```bash
curl -X POST https://your-domain.com/api/test/emails \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "testType": "all"}'
```

## 📈 Monitoring

### Email Metrics to Track

- Open rate
- Click-through rate
- Conversion rate (bookings from emails)
- Unsubscribe rate
- Bounce rate

### Error Handling

- Failed emails are logged but don't break booking flow
- Retry logic for transient failures
- Fallback to plain text if HTML fails

## 🔒 Security & Compliance

### CAN-SPAM Compliance

- ✅ Clear sender identification
- ✅ Unsubscribe links
- ✅ Physical address in footer
- ✅ No misleading subject lines

### GDPR Compliance

- ✅ Clear consent mechanisms
- ✅ Easy unsubscribe
- ✅ Data retention policies
- ✅ Privacy policy links

## 🛠️ Maintenance

### Regular Tasks

1. Monitor email delivery rates
2. Update property images in templates
3. Review and update copy for seasonal messaging
4. Test templates on new email clients
5. Clean up bounced email addresses

### Troubleshooting

- Check Resend dashboard for delivery issues
- Verify domain authentication
- Review email analytics for patterns
- Test with different email providers

## 📞 Support

For email system issues:

- Check logs in Resend dashboard
- Review `email_analytics` table
- Test with `/api/test/emails` endpoint
- Contact development team

---

**Last Updated**: January 2025
**Version**: 2.0.0
**Maintainer**: HiddyStays Development Team

