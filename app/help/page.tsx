"use client";

import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpCircle, Mail, MessageCircle, BookOpen } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      question: "How does HiddyStays work?",
      answer:
        "HiddyStays connects property owners directly with guests without charging platform fees. Hosts list their properties for free, guests book directly, and hosts keep 100% of their earnings. We handle secure payments and provide support throughout the booking process.",
    },
    {
      question: "Are there really zero fees?",
      answer:
        "Yes! We don't charge hosts any platform fees or commissions. Guests also don't pay service fees. The only fee is the standard payment processing fee (charged by Stripe, our secure payment provider), which is typically around 2.9% + 30¢ per transaction.",
    },
    {
      question: "How do I create a booking?",
      answer:
        "Simply browse our properties, select the one you like, choose your dates and number of guests, and click 'Reserve Now'. You can book as a guest (without creating an account) or sign in for a faster checkout experience. Enter your details, complete the payment, and you'll receive a confirmation email.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor, Stripe. All transactions are encrypted and secure.",
    },
    {
      question: "Can I cancel my booking?",
      answer:
        "Cancellation policies vary by property. Most properties offer free cancellation up to 24 hours before check-in. Please review the specific cancellation policy on the property listing before booking. You can also view your booking details in your bookings dashboard.",
    },
    {
      question: "How do I become a host?",
      answer:
        "Click 'List Your Property' on our homepage or create an account and navigate to the Host Dashboard. You'll need to provide property details, photos, pricing, and availability. Our team will review your listing to ensure it meets our quality standards before it goes live.",
    },
    {
      question: "When do hosts get paid?",
      answer:
        "Hosts receive payment shortly after a guest checks in, typically within 24 hours. Payments are processed securely through Stripe and deposited directly to your bank account or preferred payment method.",
    },
    {
      question: "Is my personal information safe?",
      answer:
        "Absolutely. We use industry-standard encryption and security measures to protect your data. We never share your personal information with third parties without your consent. Payment information is handled securely by Stripe and never stored on our servers.",
    },
    {
      question: "What if I have an issue during my stay?",
      answer:
        "Contact your host directly through our messaging system first. If the issue can't be resolved, reach out to our support team at support@hiddystays.com. We're available 24/7 to help resolve any concerns.",
    },
    {
      question: "Can I modify my booking after it's confirmed?",
      answer:
        "Changes to bookings depend on the host's policy and availability. Contact your host through the platform to request changes. Some modifications may require canceling and rebooking.",
    },
  ];

  const categories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      topics: [
        "Creating an account",
        "Browsing properties",
        "Making your first booking",
        "Understanding our fees (or lack thereof!)",
      ],
    },
    {
      title: "For Guests",
      icon: HelpCircle,
      topics: [
        "How to search for properties",
        "Booking process",
        "Payment and security",
        "Cancellation policies",
        "Contacting hosts",
      ],
    },
    {
      title: "For Hosts",
      icon: HelpCircle,
      topics: [
        "Listing your property",
        "Setting your rates",
        "Managing bookings",
        "Getting paid",
        "Host protection and insurance",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How Can We Help?
          </h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions or get in touch with our support
            team
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {categories.map((category, index) => (
            <Card key={index} className="p-6">
              <category.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-3">{category.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {category.topics.map((topic, i) => (
                  <li key={i}>• {topic}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Card className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>

        {/* Contact Support */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center bg-primary/5">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to
              help.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/contact">
                <Button size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:support@hiddystays.com">
                  Email Us Directly
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
