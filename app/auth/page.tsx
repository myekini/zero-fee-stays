"use client";

import { Home, Heart } from "lucide-react";
import { ModernAuthForm } from "@/components/auth/ModernAuthForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Side - Brand + Marketing */}
        <aside className="flex flex-col h-screen overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {/* Header with Logo and Theme Toggle */}
          <div className="flex items-center justify-between mb-6 lg:mb-10 flex-shrink-0">
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
                <div className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">HiddyStays</div>
                <div className="text-xs text-muted-foreground font-medium -mt-0.5">Zero-Fee Stays</div>
              </div>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Marketing copy */}
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-foreground mb-4">
              Unlock the door to exceptional stays
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              We simplify every step of booking with modern tools, expert support, and zero platform fees.
            </p>

            <div className="flex items-center gap-3">
              <Link href="/properties" className="btn-primary-modern px-6 py-3 rounded-xl text-base">Find a Home</Link>
              <Link href="/contact" className="px-6 py-3 rounded-xl text-base border border-border text-foreground hover:border-primary hover:text-primary transition-colors">Book a Call</Link>
            </div>

            {/* Simple Stats */}
            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-xl">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl sm:text-2xl font-bold text-foreground">32k+</div>
                <div className="text-xs text-muted-foreground mt-1">Listed Properties</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl sm:text-2xl font-bold text-foreground">10k+</div>
                <div className="text-xs text-muted-foreground mt-1">Happy Clients</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl sm:text-2xl font-bold text-foreground">110+</div>
                <div className="text-xs text-muted-foreground mt-1">Awards</div>
              </div>
            </div>

            {/* Mobile Auth card (shown on small screens) */}
            <div className="lg:hidden mt-10">
              <div className="card-premium-modern p-6">
                <ModernAuthForm mode="signin" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 lg:mt-auto text-center text-sm text-muted-foreground flex-shrink-0 py-4">
            © 2025 HiddyStays. All rights reserved.
          </footer>
        </aside>

        {/* Right Side - Image with Floating Auth Card */}
        <div className="relative hidden lg:block min-h-screen overflow-hidden bg-gradient-to-br from-brand-50 to-accentCustom-50 dark:from-background dark:to-card">
          <div className="absolute inset-0">
            <Image
              src={siteConfig.heroImages.auth.url}
              alt={siteConfig.heroImages.auth.alt}
              fill
              className="object-cover object-center"
              priority={siteConfig.heroImages.auth.priority}
              quality={78}
              sizes={siteConfig.heroImages.auth.sizes}
            />
            {/* Theme-aware overlay for contrast */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-background/70 via-background/25 to-transparent" />
            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,transparent_60%,rgba(0,0,0,0.35)_100%)]" />
          </div>

          {/* Floating auth card */}
          <div className="absolute top-12 left-12 w-[480px] max-w-[calc(100%-6rem)]">
            <div className="card-premium-modern p-6 bg-card/95 backdrop-blur-xl">
              <ModernAuthForm mode="signin" />
            </div>
          </div>

          {/* Testimonial chip */}
          <div className="absolute bottom-10 left-12 right-12">
            <div className="rounded-2xl border border-white/30 bg-black/30 backdrop-blur-md text-white p-5 max-w-xl shadow-2xl">
              <blockquote className="text-sm sm:text-base leading-relaxed">
                "Amazing service, worth the money. They helped me find the perfect property from the beginning."
              </blockquote>
              <div className="mt-3 flex items-center gap-3 text-xs sm:text-sm text-white/90">
                <div className="font-medium">★★★★★ 5.0</div>
                <div className="text-white/70">• Verified guests</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
