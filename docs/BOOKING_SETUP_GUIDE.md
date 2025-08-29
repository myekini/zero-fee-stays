# Zero Fee Stays - World-Class Booking System Setup Guide

## 🚀 Overview

This guide will help you set up a world-class booking system with the following features:

- ✅ Real-time availability checking
- ✅ Secure payment processing with Stripe
- ✅ Email notifications and confirmations
- ✅ Mobile-optimized booking flow
- ✅ Comprehensive error handling
- ✅ Rate limiting and security
- ✅ Analytics and monitoring
- ✅ Multi-step booking process
- ✅ Cancellation and refund handling

## 📋 Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and web development

## 🔧 Required Services & Credentials

### 1. Stripe Account

**Purpose**: Payment processing
**Setup**:

1. Create account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Set up webhook endpoints

**Required Credentials**:

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret

### 2. Supabase Account

**Purpose**: Database, authentication, and storage
**Setup**:

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the database migrations

**Required Credentials**:

- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Anonymous key for client
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server

### 3. Email Service

**Purpose**: Send booking confirmations and notifications
**Options**:

- **Resend** (Recommended): Simple setup, great deliverability
- **SendGrid**: Enterprise-grade email service
- **AWS SES**: Cost-effective for high volume

**Required Credentials** (choose one):

- Resend: `RESEND_API_KEY`
- SendGrid: `SENDGRID_API_KEY`
- AWS SES: `AWS_SES_ACCESS_KEY_ID`, `AWS_SES_SECRET_ACCESS_KEY`

### 4. File Storage (Optional)

**Purpose**: Store property images
**Options**:

- **Supabase Storage** (Recommended): Built into Supabase
- **AWS S3**: Scalable cloud storage
- **Cloudinary**: Image optimization included

## 🛠️ Installation & Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd zero-fee-stays

# Install dependencies
npm install
# or
yarn install
```

### Step 2: Environment Configuration

```bash
# Copy the environment template
cp env.example .env

# Edit the .env file with your credentials
nano .env
```

**Critical**: Fill in all `[REQUIRED]` values in your `.env` file.

### Step 3: Database Setup

```bash
# Deploy Supabase migrations
npx supabase db push

# Or manually run migrations
npx supabase migration up
```

### Step 4: Stripe Webhook Setup

1. Go to your Stripe Dashboard → Webhooks
2. Create a new endpoint: `https://your-domain.com/api/stripe-webhook`
3. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the webhook secret to your `.env` file

### Step 5: Email Service Setup

#### Option A: Resend (Recommended)

```bash
# Sign up at resend.com
# Get your API key and add to .env
RESEND_API_KEY=re_your_key_here
```

#### Option B: SendGrid

```bash
# Sign up at sendgrid.com
# Get your API key and add to .env
SENDGRID_API_KEY=SG.your_key_here
```

### Step 6: Start Development Server

```bash
# Start the development server
npm run dev
# or
yarn dev
```

## 🔐 Security Configuration

### Rate Limiting

Configure rate limiting in your `.env`:

```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # requests per window
```

### CORS Configuration

Update allowed origins:

```env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### JWT Configuration

Generate secure secrets:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32
```

## 📱 Testing the Booking Flow

### 1. Create Test Properties

```sql
-- Insert test property
INSERT INTO properties (
  host_id,
  title,
  description,
  property_type,
  location,
  city,
  country,
  price_per_night,
  max_guests
) VALUES (
  'your-host-id',
  'Test Property',
  'A beautiful test property',
  'apartment',
  'Downtown',
  'Toronto',
  'Canada',
  150.00,
  4
);
```

### 2. Test Payment Flow

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
2. Test the complete booking flow
3. Verify email notifications

### 3. Test Error Scenarios

- Invalid dates
- Unavailable dates
- Payment failures
- Network errors

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Using production API keys (not test keys)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error monitoring set up
- [ ] Database backups configured
- [ ] SSL certificates valid
- [ ] Legal pages published

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

#### AWS/GCP/Azure

Follow your cloud provider's deployment guide for React applications.

## 📊 Monitoring & Analytics

### Error Tracking

Set up Sentry for error monitoring:

```env
SENTRY_DSN=https://your_sentry_dsn_here
```

### Analytics

Configure Google Analytics:

```env
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

### Performance Monitoring

- Monitor booking completion rates
- Track payment success rates
- Monitor email delivery rates
- Track user engagement metrics

## 🔧 Advanced Configuration

### Custom Email Templates

Edit email templates in `src/services/emailNotificationService.ts`

### Custom Payment Flow

Modify payment processing in `supabase/functions/create-payment-session/`

### Custom Validation Rules

Update validation logic in `src/services/bookingManagementService.ts`

## 🆘 Troubleshooting

### Common Issues

#### Payment Processing Fails

- Check Stripe API keys are correct
- Verify webhook endpoint is accessible
- Check Stripe dashboard for errors

#### Emails Not Sending

- Verify email service credentials
- Check email service dashboard
- Test with a simple email first

#### Database Connection Issues

- Verify Supabase credentials
- Check network connectivity
- Verify database migrations ran successfully

#### Booking Validation Errors

- Check date format (YYYY-MM-DD)
- Verify property exists
- Check availability constraints

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
DEBUG=true
```

## 📞 Support

### Getting Help

1. Check the troubleshooting section above
2. Review error logs in your console
3. Check service dashboards (Stripe, Supabase, etc.)
4. Create an issue in the repository

### Emergency Contacts

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Email Service Support**: Check your provider's support page

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks

- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Review security settings monthly
- [ ] Monitor error rates weekly
- [ ] Backup database daily
- [ ] Test booking flow weekly

### Security Updates

- [ ] Keep all dependencies updated
- [ ] Monitor security advisories
- [ ] Regularly audit API key usage
- [ ] Review access logs monthly

## 📈 Scaling Considerations

### High Traffic

- Implement caching (Redis)
- Use CDN for static assets
- Consider database read replicas
- Implement queue system for emails

### International Expansion

- Add multi-currency support
- Implement localization
- Add regional payment methods
- Consider regional hosting

## 🎯 Best Practices

### Security

- Never commit `.env` files
- Use environment-specific keys
- Implement proper input validation
- Regular security audits
- Monitor for suspicious activity

### Performance

- Optimize images and assets
- Implement lazy loading
- Use proper caching strategies
- Monitor Core Web Vitals

### User Experience

- Clear error messages
- Loading states for all actions
- Mobile-first design
- Accessibility compliance
- Fast page load times

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Need help?** Create an issue in the repository or contact the development team.

**Last updated**: January 2024
**Version**: 1.0.0
