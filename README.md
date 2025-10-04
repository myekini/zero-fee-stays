# 🏠 HiddyStays - Zero Fee Property Rental Platform

A modern, full-stack property rental platform built with **Next.js 15**, designed by hosts, for hosts. Helping Canadian property owners keep 100% of their earnings with zero platform fees.

## 🚀 **Why Next.js?**

✅ **Single Codebase** - Frontend + Backend in one project  
✅ **Better Performance** - Server-side rendering + API routes  
✅ **Lower Costs** - Single deployment instead of separate services  
✅ **Zero Platform Fees** - Optimized infrastructure costs  
✅ **Modern Stack** - React 18 + TypeScript + Tailwind CSS  

## 📁 **Project Structure**

```
hiddystays/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes (Backend)
│   │   ├── 📁 payments/            # Stripe payment processing
│   │   ├── 📁 bookings/            # Booking management
│   │   ├── 📁 properties/           # Property management
│   │   └── 📁 admin/               # Admin functions
│   ├── 📁 (auth)/                  # Authentication pages
│   ├── 📁 booking/                 # Booking flow pages
│   ├── 📁 host-dashboard/          # Host management
│   ├── 📁 properties/              # Property pages
│   ├── 📄 layout.tsx               # Root layout
│   ├── 📄 page.tsx                 # Home page
│   └── 📄 globals.css              # Global styles
├── 📁 components/                   # React components
│   ├── 📁 ui/                      # Reusable UI components
│   ├── 📁 auth/                    # Authentication components
│   ├── 📁 booking/                 # Booking components
│   └── 📁 property/                # Property components
├── 📁 lib/                         # Utilities and configuration
├── 📁 hooks/                       # Custom React hooks
├── 📁 services/                    # API service layer
├── 📁 public/                      # Static assets
├── 📄 package.json                 # Dependencies
├── 📄 next.config.js              # Next.js configuration
├── 📄 tailwind.config.ts          # Tailwind CSS
└── 📄 tsconfig.json               # TypeScript configuration
```

## 🛠️ **Tech Stack**

### **Frontend**
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **TanStack Query** for data fetching
- **Stripe Elements** for payments

### **Backend (API Routes)**
- **Next.js API Routes** (replaces Express)
- **Stripe** for payment processing
- **Supabase** for database and auth
- **Resend** for email services
- **TypeScript** for type safety

### **Infrastructure**
- **Vercel** (recommended deployment)
- **Supabase** for database and auth
- **Stripe** for payments
- **Resend** for emails

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Environment Setup**
Copy the environment template:
```bash
cp env.template .env.local
```

Fill in your credentials in `.env.local`:
```env
# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Supabase (get from https://supabase.com/dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Email (get from https://resend.com/api-keys)
RESEND_API_KEY=your_resend_api_key_here
```

### **3. Start Development Server**
```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

## 📚 **API Endpoints**

### **Payments**
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/create-session` - Create checkout session
- `POST /api/payments/verify-payment` - Verify payment status

### **Bookings**
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Cancel booking

### **Properties**
- `GET /api/properties` - List properties with filters
- `POST /api/properties` - Create property
- `GET /api/properties/[id]` - Get property details

### **Admin**
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/bookings` - Manage bookings

## 🎨 **Features**

### **For Guests**
- 🔍 **Property Search** with filters
- 📅 **Real-time Availability** checking
- 💳 **Secure Payments** via Stripe
- 📱 **Mobile-optimized** interface
- 📧 **Email Confirmations** for bookings

### **For Hosts**
- 🏠 **Property Management** dashboard
- 📊 **Analytics** and insights
- 💰 **Zero Platform Fees** - keep 100%
- 📧 **Automated Notifications**
- 📱 **Mobile-friendly** management

### **For Admins**
- 👥 **User Management**
- 🏠 **Property Moderation**
- 📊 **Platform Analytics**
- 💳 **Payment Monitoring**

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

### **Other Platforms**
- **Railway**: Connect GitHub repo
- **Netlify**: Build command `npm run build`
- **AWS Amplify**: Next.js preset
- **DigitalOcean App Platform**: Next.js template

## 🔧 **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### **Environment Variables**
All environment variables are documented in `env.template`. Key variables:

- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `RESEND_API_KEY` - Resend API key for emails

## 🎯 **Migration from Vite + Express**

This project was successfully migrated from:
- ❌ **Vite + Express** (two separate projects)
- ✅ **Next.js** (single full-stack project)

### **Benefits of Migration:**
- 🚀 **Better Performance** - Server-side rendering
- 💰 **Lower Costs** - Single deployment
- 🔧 **Easier Maintenance** - One codebase
- 🎯 **Better SEO** - Server-side rendering
- 📱 **Mobile Optimized** - Built-in optimizations

## 🆘 **Support**

### **Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### **Getting Help**
- Check the API documentation at `/api/docs` (development only)
- Review error logs in the console
- Check environment variable configuration
- Verify all service credentials are correct

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with ❤️ for Canadian property owners
- Zero platform fees philosophy
- Modern web technologies for the best user experience
- Next.js for optimal performance and developer experience

---

**Ready to launch your zero-fee property rental platform! 🚀**