# 🚀 HiddyStays - Complete Deployment Guide

**Last Updated:** January 2025  
**Platform:** Next.js 15 + Supabase + Stripe + Resend + Vercel

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Email Configuration](#email-configuration)
5. [Build & Deploy](#build--deploy)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Testing Checklist](#testing-checklist)
8. [Troubleshooting](#troubleshooting)
9. [Production Checklist](#production-checklist)

---

## Prerequisites

### Required Accounts

- ✅ [Supabase](https://supabase.com) - Database, Auth, Edge Functions
- ✅ [Stripe](https://stripe.com) - Payment processing
- ✅ [Resend](https://resend.com) - Email delivery
- ✅ [Vercel](https://vercel.com) - Hosting (recommended)

### Required Tools

- Node.js 18+ and npm
- Git
- Supabase CLI: `npm install -g supabase`

---

## Environment Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd zero-fee-stays
npm install
```

### 2. Create Environment File

Copy `env.template` to `.env.local`:

```bash
cp env.template .env.local
```

### 3. Configure Environment Variables

Edit `.env.local` with your credentials:

```env
# Supabase (Get from https://app.supabase.com/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend (Get from https://resend.com/api-keys)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=HiddyStays
SUPPORT_EMAIL=support@yourdomain.com

# NextAuth
NEXTAUTH_SECRET=your-generated-secret # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000 # Change to production URL when deploying

# App Configuration
NEXT_PUBLIC_APP_NAME=HiddyStays
NEXT_PUBLIC_APP_VERSION=1.0.0
APP_URL=http://localhost:3000 # Change to production URL

# Admin Credentials (for initial setup)
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=secure-password-here

# Optional
NEXT_PUBLIC_OPENCAGE_API_KEY=your-geocoding-key
DEBUG=true
LOG_LEVEL=info
```

---

## Database Setup

### 1. Apply Migrations

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → SQL Editor
2. Run these migrations in order:

```sql
-- Email System Migration
-- Copy contents from: supabase/migrations/20241220000000_email_system.sql

-- Property Columns Migration
-- Copy contents from: supabase/migrations/20250101000000_add_missing_property_columns.sql

-- Property Management Migration
-- Copy contents from: supabase/migrations/20250731220936_add_property_management_columns.sql

-- Notifications System
-- Copy contents from: supabase/migrations/20250731220937_add_notifications_table.sql

-- Storage Buckets
-- Copy contents from: supabase/migrations/20250731220938_setup_storage_buckets.sql

-- Guest Info for Bookings
-- Copy contents from: supabase/migrations/20250731223015_add_guest_info_to_bookings.sql

-- Role Management (CRITICAL)
-- Copy contents from: supabase/migrations/20250102000000_add_role_management.sql

-- Activity Tracking
-- Copy contents from: supabase/migrations/20250102000001_add_activity_tracking.sql

-- Payment System Fixes (CRITICAL)
-- Copy contents from: supabase/migrations/20251013100000_payment_system_fixes.sql
```

**Option B: Via Supabase CLI**

```bash
# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

### 2. Verify Role Column

Run this verification query in SQL Editor:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'role';
```

**Expected Result:**

```
column_name | data_type             | column_default
------------|----------------------|-------------------
role        | character varying(20) | 'user'::character varying
```

### 3. Create Admin User

After migrations, create your first admin user via Supabase Dashboard:

1. Go to Authentication → Users → Add User
2. Create user with your admin email
3. Go to SQL Editor and run:

```sql
UPDATE public.profiles
SET role = 'admin', is_host = true
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@yourdomain.com');
```

---

## Email Configuration

### 1. Setup Resend Domain

1. Sign up for Resend account at https://resend.com/signup
2. Add your domain (e.g., hiddystays.com)
3. Copy the 3 DNS records Resend provides
4. Add DNS records at your domain provider:
   - TXT record for SPF
   - TXT record for DKIM
   - TXT record for DMARC
5. Wait 10-30 minutes, click Verify in Resend
6. Get API key from Resend dashboard

### 2. Deploy Email Edge Function

```bash
# Set Resend API key
npx supabase secrets set RESEND_API_KEY=re_your_key_here

# Deploy function
npx supabase functions deploy send-email-notification
```

### 3. Verify Email Function

Test email sending:

```bash
# Run test script
bash scripts/test-email.sh
```

Or manually via Supabase Dashboard → Functions → send-email-notification → Test

---

## Build & Deploy

### Local Development

```bash
npm run dev
# Server starts at http://localhost:3000
```

### Production Build

```bash
# Build
npm run build

# Start production server
npm run start
```

### Deploy to Vercel (Recommended)

1. **Connect Repository**

   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Change `APP_URL` and `NEXTAUTH_URL` to your production domain

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Alternative Hosting

The app works on any Next.js-compatible platform:

- **Railway**: Connect GitHub repo, add env vars, deploy
- **Netlify**: Similar to Vercel
- **DigitalOcean App Platform**: Supports Next.js
- **AWS Amplify**: Full Next.js support

---

## Post-Deployment Configuration

### 1. Update Supabase Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add production URL to:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/auth/callback`

### 2. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` env var

### 3. Verify Resend Domain

1. Go to Resend Dashboard → Domains
2. Add your domain
3. Add DNS records (MX, TXT, DKIM)
4. Verify domain
5. Update `FROM_EMAIL` with verified domain

### 4. Configure OAuth Providers

**Google OAuth:**

1. Google Cloud Console → Credentials
2. Add authorized redirect URI: `https://yourdomain.com/auth/callback`

**GitHub OAuth:**

1. GitHub Settings → Developer Settings → OAuth Apps
2. Add callback URL: `https://yourdomain.com/auth/callback`

**Twitter OAuth:**

1. Twitter Developer Portal → Apps
2. Add callback URL: `https://yourdomain.com/auth/callback`

---

## Testing Checklist

### Critical Flows to Test

```
□ Homepage loads correctly
□ Properties page shows listings
□ Property detail page loads
□ Sign up flow works
□ Welcome email received
□ Email verification works
□ Sign in flow works
□ Sign out flow works
□ Password reset works
□ Profile page loads and edits work
□ Booking flow works end-to-end
□ Payment processing works
□ Booking confirmation email received
□ Host notification email received
□ Admin dashboard loads (sign in as admin)
□ Admin stats display correctly
□ Theme switching works (dark/light)
□ Mobile responsive design works
□ All OAuth providers work (Google, GitHub, Twitter)
```

### Database & Auth

- [ ] All migrations applied successfully
- [ ] Role column exists in profiles table
- [ ] Admin user created and has admin role
- [ ] Can sign up new users
- [ ] Can sign in with existing users

### Email System

- [ ] Email function deployed (check Supabase Functions)
- [ ] Resend API key configured
- [ ] Test email sends successfully
- [ ] Booking confirmation emails work

### Core Features

- [ ] Homepage loads without errors
- [ ] Properties page displays listings
- [ ] Property detail pages work
- [ ] Booking flow completes
- [ ] Payment processing works (test mode)
- [ ] Host dashboard accessible
- [ ] Admin dashboard accessible

### API Endpoints

Test critical endpoints:

```bash
# Properties API
curl https://your-domain.com/api/properties

# Health check
curl https://your-domain.com/api/health
```

---

## Troubleshooting

### Build Errors

**Issue:** TypeScript errors about role column

**Solution:**

```bash
# Verify role migration applied
# Run verification query in Supabase SQL Editor (see Database Setup step 2)

# If missing, apply role management migration
```

**Issue:** ESLint configuration errors

**Solution:**

```bash
# Update eslint.config.js - known issue with Next.js 15
# Error can be ignored for now, doesn't affect runtime
```

### Runtime Errors

**Issue:** Properties page shows "column email does not exist"

**Status:** ✅ FIXED in latest code (Jan 2025)

**Issue:** "Missing environment variables"

**Solution:**

```bash
# Check .env.local has all required variables
# For Vercel, check Dashboard → Settings → Environment Variables
# Redeploy after adding variables
```

**Issue:** Email notifications not sending

**Solution:**

```bash
# Check Resend dashboard for errors
# Verify FROM_EMAIL domain is verified in Resend
# Check Supabase Functions logs for errors
npx supabase functions logs send-email-notification
```

### Payment Issues

**Issue:** Stripe checkout fails

**Solution:**

```bash
# Verify Stripe keys are correct (test vs live mode)
# Check webhook secret matches Stripe dashboard
# Test with Stripe test cards: 4242 4242 4242 4242
```

### Database Connection Issues

**Issue:** Can't connect to Supabase

**Solution:**

```bash
# Verify SUPABASE_URL and keys are correct
# Check Supabase project is running (not paused)
# Verify network connectivity
```

---

## Production Checklist

### Security Final Check

```
□ All environment variables secured (not exposed to client)
□ Service role key never in client code
□ RLS policies enabled on all tables
□ API routes have authentication checks
□ Admin routes restricted to admin users
□ Rate limiting configured
□ HTTPS enabled (Vercel default)
□ Secure cookies configured
```

### Before Going Live

- [ ] Change all default passwords
- [ ] Use production Stripe keys (not test)
- [ ] Enable 2FA on Supabase, Stripe, Resend
- [ ] Review RLS policies (restrictive by default)
- [ ] Enable HTTPS only
- [ ] Set secure NEXTAUTH_SECRET
- [ ] Review .gitignore (no secrets committed)
- [ ] Configure CORS properly
- [ ] Enable rate limiting (Supabase has built-in)

### Performance Optimization

**Supabase:**

- Enable connection pooling (for high traffic)
- Add indexes for frequently queried columns (already added in migrations)
- Enable caching for static data

**Next.js:**

- Use Image component for all images (already implemented)
- Enable Next.js caching strategies
- Use static generation where possible

**Vercel:**

- Enable Edge Functions for dynamic routes
- Configure caching headers
- Use Vercel Analytics

---

## Monitoring Setup

### After Deployment

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor page views, performance

2. **Supabase Monitoring**
   - Database → Logs
   - Auth → Users activity
   - Storage → Usage

3. **Stripe Monitoring**
   - Dashboard → Events
   - Monitor webhooks
   - Check for failed payments

4. **Resend Monitoring**
   - Dashboard → Logs
   - Monitor email delivery
   - Check bounce rates

---

## Rollback Plan

**If issues occur:**

```bash
# Option 1: Vercel Dashboard
# Go to Deployments → Select previous stable deployment → Promote to Production

# Option 2: Git Revert
git revert HEAD
git push origin main
# Vercel will auto-deploy previous version
```

---

## Support & Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Resend Docs](https://resend.com/docs)

### Project-Specific Docs

- `SOLUTION_OVERVIEW.md` - Complete project documentation
- `AUTH_SYSTEM_COMPLETE_GUIDE.md` - Authentication system guide
- `PAYMENT_WEEK1_IMPLEMENTATION.md` - Payment system guide

### Getting Help

1. Check troubleshooting section above
2. Review error logs in respective dashboards
3. Check GitHub issues (if using GitHub)
4. Supabase Discord / Stripe support

---

## Changelog

### v1.0.0 (January 2025)

- ✅ Fixed Properties API email query
- ✅ Fixed AuthProvider role handling
- ✅ Fixed Header async permissions
- ✅ All critical issues resolved
- ✅ Production ready

---

**System Status:** 🟢 Production Ready

**Last Verified:** January 2025

**Next Review:** When adding new features or after user feedback
