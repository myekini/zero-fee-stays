"use client";

import React from "react";
import Image from "next/image";
import { ArrowDownRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/landing/animated-group";
import { AnimatedText } from "@/components/landing/animated-text";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HeroHeader } from "@/components/landing/HeroHeader";
import { ModernSearch } from "@/components/ModernSearch";

interface LocationSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface HeroShowcaseProps {
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  reviews?: {
    count: number;
    avatars: {
      src: string;
      alt: string;
    }[];
    rating?: number;
  };
}

const Hero = ({
  heading = "Luxury Stays, Zero Fees",
  description = "Book direct. Save more. No hidden charges.",
  buttons = {
    primary: {
      text: "Find Stays",
      url: "#search",
    },
    secondary: {
      text: "How it Works",
      url: "#how-it-works",
    },
  },
  reviews = {
    count: 200,
    rating: 5.0,
    avatars: [
      {
        src: "https://github.com/shadcn.png",
        alt: "Avatar 1",
      },
      {
        src: "https://github.com/vercel.png",
        alt: "Avatar 2",
      },
      {
        src: "https://github.com/nextjs.png",
        alt: "Avatar 3",
      },
      {
        src: "https://github.com/tailwindcss.png",
        alt: "Avatar 4",
      },
      {
        src: "https://github.com/typescript.png",
        alt: "Avatar 5",
      },
    ],
  },
}: HeroShowcaseProps) => {
  return (
    <section>
      <motion.section
        className="relative overflow-visible bg-gradient-to-br from-background via-background to-brand-50 dark:to-brand-950 min-h-[85vh] flex items-center"
        initial={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", bounce: 0.32, duration: 0.9 }}
      >
        {/* Premium Background Elements */}
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center bg-no-repeat opacity-5" />
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-brand-500/20 rounded-full mix-blend-multiply opacity-40 animate-blob" />
        <div className="absolute top-1/3 -right-4 w-72 h-72 bg-brand-400/20 rounded-full mix-blend-multiply opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-brand-400/20 rounded-full mix-blend-multiply opacity-40 animate-blob animation-delay-4000" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-24 z-10">
          {/* Main Content */}
          <div className="text-center mb-16">
            <AnimatedGroup
              preset="blur-slide"
              className="mx-auto flex flex-col items-center text-center max-w-4xl"
            >
              <AnimatedText
                as="h1"
                className="my-8 text-4xl font-bold text-pretty lg:text-6xl xl:text-7xl tracking-tight leading-[1.1] text-foreground"
              >
<span className="inline-block bg-gradient-to-r from-brand-700 via-brand-600 to-brand-400 bg-clip-text text-transparent">
                  {heading.split(" ").slice(0, 2).join(" ")}
                </span>
                <br className="hidden sm:block" />
                <span className="text-foreground/90">
                  {heading.split(" ").slice(2).join(" ")}
                </span>
              </AnimatedText>
              <AnimatedText
                as="p"
                className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg lg:text-xl leading-relaxed font-medium"
                delay={0.12}
              >
                {description}
              </AnimatedText>

              {/* Trust Indicators */}
              <motion.div
                className="mb-8 flex flex-wrap justify-center items-center gap-8 text-sm font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-500 rounded-full" />
                  <span>No fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-400 rounded-full" />
                  <span>Direct booking</span>
                </div>
              </motion.div>
              <AnimatedGroup
                preset="slide"
                className="mb-12 flex w-fit flex-col items-center gap-4 sm:flex-row"
              >
                <span className="inline-flex items-center -space-x-4">
                  {reviews.avatars.map((avatar, index) => (
                    <motion.div
                      key={`${avatar.src}-${index}`}
                      whileHover={{ y: -8 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      style={{ display: "inline-block" }}
                    >
                      <Avatar className="size-12 border">
                        <AvatarImage src={avatar.src} alt={avatar.alt} />
                      </Avatar>
                    </motion.div>
                  ))}
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starNumber) => (
                      <Star
                        key={`star-${starNumber}`}
                        className="size-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="mr-1 font-semibold">
                      {reviews.rating?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </AnimatedGroup>
              <AnimatedGroup
                preset="slide"
                className="flex w-full flex-col justify-center gap-4 sm:flex-row"
              >
                {buttons.primary && (
                  <Button
                    asChild
                    size="lg"
                    variant="brandOnBlack"
                    className="px-8 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <a
                      href={buttons.primary.url}
                      className="flex items-center gap-2"
                    >
                      {buttons.primary.text}
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowDownRight className="size-5" />
                      </motion.div>
                    </a>
                  </Button>
                )}
                {buttons.secondary && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-neutral-200 hover:border-brand-300 text-neutral-700 hover:text-brand-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    <a
                      href={buttons.secondary.url}
                      className="flex items-center gap-2"
                    >
                      {buttons.secondary.text}
                      <ArrowDownRight className="size-4" />
                    </a>
                  </Button>
                )}
              </AnimatedGroup>
            </AnimatedGroup>
          </div>

          {/* Modern Search Component */}
          <ModernSearch />
        </div>
      </motion.section>
    </section>
  );
};

export default Hero;
