"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle } from "lucide-react";

interface NewsletterSubscriptionProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  source?: string;
  className?: string;
}

export default function NewsletterSubscription({
  title = "Stay Updated",
  description = "Get the latest deals and travel tips.",
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  source = "footer",
  className = "",
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name: name.trim() || undefined,
          source: source,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(true);
        toast({
          title: "Successfully Subscribed!",
          description: data.message,
        });

        // Reset form
        setEmail("");
        setName("");
      } else {
        toast({
          title: "Subscription Failed",
          description: data.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-brand-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Thank You for Subscribing!
          </h4>
          <p className="text-sm text-muted-foreground">
            Check your email for a welcome message and exclusive travel tips.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Mail className="h-5 w-5 text-brand-600 dark:text-brand-300 mr-2" />
        <h4 className="text-lg font-semibold text-foreground">{title}</h4>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
        />

        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
          required
        />

        <Button
          type="submit"
          disabled={isLoading}
          variant="brandOnBlack"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-3">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </Card>
  );
}
