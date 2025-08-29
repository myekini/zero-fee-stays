# HiddyStays Backend Startup Guide

## Quick Start

### 1. Activate Virtual Environment

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# Windows Command Prompt
.venv\Scripts\activate.bat

# Linux/Mac
source .venv/bin/activate
```

### 2. Start the Backend Server

```bash
python run.py
```

Or alternatively:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Verify Backend is Running

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development"
}
```

## API Endpoints

- **Health Check**: `GET /health`
- **API Documentation**: `GET /docs` (when DEBUG=true)
- **Properties**: `GET /api/properties`
- **Bookings**: `GET /api/bookings`
- **Payments**: `GET /api/payments`
- **Admin**: `GET /api/admin`

## Environment Configuration

Make sure your `.env` file is properly configured with:

- Supabase credentials
- Stripe API keys
- Resend email API key
- Other required environment variables

## Troubleshooting

### Common Issues:

1. **Port 8000 already in use**:

   ```bash
   # Find process using port 8000
   netstat -ano | findstr :8000
   # Kill the process
   taskkill /PID <process_id> /F
   ```

2. **Virtual environment not activated**:
   - Make sure you see `(.venv)` in your terminal prompt
   - Re-run the activation command

3. **Missing dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Environment variables not loaded**:
   - Check that `.env` file exists in backend directory
   - Verify all required variables are set

## Development

- **Auto-reload**: Server automatically restarts on code changes
- **Logs**: Check terminal output for detailed logs
- **Debug mode**: Set `DEBUG=true` in `.env` for detailed error messages
