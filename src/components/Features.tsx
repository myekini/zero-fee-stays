import { Shield, DollarSign, MessageCircle, Calendar, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: DollarSign,
      title: "Zero Platform Fees",
      description: "Keep 100% of your earnings. No hidden charges or commission fees.",
      color: "text-success"
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Chat directly with hosts. Build relationships and get personalized service.",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Protected transactions with Stripe. Your money is safe with us.",
      color: "text-secondary"
    },
    {
      icon: Calendar,
      title: "Real-time Availability",
      description: "Instant booking confirmations with live calendar updates.",
      color: "text-primary"
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Verified properties and hosts. Read authentic reviews from real guests.",
      color: "text-warning"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support for hosts and guests.",
      color: "text-info"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Why Choose BookDirect?
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            Experience the difference of a platform built for hosts and guests, not profit margins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="card-modern p-8 group">
              <div className="flex items-start space-x-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 ${feature.color} group-hover:scale-110 transition-all duration-300 shadow-sm`}>
                  <feature.icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;