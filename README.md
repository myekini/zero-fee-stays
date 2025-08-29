# HiddyStays - Zero Fee Property Rental Platform

A modern, full-stack property rental platform built by hosts, for hosts. Helping Canadian property owners keep more of their earnings with zero platform fees.

## 🚀 Features

- **Zero Platform Fees**: Keep 100% of your earnings
- **Modern UI/UX**: Beautiful, responsive design with mobile-first approach
- **Real-time Bookings**: Instant booking confirmation and management
- **Secure Payments**: Stripe-powered payment processing
- **Property Management**: Easy listing creation and management
- **Analytics Dashboard**: Comprehensive insights for hosts
- **PWA Support**: Install as a native app on mobile devices
- **Email Notifications**: Automated booking confirmations and updates

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Stripe Elements** for payments

### Backend
- **FastAPI** with Python
- **Supabase** for database and authentication
- **Stripe** for payment processing
- **Resend** for email services
- **Uvicorn** for ASGI server

### Infrastructure
- **Supabase** for database, auth, and real-time features
- **Stripe** for payment processing
- **Resend** for transactional emails

## 📁 Project Structure

```
zero-fee-stays/
├── 📁 src/                    # React frontend
│   ├── 📁 components/         # Reusable UI components
│   ├── 📁 pages/             # Page components
│   ├── 📁 services/          # API service layer
│   ├── 📁 hooks/             # Custom React hooks
│   ├── 📁 contexts/          # React contexts
│   └── 📁 lib/               # Utility functions
├── 📁 backend/               # FastAPI backend
│   ├── 📁 app/               # Application code
│   │   ├── 📁 api/           # API endpoints
│   │   ├── 📁 core/          # Core configuration
│   │   ├── 📁 services/      # Business logic
│   │   └── 📁 schemas/       # Data models
│   ├── 📁 tests/             # Backend tests
│   └── requirements.txt      # Python dependencies
├── 📁 supabase/              # Supabase functions
│   └── 📁 functions/         # Edge functions
├── 📁 docs/                  # Documentation
├── 📁 public/                # Static assets
└── package.json              # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Supabase account
- Stripe account
- Resend account

### 1. Clone and Setup

```bash
git clone <repository-url>
cd zero-fee-stays
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:8080

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp env.example .env

# Edit .env with your credentials
# (See Environment Configuration section)

# Start backend server
python run.py
```

Backend will be available at: http://localhost:8000

### 4. Environment Configuration

Create `.env` files in both root and backend directories:

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Backend (.env)
```env
# Application Configuration
APP_NAME=HiddyStays API
APP_VERSION=1.0.0
DEBUG=true
ENVIRONMENT=development

# Server Configuration
HOST=0.0.0.0
PORT=8000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@hiddystays.com
FROM_NAME=HiddyStays
SUPPORT_EMAIL=support@hiddystays.com
APP_URL=http://localhost:8080

# Security Configuration
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Logging Configuration
LOG_LEVEL=INFO
```

## 📚 API Documentation

Once the backend is running, access the API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🔧 Development

### Frontend Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Backend Commands

```bash
python run.py                    # Start development server
uvicorn app.main:app --reload    # Alternative start command
pytest tests/                    # Run tests
black app/                       # Format code
isort app/                       # Sort imports
flake8 app/                      # Lint code
```

## 🧪 Testing

### Frontend Testing
```bash
npm test
```

### Backend Testing
```bash
cd backend
pytest tests/
pytest --cov=app tests/  # With coverage
```

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend Deployment
The backend can be deployed to:
- Railway
- Heroku
- DigitalOcean App Platform
- AWS ECS
- Google Cloud Run

### Environment Variables
Make sure to set all required environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the [documentation](docs/)

## 🙏 Acknowledgments

- Built with ❤️ for Canadian property owners
- Zero platform fees philosophy
- Modern web technologies for the best user experience
