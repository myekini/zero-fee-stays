"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  DollarSign,
  MessageCircle,
  Calendar,
  Star,
  Clock,
  Search,
  CreditCard,
  CheckCircle,
  Users,
  Home,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const features = [
    {
      icon: DollarSign,
      title: "Zero Fees",
      description: "Keep 100% of your money. No hidden charges.",
      color: "text-brand-600",
      bgColor: "bg-brand-50",
      borderColor: "border-brand-200",
    },
    {
      icon: MessageCircle,
      title: "Direct Contact",
      description: "Chat with hosts for personalized service.",
      color: "text-brand-500",
      bgColor: "bg-brand-50",
      borderColor: "border-brand-200",
    },
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "Safe payments and verified hosts.",
      color: "text-neutral-700",
      bgColor: "bg-neutral-50",
      borderColor: "border-neutral-200",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: Search,
      title: "Search",
      description: "Browse verified properties",
      color: "from-brand-500 to-brand-600",
    },
    {
      step: 2,
      icon: MessageCircle,
      title: "Connect",
      description: "Chat with hosts directly",
      color: "from-brand-500 to-brand-600",
    },
    {
      step: 3,
      icon: CreditCard,
      title: "Book",
      description: "Secure payment system",
      color: "from-green-500 to-green-600",
    },
    {
      step: 4,
      icon: CheckCircle,
      title: "Stay",
      description: "Enjoy authentic hospitality",
      color: "from-blue-500 to-blue-600",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px 0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-24 bg-gradient-to-br from-background via-background to-brand-50/30 dark:to-brand-950/30 relative overflow-hidden w-full"
      ref={sectionRef}
      id="features"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-brand-500/5 to-transparent rounded-full blur-3xl dark:from-brand-400/10"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-l from-brand-400/5 to-transparent rounded-full blur-3xl dark:from-brand-300/10"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced How It Works Section */}
        <div
          className={`text-center max-w-4xl mx-auto mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            How It
            <span className="block text-gradient-brand">Works</span>
          </h2>

          <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
            Book direct in{" "}
            <span className="font-bold text-foreground">4 steps</span>. No
            complexity, no hidden fees.
          </p>

          {/* Enhanced How It Works Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => (
              <div
                key={step.step}
                className={`relative group ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="relative z-10 text-center">
                  {/* Clean step indicator */}
                  <div
                    className={`relative mx-auto w-24 h-24 bg-gradient-to-br ${step.color} rounded-2xl mb-6 flex items-center justify-center shadow-lg transition-all duration-300`}
                  >
                    <step.icon
                      className="w-10 h-10 text-white"
                      strokeWidth={1.5}
                    />

                    {/* Step number */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-card rounded-full shadow-lg flex items-center justify-center border-2 border-border">
                      <span className="text-sm font-bold text-foreground">
                        {step.step}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div
          className={`text-center max-w-4xl mx-auto mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.8s" }}
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Why Choose
            <span className="block text-gradient-brand">HiddyStays</span>
          </h2>

          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Three reasons to book direct.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${1 + index * 0.1}s` }}
            >
              <Card className="card-premium-modern p-8 h-full hover:shadow-lg transition-all duration-300 border border-border/50 relative overflow-hidden">
                <div className="relative z-10">
                  {/* Clean icon container */}
                  <div className="mb-6">
                    <div
                      className={`p-4 rounded-2xl ${feature.bgColor} ${feature.color} transition-all duration-300 shadow-sm border ${feature.borderColor}`}
                    >
                      <feature.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-display text-xl font-bold text-neutral-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div
          className={`text-center max-w-4xl mx-auto mt-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "1.6s" }}
        >
          <Card className="card-premium-modern p-12 overflow-hidden">
            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                  Ready to Start Your
                  <span className="block text-gradient-brand">Adventure?</span>
                </h2>

                <p className="text-xl md:text-2xl text-neutral-600 leading-relaxed mb-12 max-w-4xl mx-auto">
                  Join thousands of travelers who book direct and save more.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/properties" className="group">
                  <Button variant="brandOnBlack" className="px-12 py-5 text-lg">
                    <span className="flex items-center">
                      Get Started Today
                      <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="px-12 py-5 text-lg hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700"
                >
                  Learn More
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-8 mt-12 text-neutral-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">Instant confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">No hidden fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">24/7 support</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Features;
