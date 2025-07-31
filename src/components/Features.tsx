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
      color: "text-emerald-600"
    },
    {
      icon: Calendar,
      title: "Real-time Availability",
      description: "Instant booking confirmations with live calendar updates.",
      color: "text-blue-600"
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Verified properties and hosts. Read authentic reviews from real guests.",
      color: "text-yellow-600"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support for hosts and guests.",
      color: "text-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose BookDirect?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Experience the difference of a platform built for hosts and guests, not profit margins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="property-card p-6 border-border bg-card group">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-surface ${feature.color} transition-transform duration-normal group-hover:scale-110`}>
                  <feature.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
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