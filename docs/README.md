# HiddyStays - Property Rental Platform

A full-stack property rental platform with React frontend and Python FastAPI backend. Built by hosts, for hosts - helping Canadian property owners keep more of their earnings.

## Project Structure

- **Frontend**: React + TypeScript + Tailwind CSS (in root directory)
- **Backend**: Python FastAPI (payment API)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe integration

## Frontend Setup

**Use Lovable**

Simply visit the [HiddyStays Lovable Project](https://lovable.dev/projects/ab8c08d2-9740-47ff-99e7-1d6a8b440830) and start prompting.

**Local Development**

```sh
# Install dependencies
npm i

# Start development server
npm run dev
```

## Python Backend Setup

The payment processing is handled by a separate Python FastAPI backend.

```bash
# Install Python dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Update .env with your actual values
# - Stripe secret key from https://dashboard.stripe.com/apikeys
# - Supabase service role key from Supabase dashboard

# Run the development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Backend API Endpoints

- `POST /api/payments/create-session` - Create Stripe payment session
- `POST /api/payments/verify-payment` - Verify payment status
- `GET /health` - Health check

## Environment Variables

Create a `.env` file in the backend directory with:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
SUPABASE_URL=https://ihgzllefbkzqnomsviwh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- HiddyStays Brand Design System (Coral #FF6B6B, Teal #4ECDC4, Sunset #FFE66D)

## How can I deploy this project?

Simply open [HiddyStays on Lovable](https://lovable.dev/projects/ab8c08d2-9740-47ff-99e7-1d6a8b440830) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
