# HiddyStays Project Structure

## 📁 Clean Project Organization

```
zero-fee-stays/
├── 📁 backend/                    # 🐍 Python FastAPI Backend
│   ├── 📁 app/
│   │   ├── 📁 api/v1/            # API endpoints
│   │   ├── 📁 core/              # Core functionality
│   │   ├── 📁 schemas/           # Pydantic models
│   │   ├── 📁 services/          # Business logic
│   │   └── main.py               # FastAPI application
│   ├── 📁 tests/                 # Backend tests
│   ├── requirements.txt          # Python dependencies
│   ├── run.py                    # Startup script
│   ├── env.example               # Environment template
│   └── README.md                 # Backend documentation
│
├── 📁 src/                       # ⚛️ React Frontend
│   ├── 📁 components/            # React components
│   ├── 📁 pages/                 # Page components
│   ├── 📁 hooks/                 # Custom hooks
│   ├── 📁 services/              # Frontend services
│   ├── 📁 lib/                   # Utilities
│   ├── 📁 contexts/              # React contexts
│   └── main.tsx                  # App entry point
│
├── 📁 public/                    # 🌐 Static assets
├── 📁 docs/                      # 📚 Documentation
├── 📁 supabase/                  # 🗄️ Database & Functions
├── 📁 dist/                      # 🏗️ Build output
├── 📁 node_modules/              # 📦 Frontend dependencies
├── 📁 .venv/                     # 🐍 Python environment
│
├── .env                          # 🔐 Environment variables
├── .gitignore                    # 🚫 Git ignore rules
├── package.json                  # 📦 Frontend dependencies
├── package-lock.json             # 🔒 Lock file
├── vite.config.ts                # ⚡ Vite configuration
├── tailwind.config.ts            # 🎨 Tailwind CSS config
├── tsconfig.json                 # 📝 TypeScript config
├── eslint.config.js              # 🔍 Linting config
├── postcss.config.js             # 🎨 PostCSS config
├── components.json               # 🧩 shadcn/ui config
└── index.html                    # 🏠 Main HTML file
```

## 🎯 **What Was Cleaned Up:**

### ✅ **Removed Files:**

- `old_backend/` - Old backend structure (replaced with organized backend)
- `env.example` - Duplicate environment template (backend has its own)
- `bun.lockb` - Unused Bun lock file (using npm)

### 🔒 **Kept Essential Files:**

#### **Frontend (React + TypeScript + Vite):**

- `src/` - Main frontend source code
- `public/` - Static assets
- `package.json` & `package-lock.json` - Dependencies
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - Styling configuration
- `tsconfig*.json` - TypeScript configurations
- `eslint.config.js` - Code quality
- `postcss.config.js` - CSS processing
- `components.json` - UI component library
- `index.html` - Entry point

#### **Backend (FastAPI + Python):**

- `backend/` - Complete organized backend
- `.venv/` - Python virtual environment

#### **Database & Infrastructure:**

- `supabase/` - Database configuration and functions

#### **Documentation:**

- `docs/` - All project documentation

#### **Build & Environment:**

- `dist/` - Build output
- `node_modules/` - Frontend dependencies
- `.env` - Environment variables
- `.gitignore` - Git configuration

## 🚀 **Benefits of This Structure:**

1. **Clear Separation**: Frontend and backend are clearly separated
2. **Scalable**: Easy to add new features and modules
3. **Maintainable**: Well-organized and documented
4. **Professional**: Follows industry best practices
5. **Clean**: No unnecessary files cluttering the project

## 📋 **Next Steps:**

1. **Frontend Development**: Work in the `src/` directory
2. **Backend Development**: Work in the `backend/` directory
3. **Database**: Configure in the `supabase/` directory
4. **Documentation**: Update files in the `docs/` directory

The project is now clean, organized, and ready for development! 🎉
