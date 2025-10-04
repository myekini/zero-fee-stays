# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HiddyStays** is a zero-fee property rental platform built with Next.js 15, designed to help Canadian property owners keep 100% of their earnings. The platform uses a modern full-stack architecture with Next.js App Router, combining frontend and backend in a single codebase.

## Tech Stack

- **Framework**: Next.js 15 with App Router (migrated from Vite + Express)
- **Language**: TypeScript with strict mode enabled
- **Database & Auth**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Payments**: Stripe (payment intents and checkout sessions)
- **Email**: Resend API via Supabase Edge Functions + React Email templates
- **UI**: Tailwind CSS + Radix UI + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Maps**: Leaflet (for property location display)

## Development Commands

```bash
# Development
npm run dev                    # Start dev server at localhost:3000

# Build & Production
npm run build                  # Build for production
npm run start                  # Start production server
npm run clean                  # Remove build artifacts

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix               # Fix linting issues
npm run type-check             # Run TypeScript checker
npm run type-check:watch       # Watch mode for TypeScript
npm run format                 # Format with Prettier
npm run format:check           # Check formatting

# Testing
npm test                       # Run Jest tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report

# Setup & Seeding
npm run setup:dev              # Initialize development environment
npm run setup:mock             # Create mock data
npm run setup:host             # Setup default host properties
npm run seed:dummy             # Seed dummy data
```

## Architecture & Key Patterns

### App Router Structure

The project uses Next.js 15 App Router with the following organization:

```
app/
├── api/                       # Backend API routes (replaces Express)
│   ├── payments/             # Stripe payment processing
│   ├── bookings/             # Booking management
│   ├── properties/           # Property CRUD operations
│   ├── admin/                # Admin-only operations
│   └── email/                # Email sending endpoints
├── (auth)/                   # Auth route group (login, signup, etc.)
├── booking/                  # Booking flow pages
├── host-dashboard/           # Host management interface
├── properties/               # Property browsing & details
└── layout.tsx                # Root layout with providers
```

### Supabase Integration

**Two client patterns are used:**

1. **Client-side** (`lib/supabase.ts`):
   - Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Browser-safe, RLS-protected
   - Auto-refresh tokens and session persistence

2. **Server-side** (`createServerSupabaseClient()`):
   - Uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
   - Only use in API routes and server components
   - Never expose service role key to client

**Important**: The middleware (`middleware.ts`) handles auth state using Supabase SSR, managing session cookies and protecting routes. Public paths: `/`, `/properties`, `/property/*`, `/auth/*`, `/api/*`.

### Payment Flow Architecture

**Multi-step payment process:**

1. **Create Booking** → `POST /api/bookings/create`
   - Creates booking in `pending` state
   - Returns `bookingId`

2. **Create Payment Session** → `POST /api/payments/create-session`
   - Creates Stripe checkout session
   - Links to booking via metadata
   - Returns checkout URL

3. **Payment Processing** → Stripe hosted checkout
   - Redirect to Stripe
   - Handle success/cancel redirects

4. **Verify Payment** → `POST /api/payments/verify-payment`
   - Confirms payment status
   - Updates booking to `confirmed`
   - Triggers email notifications

**Alternative**: Payment intents flow via `/api/payments/create-payment-intent` for embedded checkout.

### Booking & Notification Flow

**When a booking is created** (`POST /api/bookings/create`):

1. Validates booking request (dates, guests, property availability)
2. Checks property exists and is active
3. Verifies no conflicting bookings exist
4. Creates booking record with status `pending`
5. Creates notification for host in `notifications` table
6. Returns booking details with `bookingId`

**Notification System:**

- Realtime notifications via `notifications` table with Supabase realtime enabled
- Notification types: `booking_new`, `booking_confirmed`, `booking_cancelled`, `booking_reminder`, `message_received`, `review_received`, `payment_received`
- Users can only view/update/delete their own notifications (RLS enforced)
- Notifications include `title`, `message`, and optional `data` JSON field

### Email System

**Supabase Edge Function with Resend:**

- Primary email service: `supabase/functions/send-email-notification/`
- Uses Resend API (requires `RESEND_API_KEY` in Supabase function secrets)
- Email templates defined in `supabase/functions/send-email-notification/email-templates.ts`
- React Email templates also available in `lib/email-templates/` for client-side rendering
- Invoked via `supabase.functions.invoke('send-email-notification', { body: {...} })`

**Email Analytics & Tracking:**

- `email_analytics` table tracks email events (sent, delivered, opened, clicked)
- `newsletter_subscriptions` table manages newsletter subscribers
- `email_templates` table stores template configurations (future use)

### Database Schema

Key tables (see `supabase/migrations/`):

- **profiles**: Extended user data (role: guest/host/admin)
- **properties**: Listings with full details, amenities, images
- **bookings**: Reservations with status tracking (pending/confirmed/cancelled)
- **payments**: Payment records linked to bookings
- **notifications**: In-app notification system with realtime enabled
- **email_analytics**: Email event tracking (sent, delivered, opened, clicked)
- **newsletter_subscriptions**: Newsletter subscriber management
- **email_templates**: Email template configurations
- **email_campaigns**: Campaign management (future use)

**RLS Policies**: All tables use Row Level Security. Users can only access their own bookings/properties unless admin. Service role bypasses RLS for API operations.

### Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:

- `@/*` → Root directory
- `@/components/*` → Components directory
- `@/lib/*` → Library utilities
- `@/app/*` → App directory
- `@/hooks/*` → Custom React hooks
- `@/services/*` → Service layer
- `@/types/*` → TypeScript types
- `@/assets/*` → Assets directory
- `@/public/*` → Public directory

### Environment Variables

**Required variables** (see `env.template`):

- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client)
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server)
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY` + `FROM_EMAIL` + `FROM_NAME` + `SUPPORT_EMAIL`
- `NEXTAUTH_SECRET` + `NEXTAUTH_URL`
- `NEXT_PUBLIC_OPENCAGE_API_KEY` (optional, for geocoding)

**Admin & Host credentials**:
- `DEFAULT_ADMIN_EMAIL` + `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_HOST_EMAIL` + `DEFAULT_HOST_PASSWORD`

**App Configuration**:
- `NEXT_PUBLIC_APP_NAME` + `NEXT_PUBLIC_APP_VERSION`
- `APP_URL` (for email links)
- `DEBUG` + `LOG_LEVEL` (development)

## Key Implementation Details

### API Route Pattern

All API routes return JSON with consistent structure:

```typescript
// Success
{ success: true, data: {...}, message?: "..." }

// Error
{ error: "Error message", details?: {...} }
```

Use `NextRequest` and `NextResponse` from `next/server`.

### Authentication Flow

1. Supabase Auth handles signup/login
2. Middleware checks session on protected routes
3. Client uses `supabase.auth.getSession()` for user state
4. Protected pages check auth in server components or use `AuthProvider`

### Component Organization

- `components/ui/` - shadcn/ui base components (Button, Dialog, etc.)
- `components/auth/` - Authentication forms and flows
- `components/booking/` - Booking modal, calendar, payment
- `components/property/` - Property cards, details, filters
- `components/` (root) - Shared layout components (Header, Footer, etc.)

### Service Layer

Services in `services/` handle business logic:
- `paymentService.ts` - Payment flow orchestration
- `bookingService.ts` - Booking operations (if exists)
- `emailNotificationService.ts` - Email triggers (if exists)

Keep API routes thin - delegate logic to services.

### Supabase Edge Functions

Located in `supabase/functions/`:
- **send-email-notification**: Handles all email sending via Resend API
- Deploy with `supabase functions deploy <name>`
- Use Deno runtime (not Node.js)
- Access via `https://<project>.supabase.co/functions/v1/<name>`

**Testing locally**: `supabase functions serve`

**Setting secrets**: `supabase secrets set RESEND_API_KEY=<key>`

## Common Patterns

### Creating a New API Route

1. Create `app/api/[endpoint]/route.ts`
2. Export `GET`, `POST`, `PUT`, `DELETE` functions as async
3. Import Supabase client from `@supabase/supabase-js`:
   ```typescript
   import { createClient } from "@supabase/supabase-js";

   const supabase = createClient(
     process.env.SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );
   ```
4. Handle errors with try-catch and return proper JSON responses
5. Use NextRequest and NextResponse from `next/server`
6. Add TypeScript types for request/response
7. Always validate input data before database operations

### Adding a New Page

1. Create `app/[route]/page.tsx`
2. Use server components by default (async component for data fetching)
3. Use client components (`'use client'`) only when needed (interactivity, hooks)
4. Protect routes via middleware or check auth in component

### Database Migrations

1. Create migration: `supabase migration new <name>`
2. Write SQL in `supabase/migrations/<timestamp>_<name>.sql`
3. Apply: `supabase db push` (or auto-applied on deploy)
4. Always include RLS policies for new tables

### Working with Stripe

- Test mode keys for development (prefix `sk_test_`, `pk_test_`)
- Use webhooks for production (not polling)
- Store payment status in both Stripe and Supabase
- Handle 3D Secure and async payment flows

## Migration Context

This project was migrated from **Vite (frontend) + Express (backend)** to **Next.js 15** in early 2025. Benefits:

- Single deployment instead of two separate services
- Better performance with SSR and automatic code splitting
- Lower infrastructure costs
- Simplified development workflow

**Legacy artifacts removed**: Old Vite config, Express backend, separate frontend/backend directories. All functionality consolidated into Next.js App Router.

**Note**: The README mentions Next.js 14, but package.json shows Next.js 15.5.3 is actually installed.

## Important Conventions

1. **Never commit `.env.local`** - use `env.template` for reference
2. **Always use path aliases** - prefer `@/components` over `../../../components`
3. **TypeScript strict mode** - no implicit any, handle null/undefined
4. **Mobile-first** - All UI should be responsive (Tailwind breakpoints)
5. **Server vs Client components** - Use server by default, client only when needed
6. **RLS first** - Never bypass Row Level Security unless absolutely necessary
7. **Error handling** - Always wrap API calls in try-catch and provide user feedback

## Testing Strategy

- Unit tests with Jest for utilities and services
- Test API routes with mock Supabase clients
- Manual testing for Stripe integration (use test cards)
- Check email templates with React Email preview (`npm run email:dev` if configured)

## Deployment

**Recommended platform**: Vercel (optimized for Next.js)

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main
4. Set up Stripe webhooks pointing to production URL
5. Configure Supabase redirects to production domain

**Other options**: Railway, Netlify, AWS Amplify, DigitalOcean App Platform (all support Next.js).

## Troubleshooting

### Common Issues

- **"Missing Supabase environment variables"**: Check `.env.local` exists and has all required variables
- **Stripe payment fails**: Verify webhook secret matches Stripe dashboard
- **Email not sending**: Check Resend API key and domain verification
- **Build errors**: Run `npm run type-check` to find TypeScript issues
- **Auth redirect loops**: Check middleware config and auth callback URL

### Useful Debugging

- Check browser console for client errors
- Check terminal for API route logs
- Use Supabase Dashboard → Logs for database queries
- Use Stripe Dashboard → Events for payment debugging
- Check Resend Dashboard → Logs for email delivery
