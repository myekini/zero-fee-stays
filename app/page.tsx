"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { InspiredHero } from "@/components/InspiredHero";

// Lazy load components for better performance
const Features = dynamic(() => import("@/components/Features"), {
  ssr: false,
  loading: () => (
    <div className="py-20 bg-gradient-to-br from-neutral-50 via-white to-brand-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded-lg w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded-lg w-96 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-neutral-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
});

const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
  loading: () => (
    <div className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-700 rounded-lg w-48 mb-4"></div>
          <div className="h-4 bg-neutral-700 rounded-lg w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-neutral-700 rounded w-24"></div>
                <div className="h-3 bg-neutral-700 rounded w-32"></div>
                <div className="h-3 bg-neutral-700 rounded w-28"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function HomePage() {
  // No auth check here - middleware handles authentication
  // This eliminates double redirects and makes the page load much faster
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <InspiredHero />
      <Features />
      <Footer />
    </main>
  );
}
