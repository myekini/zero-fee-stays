# Stripe Webhook Setup Guide

## Overview
This guide explains how to set up Stripe webhooks for HiddyStays to ensure reliable payment processing.

---

## Why Webhooks Are Important

**Without webhooks:**
- Payment confirmation relies on user returning to success page
- If user closes browser, booking might stay "pending"
- Less reliable payment tracking

**With webhooks:**
- Stripe notifies your server directly when payment succeeds
- Works even if user closes browser
- Handles edge cases (refunds, failed payments, etc.)
- Production-grade reliability

---

## Local Development Setup

### Step 1: Install Stripe CLI

**macOS/Linux:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases/latest

### Step 2: Login to Stripe CLI
```bash
stripe login
```

This will open your browser to authorize the CLI.

### Step 3: Forward Webhooks to Local Server
```bash
stripe listen --forward-to http://localhost:3000/api/payments/webhook
```

You should see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Update .env.local
Copy the webhook signing secret and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 5: Test Webhook
In another terminal, trigger a test event:
```bash
stripe trigger checkout.session.completed
```

Check your Next.js server logs - you should see:
```
✅ Webhook received: checkout.session.completed
```

---

## Production Setup

### Step 1: Deploy Your Application
First, deploy your Next.js app to production (Vercel, Railway, etc.)

Your webhook URL will be:
```
https://your-domain.com/api/payments/webhook
```

### Step 2: Create Webhook in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/payments/webhook
   ```
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`

5. Click "Add endpoint"

### Step 3: Get Signing Secret

After creating the endpoint:
1. Click on the webhook you just created
2. Click "Reveal" next to "Signing secret"
3. Copy the secret (starts with `whsec_`)

### Step 4: Add to Production Environment

Add the signing secret to your production environment variables:

**Vercel:**
```bash
vercel env add STRIPE_WEBHOOK_SECRET
# Paste your whsec_... secret
```

**Railway:**
```bash
railway variables --set STRIPE_WEBHOOK_SECRET=whsec_...
```

**Or through the dashboard:**
- Vercel: Settings → Environment Variables
- Railway: Variables tab
- Netlify: Site settings → Environment variables

### Step 5: Test Production Webhook

1. Create a test booking in production
2. Complete payment with test card (4242 4242 4242 4242)
3. Check Stripe Dashboard → Webhooks
4. Click on your webhook
5. Find the recent event
6. Check "Response" tab - should show "200 OK"

---

## Webhook Events Handled

### 1. checkout.session.completed
**When:** User completes payment on Stripe Checkout
**Action:**
- Updates booking status to "confirmed"
- Sends confirmation email to guest
- Sends notification email to host
- Creates in-app notification

### 2. payment_intent.succeeded
**When:** Payment successfully processes
**Action:**
- Backup confirmation (in case checkout.session.completed is missed)
- Updates booking to "confirmed"

### 3. payment_intent.payment_failed
**When:** Payment fails
**Action:**
- Updates booking to "cancelled"
- Notifies host of failed payment

### 4. charge.refunded
**When:** Payment is refunded
**Action:**
- Updates booking to "cancelled"
- Notifies host of refund

---

## Testing Webhooks

### Test with Stripe CLI (Local)

**Trigger successful payment:**
```bash
stripe trigger checkout.session.completed
```

**Trigger failed payment:**
```bash
stripe trigger payment_intent.payment_failed
```

**Trigger refund:**
```bash
stripe trigger charge.refunded
```

### Test with Real Flow (Local)

1. Start local server: `npm run dev`
2. Start Stripe listener: `stripe listen --forward-to http://localhost:3000/api/payments/webhook`
3. Complete a real booking with test card
4. Watch webhook logs in terminal

### Verify Webhook Delivery (Production)

1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook endpoint
3. View recent events
4. Check status codes (200 = success)
5. Click "Resend" to retry failed webhooks

---

## Troubleshooting

### Issue: "Webhook signature verification failed"

**Causes:**
- Wrong `STRIPE_WEBHOOK_SECRET`
- Secret from test mode used in production (or vice versa)
- Request body modified before reaching webhook handler

**Fix:**
1. Verify you're using the correct secret
2. Check you have matching test/production keys
3. Ensure no middleware modifies request body

### Issue: Webhook receives event but booking not updated

**Debug steps:**
1. Check webhook logs: `console.log` statements in route.ts
2. Verify `booking_id` is in Stripe session metadata
3. Check Supabase database permissions
4. Verify `SUPABASE_SERVICE_ROLE_KEY` is set

### Issue: Emails not sending

**Debug steps:**
1. Check Resend API key is set in Supabase function
2. Verify `FROM_EMAIL` domain is verified
3. Check Supabase Edge Function logs
4. Test email function directly

### Issue: 500 error in webhook response

**Debug steps:**
1. Check Next.js server logs
2. Verify all environment variables set
3. Check Supabase connection
4. Test with `stripe trigger` command

---

## Webhook Security

### Best Practices:
1. ✅ Always verify webhook signature (already implemented)
2. ✅ Use HTTPS in production (automatic with Vercel/Railway)
3. ✅ Never expose webhook secret in client code
4. ✅ Handle events idempotently (prevent duplicate processing)
5. ✅ Return 200 status quickly, process async

### What NOT to Do:
- ❌ Don't skip signature verification
- ❌ Don't hardcode webhook secret
- ❌ Don't process webhooks synchronously if slow
- ❌ Don't return errors for expected failures

---

## Monitoring Webhooks

### Stripe Dashboard
- Go to: https://dashboard.stripe.com/webhooks
- View delivery attempts
- Check response codes
- Resend failed events

### Application Logs
Check your server logs for:
```
✅ Webhook received: checkout.session.completed
💳 Processing checkout session: cs_test_...
✅ Booking abc123 confirmed
✅ Booking confirmation emails sent
```

### Set Up Alerts
**Recommended: Monitor failed webhooks**

1. Stripe can send alerts for failed webhooks
2. Set up in Dashboard → Webhooks → [Your endpoint] → Settings
3. Add email or Slack notifications

---

## Common Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0027 6000 3184 | 3D Secure authentication |
| 4000 0000 0000 9995 | Insufficient funds |

**Expiry:** Any future date (e.g., 12/34)
**CVC:** Any 3 digits (e.g., 123)

---

## Webhook Development Checklist

### Local Development:
- [ ] Stripe CLI installed
- [ ] `stripe listen` running
- [ ] `STRIPE_WEBHOOK_SECRET` in .env.local
- [ ] Test events working
- [ ] Logs showing successful processing

### Production:
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Events selected (checkout.session.completed, etc.)
- [ ] Signing secret added to environment
- [ ] Test booking completed successfully
- [ ] Webhook shows 200 response in dashboard
- [ ] Emails sending correctly
- [ ] Notifications created
- [ ] Error monitoring set up

---

## Alternative: Polling (Not Recommended)

If webhooks are difficult to set up, you can poll for payment status:

```typescript
// Not recommended - use webhooks instead
async function pollPaymentStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status === 'paid') {
    // Update booking
  }
}
```

**Why not recommended:**
- Adds server load
- Slower confirmation
- Less reliable
- Misses edge cases

---

## Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

## Support

If you encounter issues:
1. Check Stripe Dashboard webhook logs
2. Check Next.js server logs
3. Test with `stripe trigger` command
4. Verify all environment variables
5. Check this guide's troubleshooting section

For Stripe-specific issues: https://support.stripe.com
