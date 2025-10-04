"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  Home,
  DollarSign,
  Star,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SocialProof = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      icon: Users,
      number: "25,000+",
      label: "Happy Guests",
      description: "Travelers who saved money",
      color: "text-brand-600",
      bgColor: "bg-brand-50",
    },
    {
      icon: Home,
      number: "1,200+",
      label: "Verified Properties",
      description: "Quality accommodations",
      color: "text-accent-600",
      bgColor: "bg-accent-50",
    },
    {
      icon: DollarSign,
      number: "$2.3M",
      label: "Saved by Guests",
      description: "In booking fees avoided",
      color: "text-terracotta-600",
      bgColor: "bg-terracotta-50",
    },
    {
      icon: Star,
      number: "4.9/5",
      label: "Average Rating",
      description: "From verified bookings",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const trustIndicators = [
    {
      icon: Shield,
      text: "SSL Encrypted",
    },
    {
      icon: TrendingUp,
      text: "Trusted by 25K+ Users",
    },
    {
      icon: Star,
      text: "4.9/5 Rating",
    },
  ];

  return (
    <section
className="py-24 bg-background relative overflow-hidden"
      ref={sectionRef}
      id="social-proof"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-brand-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-l from-accent-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-2 text-sm font-medium border-brand-200 text-brand-700 bg-brand-50"
          >
            <Star className="w-4 h-4 mr-2" />
            Trusted by Thousands
          </Badge>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Join the
            <span className="block text-gradient-brand">
              Zero-Fee Revolution
            </span>
          </h2>

          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            See why thousands of travelers choose HiddyStays over traditional
            booking platforms.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <Card
              key={index}
className={`card-premium-modern p-6 text-center border-0 shadow-premium hover:shadow-glass transition-all duration-300 ${
                isVisible
                  ? "animate-fade-in-up opacity-100"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div
                className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}
              >
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
          {trustIndicators.map((indicator, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-muted-foreground"
            >
              <indicator.icon className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-medium">{indicator.text}</span>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-muted-foreground mb-4">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Ready to save money on your next trip?
            </span>
          </div>
          <p className="text-lg text-foreground font-medium">
            Start your search and join thousands of smart travelers
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default SocialProof;
