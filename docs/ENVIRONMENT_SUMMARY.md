# Environment Variables Summary

## 🎯 Quick Setup

1. Copy `env.example` to `.env`
2. Configure the services below
3. Start the application

## 📋 Required Services (All Free)

### 1. Supabase (Database & Auth)

- **Cost**: FREE tier
- **What you get**: Database, Authentication, Storage
- **Setup**: Create account at [supabase.com](https://supabase.com)
- **Required variables**:
  ```env
  SUPABASE_URL=https://your-project-ref.supabase.co
  SUPABASE_ANON_KEY=your_supabase_anon_key_here
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
  ```

### 2. Stripe (Payments)

- **Cost**: FREE for testing
- **What you get**: Payment processing
- **Setup**: Create account at [stripe.com](https://stripe.com)
- **Required variables**:
  ```env
  STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
  STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
  STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
  ```

### 3. Email Service (Choose One)

**Option A: Resend (Recommended)**

- **Cost**: FREE tier (3,000 emails/month)
- **Setup**: [resend.com](https://resend.com)
- **Variable**: `RESEND_API_KEY=re_your_resend_api_key_here`

**Option B: SendGrid**

- **Cost**: FREE tier (100 emails/day)
- **Setup**: [sendgrid.com](https://sendgrid.com)
- **Variable**: `SENDGRID_API_KEY=SG.your_sendgrid_api_key_here`

### 4. Security Secrets

Generate these commands:

```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For SESSION_SECRET
```

## 🗺️ Maps (Completely Free)

**OpenStreetMap with Leaflet**

- ✅ **No API key required**
- ✅ **No usage limits**
- ✅ **Completely free forever**
- ✅ **Interactive maps**
- ✅ **Address geocoding**
- ✅ **Distance calculations**
- ✅ **Mobile-optimized**

## 💰 Total Cost: $0

All services offer generous free tiers that are sufficient for:

- Development and testing
- Small to medium production apps
- Up to thousands of users

## 🚀 Getting Started

1. **Copy environment file**:

   ```bash
   cp env.example .env
   ```

2. **Configure services** (see SETUP_GUIDE.md for detailed steps)

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

## 📱 Features Included

- ✅ **Interactive Property Maps** (OpenStreetMap)
- ✅ **User Authentication** (Supabase)
- ✅ **Payment Processing** (Stripe)
- ✅ **Email Notifications** (Resend/SendGrid)
- ✅ **File Storage** (Supabase/Cloudinary)
- ✅ **Mobile Optimization**
- ✅ **PWA Support**
- ✅ **Analytics Ready**

## 🔒 Security Features

- JWT-based authentication
- Secure session management
- CORS protection
- Rate limiting
- Input validation
- Error monitoring ready

## 📊 Analytics (Optional)

- Google Analytics (FREE)
- Mixpanel (FREE tier)
- Sentry error tracking (FREE tier)

## 🎯 Next Steps

1. Follow the detailed setup guide in `SETUP_GUIDE.md`
2. Configure your `.env` file
3. Test all features locally
4. Deploy to your preferred platform
5. Set up production environment variables

---

**Need help?** Check `SETUP_GUIDE.md` for detailed step-by-step instructions.
