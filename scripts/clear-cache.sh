#!/bin/bash

# Clear Next.js cache and restart development server
echo "🧹 Clearing Next.js cache..."

# Remove .next directory
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ Removed .next directory"
fi

# Remove node_modules/.cache if it exists
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Removed node_modules/.cache"
fi

# Clear npm cache
npm cache clean --force
echo "✅ Cleared npm cache"

echo "🚀 Starting development server..."
npm run dev









