# 🚀 HiddyStays Payment System Setup Guide

This guide will help you set up the complete end-to-end payment flow using Stripe for your HiddyStays property rental platform.

## 📋 Prerequisites

- Stripe account (sign up at [stripe.com](https://stripe.com))
- Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Python 3.8+ installed

## 🔧 Step 1: Stripe Configuration

### 1.1 Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 1.2 Set Up Webhook Endpoint

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-domain.com/functions/v1/stripe-webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Webhook Secret** (starts with `whsec_`)

## 🔧 Step 2: Environment Configuration

### 2.1 Create Environment File

Copy the example environment file:

```bash
cp env.example .env
```

### 2.2 Configure Environment Variables

Edit your `.env` file with your actual values:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:8000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
```

## 🔧 Step 3: Database Setup

### 3.1 Create Required Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    guest_id UUID REFERENCES profiles(id),
    host_id UUID REFERENCES profiles(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests_count INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table (if not exists)
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    price_per_night DECIMAL(10,2) NOT NULL,
    max_guests INTEGER DEFAULT 1,
    images TEXT[],
    host_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent_id ON bookings(stripe_payment_intent_id);
```

### 3.2 Set Up Row Level Security (RLS)

```sql
-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = guest_id OR auth.uid() = host_id);

CREATE POLICY "Users can insert their own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Hosts can update their property bookings" ON bookings
    FOR UPDATE USING (auth.uid() = host_id);

-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties" ON properties
    FOR SELECT USING (true);

CREATE POLICY "Hosts can manage their properties" ON properties
    FOR ALL USING (auth.uid() = host_id);
```

## 🔧 Step 4: Backend Setup

### 4.1 Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4.2 Start the Backend Server

```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🔧 Step 5: Frontend Setup

### 5.1 Install Dependencies

```bash
npm install
```

### 5.2 Start the Development Server

```bash
npm run dev
```

## 🔧 Step 6: Deploy Supabase Functions

### 6.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 6.2 Login to Supabase

```bash
supabase login
```

### 6.3 Deploy Functions

```bash
supabase functions deploy stripe-webhook
supabase functions deploy create-payment-session
supabase functions deploy verify-payment
```

## 🧪 Step 7: Testing the Payment Flow

### 7.1 Test Card Numbers

Use these test card numbers in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### 7.2 Test the Complete Flow

1. Start both frontend and backend servers
2. Navigate to a property page
3. Click "Book Now"
4. Fill in booking details
5. Click "Complete Payment"
6. Use test card number `4242 4242 4242 4242`
7. Complete the payment
8. Verify you're redirected to the success page

## 🔍 Step 8: Monitoring and Debugging

### 8.1 Check Stripe Dashboard

- Go to [Stripe Dashboard > Payments](https://dashboard.stripe.com/payments)
- Verify payments are being processed
- Check webhook events in [Webhooks section](https://dashboard.stripe.com/webhooks)

### 8.2 Check Supabase Logs

```bash
supabase functions logs stripe-webhook
supabase functions logs create-payment-session
```

### 8.3 Check Backend Logs

Monitor your FastAPI server logs for any errors.

## 🚨 Common Issues and Solutions

### Issue 1: "Invalid API Key" Error

**Solution**: Ensure your Stripe API keys are correct and you're using the right environment (test vs live).

### Issue 2: CORS Errors

**Solution**: Update `ALLOWED_ORIGINS` in your `.env` file to include your frontend URL.

### Issue 3: Webhook Not Receiving Events

**Solution**:

1. Check webhook endpoint URL is correct
2. Verify webhook secret is configured
3. Check Supabase function logs

### Issue 4: Payment Session Creation Fails

**Solution**:

1. Verify Stripe secret key is correct
2. Check booking creation in database
3. Ensure all required fields are provided

### Issue 5: Payment Verification Fails

**Solution**:

1. Check session ID is being passed correctly
2. Verify webhook is updating booking status
3. Check database connection

## 🔒 Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use environment variables** for all sensitive data
3. **Validate all inputs** on both frontend and backend
4. **Implement proper error handling** without exposing sensitive information
5. **Use HTTPS** in production
6. **Regularly rotate API keys**
7. **Monitor for suspicious activity**

## 📊 Production Checklist

Before going live:

- [ ] Switch to Stripe live keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment methods
- [ ] Set up monitoring and alerting
- [ ] Configure proper error handling
- [ ] Set up backup and recovery procedures
- [ ] Test the complete payment flow
- [ ] Verify webhook reliability
- [ ] Set up proper logging
- [ ] Configure rate limiting

## 🆘 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Test with Stripe's test mode first
4. Check Stripe's [documentation](https://stripe.com/docs)
5. Review Supabase [documentation](https://supabase.com/docs)

## 📈 Next Steps

Once the basic payment flow is working:

1. Add email notifications
2. Implement booking management
3. Add refund functionality
4. Set up analytics tracking
5. Add multi-currency support
6. Implement subscription payments
7. Add payment method management

---

**Happy coding! 🎉**

Your payment system is now ready to process real bookings and payments securely.


