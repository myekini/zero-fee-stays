import React from 'react';
import { cn } from '@/lib/utils';

interface TouchOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const TouchOptimizedInput: React.FC<TouchOptimizedInputProps> = ({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={cn(
            // Base mobile-optimized input styles
            "w-full px-4 py-3 text-base rounded-lg border border-border bg-background",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "placeholder:text-muted-foreground",
            "transition-all duration-200",
            // Mobile-specific optimizations
            "min-h-[48px] touch-target", // Minimum touch target size
            "text-[16px]", // Prevents zoom on iOS
            "-webkit-appearance-none appearance-none", // Remove default styling
            // Icon spacing
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            // Error state
            error && "border-destructive focus:ring-destructive focus:border-destructive",
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
};

interface TouchOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = cn(
    // Base button styles
    "inline-flex items-center justify-center font-medium rounded-lg",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
    "transition-all duration-200 active:scale-95",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    // Mobile touch optimization
    "touch-target min-h-[48px]",
    "select-none", // Prevent text selection on touch
    // Full width
    fullWidth && "w-full"
  );

  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    outline: "border border-border bg-background hover:bg-muted text-foreground",
    ghost: "text-foreground hover:bg-muted"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm min-h-[40px]",
    md: "px-6 py-3 text-base min-h-[48px]",
    lg: "px-8 py-4 text-lg min-h-[56px]"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {children}
      
      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export { TouchOptimizedInput, TouchOptimizedButton };