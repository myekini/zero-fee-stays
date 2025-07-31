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
    <section className="py-24 bg-gradient-to-b from-muted/20 to-muted/40">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose BookDirect?
          </h2>
          <p className="text-lg text-muted-foreground">
            Experience the difference of a platform built for hosts and guests, not profit margins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 border-border bg-card/80 backdrop-blur-sm hover:scale-105 group">
              <div className="flex items-start space-x-5">
                <div className={`p-4 rounded-xl bg-gradient-to-br from-background to-muted/50 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
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