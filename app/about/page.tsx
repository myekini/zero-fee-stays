"use client";

import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Heart, Shield, DollarSign, Users, Sparkles, TrendingUp } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About HiddyStays
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We're on a mission to revolutionize property rentals by eliminating
            unnecessary fees and connecting hosts directly with guests.
          </p>
        </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              HiddyStays was born from a simple observation: property rental
              platforms charge excessive fees that benefit neither hosts nor
              guests. We believe in a fairer model where hosts keep 100% of
              their earnings and guests save money on every booking.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our zero-fee platform empowers Canadian property owners to
              maximize their income while providing travelers with authentic,
              affordable accommodations. No hidden charges, no platform fees –
              just transparent, direct connections.
            </p>
          </Card>
        </div>

        {/* Values Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-3">Zero Fees</h3>
              <p className="text-muted-foreground">
                Hosts keep 100% of their earnings. No platform fees, no hidden
                charges, no surprises.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-3">Trust & Safety</h3>
              <p className="text-muted-foreground">
                Secure payments, verified hosts, and comprehensive protection
                for both parties.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-semibold mb-3">Community First</h3>
              <p className="text-muted-foreground">
                Building a supportive community of hosts and travelers who value
                authenticity.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <h3 className="text-xl font-semibold mb-3">Quality Experience</h3>
              <p className="text-muted-foreground">
                Curated properties that meet our high standards for comfort and
                hospitality.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-xl font-semibold mb-3">Host Success</h3>
              <p className="text-muted-foreground">
                Tools and support to help property owners succeed and grow their
                business.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h3 className="text-xl font-semibold mb-3">Authentic Stays</h3>
              <p className="text-muted-foreground">
                Unique properties with character, not cookie-cutter
                accommodations.
              </p>
            </Card>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                HiddyStays started with a conversation between property owners
                frustrated with high platform fees and travelers tired of being
                charged extra for the same service. We asked ourselves: "What if
                there was a better way?"
              </p>
              <p>
                Our founders, who have been both hosts and travelers, understood
                the pain points on both sides. They envisioned a platform that
                would eliminate the middleman markup while maintaining – and even
                enhancing – the quality of service.
              </p>
              <p>
                Today, HiddyStays is proud to serve the Canadian market with a
                growing community of hosts and guests who appreciate transparency,
                fairness, and authentic hospitality. We're just getting started,
                and we're excited to have you join us on this journey.
              </p>
            </div>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-primary/5">
            <h2 className="text-2xl font-bold text-center mb-8">
              By The Numbers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">0%</div>
                <div className="text-sm text-muted-foreground">Platform Fees</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">
                  Host Earnings Kept
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">🇨🇦</div>
                <div className="text-sm text-muted-foreground">
                  Proudly Canadian
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
