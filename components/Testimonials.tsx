"use client";

import { Star, Quote, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  content: string;
  location: string;
}

const Testimonials = () => {
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

  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Frequent Guest",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      content:
        "HiddyStays has completely transformed my travel experience. The zero platform fees mean I save money, and the direct communication has made every stay more personal and enjoyable.",
      location: "Vancouver, BC",
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Business Traveler",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      content:
        "I love the direct connection. It feels more personal and authentic than other platforms. Plus, I know I'm getting the best price without hidden fees.",
      location: "Toronto, ON",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      role: "Family Traveler",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      content:
        "Perfect for family vacations. The properties are well-maintained, and the direct messaging feature helps me coordinate everything before arrival.",
      location: "Banff, AB",
    },
    {
      id: "4",
      name: "David Thompson",
      role: "Adventure Seeker",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      content:
        "Great for adventure trips. The properties are unique and the direct communication ensures I get insider tips about the local area.",
      location: "Montreal, QC",
    },
  ];

  return (
    <section
      ref={sectionRef}
className="py-24 bg-gradient-to-br from-background via-background to-brand-50/30 dark:to-brand-950/20 relative overflow-hidden w-full"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-l from-brand-500/5 to-transparent rounded-full blur-3xl animate-float"></div>
        <div
className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-r from-brand-400/5 to-transparent rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div
          className={`text-center max-w-4xl mx-auto mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          {/* Modern Badge */}
          <Badge
            variant="secondary"
className="mb-8 px-6 py-3 text-sm font-medium bg-brand-50 text-brand-700 border-brand-200"
          >
<Star className="w-4 h-4 mr-2 text-brand-600 fill-current" />
            Guest Experiences
          </Badge>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            What Our Guests
            <span className="block text-gradient-brand">Are Saying</span>
          </h2>

          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Join thousands of satisfied guests who've discovered the{" "}
            <span className="font-bold text-foreground">
              transformative benefits
            </span>{" "}
            of authentic, direct booking experiences.
          </p>

          {/* Social proof stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600 mb-2">4.9★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-600 mb-2">
                500+
              </div>
              <div className="text-sm text-muted-foreground">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">
                100%
              </div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Enhanced Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`group ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <Card className="card-premium-modern p-6 h-full relative overflow-hidden group-hover:shadow-glass transition-all duration-500">
                {/* Background glow */}
<div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-brand-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  {/* Simplified Rating */}
                  <div className="flex justify-center mb-6">
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
className="w-5 h-5 fill-brand-500 text-brand-500 group-hover:scale-110 transition-transform duration-200"
                          strokeWidth={1.5}
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Content */}
                  <blockquote className="text-foreground leading-relaxed mb-6 text-center font-medium">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Simplified Profile */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-border">
                    <Avatar className="h-12 w-12 ring-2 ring-border">
                      <AvatarImage
                        src={testimonial.image}
                        alt={testimonial.name}
                      />
<AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground mb-1">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div
          className={`text-center mt-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.8s" }}
        >
          <Card className="card-premium-modern p-12 max-w-4xl mx-auto overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, currentColor 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              ></div>
            </div>

            <div className="relative z-10">
              <div className="mb-8">
                <Badge
                  variant="secondary"
                  className="mb-6 px-6 py-3 text-sm font-medium bg-purple-50 text-purple-700 border-purple-200"
                >
                  <CheckCircle className="w-4 h-4 mr-2 text-brand-500" />
                  Join Our Growing Community
                </Badge>

                <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                  Ready to Experience
                  <span className="block text-gradient-brand">
                    The Difference?
                  </span>
                </h3>

                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of travelers who've discovered the{" "}
                  <span className="font-bold text-foreground">
                    authentic joy
                  </span>{" "}
                  of direct booking and genuine hospitality connections.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/properties" className="group">
<Button variant="brandOnBlack" className="px-12 py-5 text-lg">
                    <span className="flex items-center">
                      Start Your Journey
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
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

              {/* Enhanced trust indicators */}
              <div className="flex flex-wrap justify-center gap-8 mt-12 text-neutral-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Trusted by 500+ guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
className="w-3 h-3 bg-brand-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <span className="font-medium">Zero platform fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <span className="font-medium">Instant booking</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
