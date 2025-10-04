# HiddyStays Documentation

This folder contains all project documentation organized by category.

## 📁 Folder Structure

### `/guides` - Setup & Deployment Guides
- **[DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md)** - Complete production deployment guide for Vercel, Resend, Stripe
- **[BOOKING_FLOW_GUIDE.md](guides/BOOKING_FLOW_GUIDE.md)** - End-to-end booking flow implementation details
- **[STRIPE_WEBHOOK_SETUP.md](guides/STRIPE_WEBHOOK_SETUP.md)** - Stripe payment integration and webhook configuration

### `/database` - Database Migrations & Schema
- **[initial-setup.sql](database/initial-setup.sql)** - Required database migration for guest booking columns
- **[fix-schema.sql](database/fix-schema.sql)** - Schema fixes and updates
- **[fix-schema-add-guest-phone.sql](database/fix-schema-add-guest-phone.sql)** - Guest phone column addition

## 🚀 Quick Start

### For New Developers
1. Read the main [README.md](../README.md) in the root folder
2. Follow [DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md) for local setup
3. Review [BOOKING_FLOW_GUIDE.md](guides/BOOKING_FLOW_GUIDE.md) to understand the core booking system

### For Deployment
1. Run database migrations from `/database` folder in Supabase SQL Editor
2. Follow [DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md) step-by-step
3. Configure Stripe webhooks using [STRIPE_WEBHOOK_SETUP.md](guides/STRIPE_WEBHOOK_SETUP.md)

## 📚 Additional Resources

### Root-Level Documentation
- **[CLAUDE.md](../CLAUDE.md)** - Instructions for AI assistant (Claude Code)
- **[env.template](../env.template)** - Environment variables template

### Migration Files
All Supabase migrations are in `/supabase/migrations/` with automatic timestamp-based ordering.

## 🤝 Contributing

When adding new documentation:
- Place guides in `/guides`
- Place SQL files in `/database`
- Update this README with links to new files
- Use clear, descriptive filenames

## 📝 Notes

- All deployment documentation has been consolidated into `DEPLOYMENT_GUIDE.md`
- Legacy/redundant docs have been removed to keep the repository clean
- Database migrations should be applied in order (oldest first)
