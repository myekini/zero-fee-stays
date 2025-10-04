"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedGroupProps {
  children: ReactNode;
  className?: string;
  preset?: "blur-slide" | "slide" | "fade" | "scale";
  delay?: number;
}

const presets = {
  "blur-slide": {
    initial: { opacity: 0, y: 20, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function AnimatedGroup({
  children,
  className = "",
  preset = "slide",
  delay = 0,
}: AnimatedGroupProps) {
  const animationConfig = presets[preset];

  return (
    <motion.div
      className={className}
      initial={animationConfig.initial}
      animate={animationConfig.animate}
      transition={{
        ...animationConfig.transition,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
