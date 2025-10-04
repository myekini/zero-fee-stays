"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function HeroHeader() {
  return (
    <motion.div
      className="relative z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              ZeroFeeStays
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How it Works
            </a>
            <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Reviews
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
