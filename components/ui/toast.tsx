import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import {
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse p-0 sm:bottom-auto sm:right-4 sm:top-4 sm:flex-col md:max-w-[380px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center space-x-3 overflow-hidden rounded-2xl border p-4 pr-8 shadow-lg transition-all duration-200 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default:
          "border-neutral-200 bg-white text-neutral-900 dark:bg-slate-800 dark:text-neutral-100",
        destructive:
          "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
        info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
        // HiddyStays brand variants
        sage: "border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-100",
        sand: "border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-800 dark:bg-accent-950 dark:text-accent-100",
        terracotta:
          "border-terracotta-200 bg-terracotta-50 text-terracotta-800 dark:border-terracotta-800 dark:bg-terracotta-950 dark:text-terracotta-100",
        // Modern auth variant
        auth: "border-brand-200 bg-gradient-to-r from-brand-50 to-white text-brand-800 dark:border-brand-800 dark:bg-gradient-to-r dark:from-brand-950 dark:to-neutral-900 dark:text-brand-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, children, ...props }, ref) => {
  // Auto-detect icon based on variant if no icon is provided
  const getIcon = () => {
    if (
      React.Children.toArray(children).some(
        (child) => React.isValidElement(child) && child.type === ToastIcon
      )
    ) {
      return null; // Icon already provided
    }

    switch (variant) {
      case "success":
        return (
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        );
      case "warning":
        return (
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        );
      case "info":
        return (
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        );
      case "destructive":
        return (
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        );
      case "sage":
        return (
          <CheckCircle className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
        );
      case "sand":
        return (
          <AlertCircle className="h-5 w-5 text-accent-600 dark:text-accent-400 flex-shrink-0" />
        );
      case "terracotta":
        return (
          <AlertTriangle className="h-5 w-5 text-terracotta-600 dark:text-terracotta-400 flex-shrink-0" />
        );
      case "auth":
        return (
          <CheckCircle className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
        );
      default:
        return (
          <AlertCircle className="h-5 w-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
        );
    }
  };

  const icon = getIcon();

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      {children}
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex-shrink-0", className)} {...props}>
    {children}
  </div>
));
ToastIcon.displayName = "ToastIcon";

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-neutral-400 opacity-0 transition-all duration-200 hover:text-neutral-600 hover:bg-neutral-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-200 group-hover:opacity-100 group-[.destructive]:text-red-400 group-[.destructive]:hover:text-red-600 group-[.destructive]:hover:bg-red-100 group-[.destructive]:focus:ring-red-200",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3 w-3" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs text-neutral-600 leading-relaxed mt-0.5", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastIcon,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
