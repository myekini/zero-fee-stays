#!/bin/bash

# Setup Email System Secrets for Supabase
# Run this after your Resend domain is verified

echo "🔧 Setting up Supabase secrets for email system..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Prompt for Resend API key
echo ""
read -p "Enter your Resend API Key (re_...): " RESEND_API_KEY

if [ -z "$RESEND_API_KEY" ]; then
    echo "❌ Resend API Key is required"
    exit 1
fi

# Prompt for from email
read -p "Enter FROM_EMAIL (e.g., noreply@hiddystays.com): " FROM_EMAIL
FROM_EMAIL=${FROM_EMAIL:-noreply@hiddystays.com}

# Prompt for from name
read -p "Enter FROM_NAME (default: HiddyStays): " FROM_NAME
FROM_NAME=${FROM_NAME:-HiddyStays}

# Prompt for support email
read -p "Enter SUPPORT_EMAIL (default: support@hiddystays.com): " SUPPORT_EMAIL
SUPPORT_EMAIL=${SUPPORT_EMAIL:-support@hiddystays.com}

echo ""
echo "📝 Setting secrets..."

# Set secrets
npx supabase secrets set RESEND_API_KEY="$RESEND_API_KEY"
npx supabase secrets set FROM_EMAIL="$FROM_EMAIL"
npx supabase secrets set FROM_NAME="$FROM_NAME"
npx supabase secrets set SUPPORT_EMAIL="$SUPPORT_EMAIL"

echo ""
echo "✅ Secrets set successfully!"
echo ""
echo "📧 Email configuration:"
echo "  - Resend API Key: ****${RESEND_API_KEY: -4}"
echo "  - From Email: $FROM_EMAIL"
echo "  - From Name: $FROM_NAME"
echo "  - Support Email: $SUPPORT_EMAIL"
echo ""
echo "🚀 Next steps:"
echo "  1. Deploy the email function: npx supabase functions deploy send-email-notification"
echo "  2. Test email sending via API or dashboard"
echo "  3. Verify emails are being sent successfully"
