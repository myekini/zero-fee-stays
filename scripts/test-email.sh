#!/bin/bash

# Test Email Function
# This script tests the email notification system

echo "🧪 Testing Email Notification System..."
echo ""

# Get your email
read -p "Enter your email address to receive a test email: " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
    echo "❌ Email address is required"
    exit 1
fi

echo ""
echo "📧 Sending test welcome email to: $TEST_EMAIL"
echo ""

# Invoke the function
curl -i --location --request POST \
  'https://ihgzllefbkzqnomsviwh.supabase.co/functions/v1/send-email-notification' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZ3psbGVmYmt6cW5vbXN2aXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTg0NjQsImV4cCI6MjA2OTU3NDQ2NH0.IMmU1sBtpDmmg9GZNZkMedRFCF7FFLsZz4InGQkFKKE' \
  --header 'Content-Type: application/json' \
  --data "{
    \"to\": \"$TEST_EMAIL\",
    \"subject\": \"Test Email from HiddyStays\",
    \"template\": \"welcome\",
    \"data\": {
      \"name\": \"Test User\",
      \"email\": \"$TEST_EMAIL\"
    }
  }"

echo ""
echo ""
echo "✅ Test email sent!"
echo "📬 Check your inbox at: $TEST_EMAIL"
echo "📁 Also check your spam folder if you don't see it"
echo ""
echo "⚠️ NOTE: Email will only work if your Resend domain is verified!"
echo "   Check verification status at: https://resend.com/domains"
