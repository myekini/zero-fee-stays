"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  delay?: number;
}

export function AnimatedText({
  children,
  className = "",
  as: Component = "div",
  delay = 0,
}: AnimatedTextProps) {
  const MotionComponent = motion(Component as any);
  
  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay,
      }}
    >
      {children}
    </MotionComponent>
  );
}
