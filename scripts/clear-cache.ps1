# Clear Next.js cache and restart development server
Write-Host "🧹 Clearing Next.js cache..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path ".next") {
  Remove-Item -Recurse -Force ".next"
  Write-Host "✅ Removed .next directory" -ForegroundColor Green
}

# Remove node_modules/.cache if it exists
if (Test-Path "node_modules\.cache") {
  Remove-Item -Recurse -Force "node_modules\.cache"
  Write-Host "✅ Removed node_modules\.cache" -ForegroundColor Green
}

# Clear npm cache
npm cache clean --force
Write-Host "✅ Cleared npm cache" -ForegroundColor Green

Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
npm run dev








