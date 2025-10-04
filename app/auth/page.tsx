"use client";

import { Home, Heart } from "lucide-react";
import { ModernAuthForm } from "@/components/auth/ModernAuthForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple centered layout */}
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 lg:p-8">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-200">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center shadow-sm">
                <Heart className="h-2 w-2 text-white fill-current" />
              </div>
            </div>
            <div>
              <div className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                HiddyStays
              </div>
              <div className="text-xs text-muted-foreground font-medium -mt-0.5">
                Zero-Fee Stays
              </div>
            </div>
          </Link>

          <ThemeToggle />
        </header>

        {/* Main Content - Centered */}
        <main className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="card-premium-modern p-8">
              <ModernAuthForm mode="signin" />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-6">
          © 2025 HiddyStays. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
