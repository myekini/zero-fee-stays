# Development Setup Script for HiddyStays (PowerShell)
# 
# This script helps set up the development environment
# Run with: .\scripts\setup-dev.ps1

Write-Host "🚀 Setting up HiddyStays development environment..." -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
$envPath = Join-Path $PWD ".env.local"
if (-not (Test-Path $envPath)) {
    Write-Host "📝 Creating .env.local from template..." -ForegroundColor Yellow
    $envTemplate = Join-Path $PWD "env.template"
    if (Test-Path $envTemplate) {
        Copy-Item $envTemplate $envPath
        Write-Host "✅ .env.local created! Please update with your actual values." -ForegroundColor Green
    } else {
        Write-Host "❌ env.template not found!" -ForegroundColor Red
    }
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
}

# Run type check
Write-Host ""
Write-Host "🔍 Running type check..." -ForegroundColor Yellow
try {
    npm run type-check
    Write-Host "✅ Type check passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Type check failed - please fix TypeScript errors" -ForegroundColor Yellow
}

# Run linting
Write-Host ""
Write-Host "🧹 Running linter..." -ForegroundColor Yellow
try {
    npm run lint
    Write-Host "✅ Linting passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Linting failed - please fix ESLint errors" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Development setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with your actual API keys" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000 to see your app" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green

