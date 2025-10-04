import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "white" | "grayscale";
  type?: "full" | "icon" | "wordmark";
  className?: string;
}

export const Logo = ({
  size = "md",
  variant = "primary",
  type = "full",
  className,
}: LogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
    xl: "h-20",
  };

  const colors = {
    primary: {
      house: "#1a5f4a",
      heart: "#d4a574",
      text: "#292524",
    },
    white: {
      house: "#FFFFFF",
      heart: "#FFFFFF",
      text: "#FFFFFF",
    },
    grayscale: {
      house: "#292524",
      heart: "#292524",
      text: "#292524",
    },
  };

  const currentColors = colors[variant];

  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      <svg
        viewBox={type === "icon" ? "0 0 60 60" : "0 0 200 60"}
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* House icon with heart */}
        {(type === "full" || type === "icon") && (
          <g>
            {/* House outline */}
            <path
              d="M15 35L25 25L35 35L35 45L15 45Z"
              fill="none"
              stroke={currentColors.house}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Heart inside */}
            <path
              d="M22 32c0-1.5 1.5-3 3-3s3 1.5 3 3c0 3-3 5-3 5s-3-2-3-5z"
              fill={currentColors.heart}
            />
          </g>
        )}

        {/* Wordmark */}
        {(type === "full" || type === "wordmark") && (
          <g>
            <text
              x={type === "full" ? "50" : "10"}
              y="38"
              fontFamily="Nunito, sans-serif"
              fontSize="24"
              fontWeight="700"
              fill={currentColors.text}
            >
              <tspan fill={currentColors.house}>Hiddy</tspan>
              <tspan fill={currentColors.heart}>Stays</tspan>
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default Logo;
