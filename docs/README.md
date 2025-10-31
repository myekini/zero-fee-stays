# 📚 HiddyStays Documentation

> **Zero-Fee Property Rental Platform** - Complete documentation for developers, administrators, and deployment teams.

---

## 🚀 Quick Start

### For New Developers

1. **[Project Overview](system-guides/01-project-overview.md)** - Understand the complete system
2. **[Deployment Guide](setup-guides/01-deployment-guide.md)** - Get the application running locally
3. **[Authentication System](system-guides/02-authentication-system.md)** - Learn the auth implementation

### For Deployment Teams

1. **[Deployment Guide](setup-guides/01-deployment-guide.md)** - Production deployment steps
2. **[Email Configuration](setup-guides/02-email-configuration.md)** - Email system setup
3. **[Stripe Webhooks](setup-guides/03-stripe-webhooks.md)** - Payment webhook configuration

### For Implementation Teams

1. **[Payment System Basics](implementation-guides/01-payment-system-basics.md)** - Core payment implementation
2. **[Payment System Advanced](implementation-guides/02-payment-system-advanced.md)** - Advanced payment features
3. **[Booking Flow](implementation-guides/03-booking-flow.md)** - Complete booking process

---

## 📁 Documentation Structure

### 🏗️ **System Guides** (`/system-guides/`)

Core system documentation and architecture overview.

| File                                                                         | Description                                                      | Audience           |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------ |
| **[01-project-overview.md](system-guides/01-project-overview.md)**           | Complete project documentation, architecture, and business model | All teams          |
| **[02-authentication-system.md](system-guides/02-authentication-system.md)** | Authentication system implementation and security                | Developers, DevOps |

### ⚙️ **Setup Guides** (`/setup-guides/`)

Configuration and deployment documentation.

| File                                                                    | Description                                            | Audience                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------- |
| **[01-deployment-guide.md](setup-guides/01-deployment-guide.md)**       | Complete deployment guide for Vercel, Supabase, Stripe | DevOps, Deployment teams   |
| **[02-email-configuration.md](setup-guides/02-email-configuration.md)** | Email system setup with Resend integration             | DevOps, Backend developers |
| **[03-stripe-webhooks.md](setup-guides/03-stripe-webhooks.md)**         | Stripe webhook configuration and testing               | DevOps, Backend developers |

### 🔧 **Implementation Guides** (`/implementation-guides/`)

Technical implementation details and advanced features.

| File                                                                                     | Description                             | Audience              |
| ---------------------------------------------------------------------------------------- | --------------------------------------- | --------------------- |
| **[01-payment-system-basics.md](implementation-guides/01-payment-system-basics.md)**     | Core payment system implementation      | Backend developers    |
| **[02-payment-system-advanced.md](implementation-guides/02-payment-system-advanced.md)** | Advanced payment features and webhooks  | Senior developers     |
| **[03-booking-flow.md](implementation-guides/03-booking-flow.md)**                       | Complete booking process implementation | Full-stack developers |

### 🗄️ **Database Migrations** (`/database-migrations/`)

SQL migration files for database setup and updates.

| File                                                                                     | Description                                           | When to Use                |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------- |
| **[initial-setup.sql](database-migrations/initial-setup.sql)**                           | Required database migration for guest booking columns | Initial setup              |
| **[fix-schema.sql](database-migrations/fix-schema.sql)**                                 | Schema fixes and updates                              | After initial setup        |
| **[fix-schema-add-guest-phone.sql](database-migrations/fix-schema-add-guest-phone.sql)** | Guest phone column addition                           | When guest phone is needed |

---

## 🎯 **Getting Started Paths**

### **👨‍💻 New Developer**

```
1. Read Project Overview → Understand the system
2. Follow Deployment Guide → Get local environment running
3. Study Authentication System → Learn security implementation
4. Review Payment System Basics → Understand core features
```

### **🚀 Deployment Team**

```
1. Read Deployment Guide → Complete production setup
2. Configure Email System → Set up Resend integration
3. Configure Stripe Webhooks → Enable payment processing
4. Apply Database Migrations → Set up database schema
```

### **🔧 Implementation Team**

```
1. Study Payment System Basics → Core payment features
2. Implement Advanced Features → Webhooks and security
3. Build Booking Flow → Complete user journey
4. Test Integration → End-to-end testing
```

---

## 🛠️ **Technology Stack**

| Component          | Technology              | Purpose                             |
| ------------------ | ----------------------- | ----------------------------------- |
| **Frontend**       | Next.js 15 + React 18   | Full-stack web application          |
| **Backend**        | Next.js API Routes      | Server-side logic                   |
| **Database**       | Supabase (PostgreSQL)   | Data storage and real-time features |
| **Authentication** | Supabase Auth           | User management and security        |
| **Payments**       | Stripe                  | Payment processing                  |
| **Email**          | Resend                  | Transactional emails                |
| **Deployment**     | Vercel                  | Hosting and CDN                     |
| **Styling**        | Tailwind CSS + Radix UI | Modern, accessible UI               |

---

## 📋 **Development Workflow**

### **Local Development**

```bash
# 1. Clone and install
git clone <repository-url>
cd zero-fee-stays
npm install

# 2. Environment setup
cp env.template .env.local
# Edit .env.local with your credentials

# 3. Database setup
# Apply migrations from /database-migrations/ in Supabase SQL Editor

# 4. Start development
npm run dev
```

### **Production Deployment**

```bash
# 1. Build and test
npm run build
npm run start

# 2. Deploy to Vercel
vercel --prod

# 3. Configure services
# - Set up Resend email domain
# - Configure Stripe webhooks
# - Update Supabase redirect URLs
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

| Issue             | Solution                    | Documentation                                                      |
| ----------------- | --------------------------- | ------------------------------------------------------------------ |
| Build errors      | Check environment variables | [Deployment Guide](setup-guides/01-deployment-guide.md)            |
| Database errors   | Apply missing migrations    | [Database Migrations](database-migrations/)                        |
| Payment failures  | Verify Stripe configuration | [Stripe Webhooks](setup-guides/03-stripe-webhooks.md)              |
| Email not sending | Check Resend configuration  | [Email Configuration](setup-guides/02-email-configuration.md)      |
| Auth issues       | Review auth system guide    | [Authentication System](system-guides/02-authentication-system.md) |

### **Getting Help**

1. Check the relevant documentation section
2. Review troubleshooting guides in each document
3. Check environment variables
4. Verify service configurations (Supabase, Stripe, Resend)

---

## 📊 **Project Status**

| Component          | Status                    | Documentation                                                      |
| ------------------ | ------------------------- | ------------------------------------------------------------------ |
| **Core System**    | ✅ Production Ready       | [Project Overview](system-guides/01-project-overview.md)           |
| **Authentication** | ✅ Fully Implemented      | [Authentication System](system-guides/02-authentication-system.md) |
| **Payment System** | ✅ Complete with Webhooks | [Payment Guides](implementation-guides/)                           |
| **Email System**   | ✅ Fully Configured       | [Email Configuration](setup-guides/02-email-configuration.md)      |
| **Deployment**     | ✅ Production Ready       | [Deployment Guide](setup-guides/01-deployment-guide.md)            |

---

## 🤝 **Contributing**

When adding new documentation:

1. **Choose the right category:**
   - System architecture → `system-guides/`
   - Setup and configuration → `setup-guides/`
   - Implementation details → `implementation-guides/`
   - Database changes → `database-migrations/`

2. **Use consistent naming:**
   - Format: `##-descriptive-name.md`
   - Use lowercase with hyphens
   - Include numbers for ordering

3. **Update this README:**
   - Add new files to the appropriate table
   - Update quick start paths if needed
   - Maintain the structure

---

## 📞 **Support & Resources**

### **External Documentation**

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### **Project Resources**

- **[env.template](../env.template)** - Environment variables template
- **[CLAUDE.md](../CLAUDE.md)** - AI assistant instructions
- **[README.md](../README.md)** - Project overview

---

**Last Updated:** January 2025  
**Documentation Status:** ✅ Clean, Organized, and Production-Ready  
**Maintained By:** HiddyStays Development Team
