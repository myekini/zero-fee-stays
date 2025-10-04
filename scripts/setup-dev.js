#!/usr/bin/env node

/**
 * Development Setup Script for HiddyStays
 *
 * This script helps set up the development environment
 * Run with: node scripts/setup-dev.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Setting up HiddyStays development environment...\n");

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.log("📝 Creating .env.local from template...");
  const envTemplate = path.join(process.cwd(), "env.template");
  if (fs.existsSync(envTemplate)) {
    fs.copyFileSync(envTemplate, envPath);
    console.log(
      "✅ .env.local created! Please update with your actual values."
    );
  } else {
    console.log("❌ env.template not found!");
  }
} else {
  console.log("✅ .env.local already exists");
}

// Install dependencies
console.log("\n📦 Installing dependencies...");
try {
  execSync("npm install", { stdio: "inherit" });
  console.log("✅ Dependencies installed successfully");
} catch (error) {
  console.log("❌ Failed to install dependencies:", error.message);
}

// Run type check
console.log("\n🔍 Running type check...");
try {
  execSync("npm run type-check", { stdio: "inherit" });
  console.log("✅ Type check passed");
} catch (error) {
  console.log("⚠️  Type check failed - please fix TypeScript errors");
}

// Run linting
console.log("\n🧹 Running linter...");
try {
  execSync("npm run lint", { stdio: "inherit" });
  console.log("✅ Linting passed");
} catch (error) {
  console.log("⚠️  Linting failed - please fix ESLint errors");
}

console.log("\n🎉 Development setup complete!");
console.log("\nNext steps:");
console.log("1. Update .env.local with your actual API keys");
console.log('2. Run "npm run dev" to start the development server');
console.log("3. Visit http://localhost:3000 to see your app");
console.log("\nHappy coding! 🚀");


