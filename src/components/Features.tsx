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
import { Link } from "react-router-dom";

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const features = [
    {
      icon: DollarSign,
      title: "Zero Platform Fees",
      description:
        "Keep 100% of your earnings. No hidden charges or commission fees.",
      color: "text-sage-600",
      bgColor: "bg-sage-50",
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description:
        "Chat directly with Hiddy. Get personalized service and recommendations.",
      color: "text-sand-600",
      bgColor: "bg-sand-50",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Protected transactions with Stripe. Your money is safe with us.",
      color: "text-terracotta-600",
      bgColor: "bg-terracotta-50",
    },
    {
      icon: Calendar,
      title: "Real-time Availability",
      description: "Instant booking confirmations with live calendar updates.",
      color: "text-sage-500",
      bgColor: "bg-sage-50",
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description:
        "Verified properties and authentic reviews from real guests.",
      color: "text-sand-500",
      bgColor: "bg-sand-50",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your needs.",
      color: "text-terracotta-500",
      bgColor: "bg-terracotta-50",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: Search,
      title: "Search Properties",
      description: "Browse our verified properties with zero platform fees",
      color: "from-sage-500 to-sage-600",
    },
    {
      step: 2,
      icon: MessageCircle,
      title: "Connect Directly",
      description:
        "Chat with Hiddy directly to get personalized recommendations",
      color: "from-sand-500 to-sand-600",
    },
    {
      step: 3,
      icon: CreditCard,
      title: "Secure Booking",
      description: "Book with confidence using our secure payment system",
      color: "from-terracotta-500 to-terracotta-600",
    },
    {
      step: 4,
      icon: CheckCircle,
      title: "Enjoy Your Stay",
      description:
        "Experience authentic hospitality with direct support from Hiddy",
      color: "from-orange-500 to-orange-600",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-12 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden"
      ref={sectionRef}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-hiddy-teal/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-l from-hiddy-coral/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced How It Works Section */}
        <div
          className={`text-center max-w-4xl mx-auto mb-12 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-hiddy-coral/10 to-hiddy-teal/10 rounded-full text-slate-700 font-semibold text-sm mb-8 border border-slate-200/50">
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
            Simple • Secure • Direct
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            How It
            <span className="block text-transparent bg-gradient-to-r from-hiddy-coral to-hiddy-teal bg-clip-text animate-shimmer">
              Actually Works
            </span>
          </h2>

          <p className="text-xl text-slate-600 leading-relaxed mb-12 max-w-3xl mx-auto">
            Experience the revolutionary simplicity of direct booking in just{" "}
            <span className="font-bold text-slate-800">4 seamless steps</span>.
            No complexity, no hidden fees, just pure hospitality.
          </p>

          {/* Enhanced How It Works Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => (
              <div
                key={step.step}
                className={`relative group ${isVisible ? "animate-slideInScale" : "opacity-0"}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Connection line for desktop */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-slate-300 to-transparent z-0"></div>
                )}

                <div className="relative z-10 text-center">
                  {/* Enhanced step indicator */}
                  <div
                    className={`relative mx-auto w-24 h-24 bg-gradient-to-br ${step.color} rounded-2xl mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                  >
                    <step.icon
                      className="w-10 h-10 text-white"
                      strokeWidth={1.5}
                    />

                    {/* Step number */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-slate-100">
                      <span className="text-sm font-bold text-slate-700">
                        {step.step}
                      </span>
                    </div>

                    {/* Glow effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300`}
                    ></div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-slate-900 mb-3 group-hover:text-hiddy-coral transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div
          className={`text-center max-w-4xl mx-auto mb-12 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
          style={{ animationDelay: "0.8s" }}
        >
          {/* Section divider */}
          <div className="flex items-center justify-center mb-12">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-32"></div>
            <div className="mx-8 px-4 py-2 bg-white rounded-full border border-slate-200 text-slate-500 text-sm font-medium">
              Platform Benefits
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-32"></div>
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Why Choose
            <span className="block text-transparent bg-gradient-to-r from-hiddy-coral to-hiddy-teal bg-clip-text">
              Direct Booking?
            </span>
          </h2>

          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Experience the revolutionary difference of a platform built for{" "}
            <span className="font-bold text-slate-800">
              authentic connections
            </span>
            , not profit margins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group ${isVisible ? "animate-slideInScale" : "opacity-0"}`}
              style={{ animationDelay: `${1 + index * 0.1}s` }}
            >
              <Card className="card-premium p-10 h-full group-hover:shadow-2xl transition-all duration-700 border-0 relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  {/* Enhanced icon container */}
                  <div className="flex items-center justify-between mb-8">
                    <div
                      className={`relative p-5 rounded-3xl ${feature.bgColor} ${feature.color} group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl`}
                    >
                      <feature.icon className="w-8 h-8" strokeWidth={1.5} />

                      {/* Icon glow effect */}
                      <div
                        className={`absolute inset-0 ${feature.bgColor} rounded-3xl opacity-50 blur-lg group-hover:opacity-75 transition-opacity duration-500`}
                      ></div>
                    </div>

                    {/* Floating indicator */}
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-display text-2xl font-bold text-slate-900 mb-4 group-hover:text-hiddy-coral transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>

                  {/* Subtle bottom accent */}
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Always included
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div
          className={`text-center max-w-4xl mx-auto mt-12 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
          style={{ animationDelay: "1.6s" }}
        >
          <div className="relative glassmorphism-enhanced rounded-3xl p-16 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, currentColor 2px, transparent 2px)",
                  backgroundSize: "32px 32px",
                }}
              ></div>
            </div>

            <div className="relative z-10">
              <div className="mb-8">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full text-slate-700 font-semibold text-sm mb-6">
                  <Heart className="w-4 h-4 mr-2 text-red-500 fill-current" />
                  Join Our Community
                </div>

                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                  Ready to Start Your
                  <span className="block text-transparent bg-gradient-to-r from-hiddy-coral to-hiddy-teal bg-clip-text">
                    Adventure?
                  </span>
                </h2>

                <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-12 max-w-4xl mx-auto">
                  Join thousands of travelers who've discovered the
                  transformative power of{" "}
                  <span className="font-bold text-slate-800">
                    direct booking
                  </span>{" "}
                  and authentic hospitality.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/properties" className="group">
                  <button className="btn-gradient-terracotta-sage px-12 py-5 relative overflow-hidden z-20">
                    <span className="relative z-30 flex items-center text-lg text-white drop-shadow-lg font-bold">
                      Get Started Today
                      <ArrowRight className="h-5 w-5 ml-3" />
                    </span>
                  </button>
                </Link>

                <button className="px-12 py-5 bg-white/90 backdrop-blur-sm border-2 border-slate-200 hover:border-hiddy-coral text-slate-700 hover:text-hiddy-coral font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl text-lg">
                  Learn More
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-8 mt-12 text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">Instant confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">No hidden fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">24/7 support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
