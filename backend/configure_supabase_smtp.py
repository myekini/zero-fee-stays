#!/usr/bin/env python3
"""
Configure Supabase to use Resend SMTP for authentication emails
"""

import asyncio
import httpx
import os
from app.core.config import settings

async def configure_supabase_smtp():
    """Configure Supabase to use Resend SMTP"""
    
    # You need to get these from your Supabase dashboard
    SUPABASE_PROJECT_REF = "ihgzllefbkzqnomsviwh"  # From your URL
    SUPABASE_ACCESS_TOKEN = input("Please enter your Supabase access token (from https://supabase.com/dashboard/account/tokens): ")
    
    smtp_config = {
        "external_email_enabled": True,
        "mailer_smtp": {
            "admin_email": "admin@hiddystays.com",
            "host": "smtp.resend.com",
            "port": 587,
            "user": "resend", 
            "pass": "re_ZvfeXHyi_8hnNJSiHuMQc7Da9D9qyNQ5F",  # Your Resend API key
            "sender_name": "HiddyStays"
        },
        "mailer_subjects": {
            "confirmation": "Welcome to HiddyStays - Please verify your email",
            "recovery": "Reset your HiddyStays password",
            "email_change": "Confirm your new email address",
            "magic_link": "Your HiddyStays magic link"
        },
        "mailer_templates": {
            "confirmation": {
                "subject": "Welcome to HiddyStays - Please verify your email",
                "content_path": None,  # Use default template
            },
            "recovery": {
                "subject": "Reset your HiddyStays password", 
                "content_path": None,
            }
        }
    }
    
    try:
        print("🔧 Configuring Supabase to use Resend SMTP...")
        
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"https://api.supabase.com/v1/projects/{SUPABASE_PROJECT_REF}/config/auth",
                headers={
                    "Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                },
                json=smtp_config,
                timeout=30.0
            )
            
            if response.status_code == 200:
                print("✅ Supabase SMTP configured successfully!")
                print("📧 Auth emails will now be sent through Resend")
                print("🎨 Using HiddyStays branding")
                print("")
                print("⏱️  It may take a few minutes for changes to take effect")
                print("🧪 Test by signing up a new user")
                
            else:
                print(f"❌ Failed to configure SMTP: {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error configuring SMTP: {e}")

if __name__ == "__main__":
    asyncio.run(configure_supabase_smtp())