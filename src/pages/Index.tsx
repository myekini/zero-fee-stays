import { Suspense, useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyShowcase from "@/components/PropertyShowcase";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
    <div className="relative">
      {/* Modern loading spinner with multiple layers */}
      <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent border-t-hiddy-coral border-r-hiddy-teal"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full h-4 w-4 bg-hiddy-coral opacity-75"></div>
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
        <p className="text-slate-600 font-medium animate-pulse">
          Loading amazing experiences...
        </p>
      </div>
    </div>
  </div>
);

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Smooth scroll tracking for parallax effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Page load animation with improved timing
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`min-h-screen bg-background overflow-x-hidden transition-all duration-1000 ease-out ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Header */}
      <Header />

      <Suspense fallback={<LoadingFallback />}>
        {/* Main content with consistent layout and smooth transitions */}
        <main className="relative">
          {/* Hero Section */}
          <div className="relative z-10 transform transition-all duration-700 ease-out">
            <Hero />
          </div>

          {/* Property Showcase Section */}
          <div className="relative z-10 transform transition-all duration-700 ease-out">
            <PropertyShowcase />
          </div>

          {/* Features Section */}
          <div className="relative z-10 transform transition-all duration-700 ease-out">
            <Features />
          </div>

          {/* Testimonials Section */}
          <div className="relative z-10 transform transition-all duration-700 ease-out">
            <Testimonials />
          </div>
        </main>
      </Suspense>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
