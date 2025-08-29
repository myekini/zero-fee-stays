# Zero Fee Stays - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up Zero Fee Stays with free services and minimal costs.

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- A modern web browser

## 🔧 Environment Setup

### 1. Copy Environment File

```bash
cp env.example .env
```

### 2. Required Services (Free Tier)

#### A. Supabase (Database & Authentication) - FREE

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your credentials from Settings > API
4. Add to `.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

#### B. Stripe (Payments) - FREE for testing

1. Go to [stripe.com](https://stripe.com)
2. Create an account
3. Get your test keys from Dashboard > Developers > API keys
4. Add to `.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### C. Email Service (Choose One)

**Option 1: Resend (Recommended) - FREE tier**

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Get your API key
4. Add to `.env`:

```env
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

**Option 2: SendGrid - FREE tier (100 emails/day)**

1. Go to [sendgrid.com](https://sendgrid.com)
2. Create free account
3. Get your API key
4. Add to `.env`:

```env
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

### 3. Optional Services (Free Tiers)

#### A. File Storage (Choose One)

**Option 1: Supabase Storage (Recommended) - FREE**

```env
SUPABASE_STORAGE_BUCKET=property-images
```

**Option 2: Cloudinary - FREE tier**

1. Go to [cloudinary.com](https://cloudinary.com)
2. Create free account
3. Add to `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### B. Analytics (Optional)

**Google Analytics - FREE**

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property
3. Add to `.env`:

```env
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

**Mixpanel - FREE tier (1,000 events/month)**

1. Go to [mixpanel.com](https://mixpanel.com)
2. Create free account
3. Add to `.env`:

```env
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

**Sentry (Error tracking) - FREE tier**

1. Go to [sentry.io](https://sentry.io)
2. Create free account
3. Add to `.env`:

```env
SENTRY_DSN=https://your_sentry_dsn_here
```

### 4. Maps Configuration

**OpenStreetMap (FREE - No API key required)**

- No configuration needed! The app uses OpenStreetMap by default
- Completely free with no usage limits

**Alternative: Mapbox (FREE tier - 50,000 map loads/month)**

1. Go to [mapbox.com](https://mapbox.com)
2. Create free account
3. Add to `.env`:

```env
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token_here
```

### 5. Security Configuration

Generate secure secrets:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32
```

Add to `.env`:

```env
JWT_SECRET=your_generated_jwt_secret_here
SESSION_SECRET=your_generated_session_secret_here
```

### 6. Application URLs

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

### 7. Legal Pages (Required for Production)

Create these pages or use placeholder URLs:

```env
PRIVACY_POLICY_URL=https://yourdomain.com/privacy
TERMS_OF_SERVICE_URL=https://yourdomain.com/terms
CANCELLATION_POLICY_URL=https://yourdomain.com/cancellation
```

### 8. CORS Configuration

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
```

## 🗺️ Maps Setup

The application now uses **OpenStreetMap with Leaflet** which is completely free and requires no API keys. Features include:

- ✅ Interactive property maps
- ✅ Address geocoding
- ✅ Distance calculations
- ✅ Platform-specific directions (iOS/Android/Web)
- ✅ Custom markers and popups
- ✅ Mobile-optimized interface

### Map Features

1. **Property Location Display**: Shows exact location of properties
2. **Interactive Maps**: Users can zoom, pan, and explore areas
3. **Directions**: One-click directions to properties
4. **Distance Calculation**: Shows distance from user's location
5. **Mobile Optimization**: Native map app integration

## 💰 Cost Breakdown

### Free Services (Recommended Setup)

- **Supabase**: Database, Auth, Storage - FREE tier
- **Resend**: Email service - FREE tier (3,000 emails/month)
- **OpenStreetMap**: Maps and geocoding - COMPLETELY FREE
- **Stripe**: Payment processing - FREE for testing
- **Sentry**: Error tracking - FREE tier (5,000 errors/month)

### Total Monthly Cost: $0

### Optional Paid Services

- **Stripe Live**: 2.9% + 30¢ per transaction
- **Mapbox**: $0.50 per 1,000 map loads (after free tier)
- **Google Maps**: $200 free credit/month, then pay-per-use

## 🚀 Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔒 Security Checklist

- [ ] All API keys are in `.env` file
- [ ] `.env` is in `.gitignore`
- [ ] Using test keys for development
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled

## 📱 Mobile Features

The app includes comprehensive mobile optimizations:

- **Touch Gestures**: Swipe, pinch-to-zoom, pull-to-refresh
- **Native Maps**: Automatic detection of iOS/Android for optimal map apps
- **PWA Support**: Install as mobile app
- **Offline Support**: Basic offline functionality
- **Haptic Feedback**: Touch feedback on mobile devices

## 🛠️ Troubleshooting

### Common Issues

1. **Map not loading**: Check internet connection, OpenStreetMap is free but requires internet
2. **Geocoding errors**: Address might be too specific, try broader location
3. **Payment issues**: Ensure Stripe test keys are correct
4. **Email not sending**: Check email service API key and configuration

### Support

For issues with:

- **OpenStreetMap**: Check [nominatim.org](https://nominatim.org)
- **Supabase**: Check [supabase.com/docs](https://supabase.com/docs)
- **Stripe**: Check [stripe.com/docs](https://stripe.com/docs)

## 🎯 Next Steps

1. Configure your `.env` file with the services above
2. Run the application locally
3. Test all features
4. Deploy to your preferred hosting platform
5. Set up production environment variables
6. Configure custom domain and SSL

## 📊 Analytics & Monitoring

The app includes built-in analytics for:

- User behavior tracking
- Property performance
- Booking analytics
- Revenue tracking
- Error monitoring

All analytics are optional and use free tiers where possible.

---

**Need help?** Check the documentation or create an issue in the repository.
