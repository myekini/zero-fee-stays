import { Star, Quote, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

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
        "Hiddy's properties have completely transformed my travel experience. The zero platform fees mean I save money, and the direct communication has made every stay more personal and enjoyable.",
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
        "Perfect for family vacations. Hiddy's properties are well-maintained, and the direct messaging feature helps me coordinate everything before arrival.",
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
        "Great for adventure trips. Hiddy's properties are unique and the direct communication ensures I get insider tips about the local area.",
      location: "Montreal, QC",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-12 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-l from-hiddy-coral/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-r from-hiddy-teal/10 to-transparent rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div
          className={`text-center max-w-4xl mx-auto mb-12 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full text-slate-700 font-semibold text-sm mb-8">
            <Star className="w-4 h-4 mr-2 text-yellow-500 fill-current" />
            Guest Experiences
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            What Our Guests
            <span className="block text-transparent bg-gradient-to-r from-hiddy-coral to-hiddy-teal bg-clip-text">
              Are Saying
            </span>
          </h2>

          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Join thousands of satisfied guests who've discovered the{" "}
            <span className="font-bold text-slate-800">
              transformative benefits
            </span>{" "}
            of authentic, direct booking experiences.
          </p>

          {/* Social proof stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-hiddy-coral mb-2">
                4.9★
              </div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-hiddy-teal mb-2">
                500+
              </div>
              <div className="text-sm text-slate-600">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-hiddy-sunset mb-2">
                100%
              </div>
              <div className="text-sm text-slate-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Enhanced Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`group ${isVisible ? "animate-slideInScale" : "opacity-0"}`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="card-premium p-8 h-full relative overflow-hidden group-hover:shadow-2xl transition-all duration-700">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-hiddy-coral/5 via-transparent to-hiddy-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  {/* Simplified Rating */}
                  <div className="flex justify-center mb-6">
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform duration-200"
                          strokeWidth={1.5}
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Content */}
                  <blockquote className="text-slate-700 leading-relaxed mb-8 text-center text-lg font-medium">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Simplified Profile */}
                  <div className="flex items-center space-x-4 pt-6 border-t border-slate-100">
                    <div className="relative w-12 h-12 rounded-full ring-2 ring-slate-100 overflow-hidden bg-slate-200 flex items-center justify-center">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <div className="hidden w-full h-full bg-gradient-to-br from-hiddy-coral to-hiddy-teal flex items-center justify-center text-white font-bold text-sm">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div
          className={`text-center mt-12 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
          style={{ animationDelay: "0.8s" }}
        >
          <div className="relative glassmorphism-enhanced rounded-3xl p-12 max-w-4xl mx-auto overflow-hidden">
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
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-slate-700 font-semibold text-sm mb-6">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Join Our Growing Community
                </div>

                <h3 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                  Ready to Experience
                  <span className="block text-transparent bg-gradient-to-r from-hiddy-coral to-hiddy-teal bg-clip-text">
                    The Difference?
                  </span>
                </h3>

                <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of travelers who've discovered the{" "}
                  <span className="font-bold text-slate-800">
                    authentic joy
                  </span>{" "}
                  of direct booking and genuine hospitality connections.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/properties" className="group">
                  <button className="btn-gradient-terracotta-sage px-12 py-5 relative overflow-hidden z-20">
                    <span className="relative z-30 flex items-center text-lg text-white drop-shadow-lg font-bold">
                      Start Your Journey
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </Link>

                <button className="px-12 py-5 bg-white/90 backdrop-blur-sm border-2 border-slate-200 hover:border-hiddy-coral text-slate-700 hover:text-hiddy-coral font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl text-lg">
                  Learn More
                </button>
              </div>

              {/* Enhanced trust indicators */}
              <div className="flex flex-wrap justify-center gap-8 mt-12 text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Trusted by 500+ guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
