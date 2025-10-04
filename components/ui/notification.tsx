import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  AlertCircle,
  X,
  Bell,
  BellOff,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const notificationVariants = cva(
  "relative w-full rounded-lg border p-4 transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-100",
        warning:
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100",
        error:
          "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/20 dark:text-red-100",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-100",
        // HiddyStays brand variants
        sage: "border-sage-200 bg-sage-50 text-sage-900 dark:border-sage-800 dark:bg-sage-950/20 dark:text-sage-100",
        sand: "border-sand-200 bg-sand-50 text-sand-900 dark:border-sand-800 dark:bg-sand-950/20 dark:text-sand-100",
        terracotta:
          "border-terracotta-200 bg-terracotta-50 text-terracotta-900 dark:border-terracotta-800 dark:bg-terracotta-950/20 dark:text-terracotta-100",
      },
      size: {
        sm: "p-3 text-sm",
        md: "p-4 text-base",
        lg: "p-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  (
    {
      className,
      variant,
      size,
      title,
      description,
      icon,
      actions,
      onClose,
      dismissible = false,
      autoClose = false,
      autoCloseDelay = 5000,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);

    // Auto-close functionality
    React.useEffect(() => {
      if (autoClose && autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
      return undefined;
    }, [autoClose, autoCloseDelay, onClose]);

    // Get default icon based on variant
    const getDefaultIcon = () => {
      if (icon) return icon;

      switch (variant) {
        case "success":
          return (
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          );
        case "warning":
          return (
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          );
        case "error":
          return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
        case "info":
          return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
        case "sage":
          return (
            <CheckCircle className="h-5 w-5 text-sage-600 dark:text-sage-400" />
          );
        case "sand":
          return (
            <AlertCircle className="h-5 w-5 text-sand-600 dark:text-sand-400" />
          );
        case "terracotta":
          return (
            <AlertTriangle className="h-5 w-5 text-terracotta-600 dark:text-terracotta-400" />
          );
        default:
          return <Bell className="h-5 w-5 text-foreground" />;
      }
    };

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          notificationVariants({ variant, size }),
          "animate-in slide-in-from-top-2 duration-300",
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">{getDefaultIcon()}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold leading-tight mb-1">{title}</h4>
            )}
            {description && (
              <p className="text-sm opacity-90 leading-relaxed">
                {description}
              </p>
            )}
            {children}

            {/* Actions */}
            {actions && <div className="flex gap-2 mt-3">{actions}</div>}
          </div>

          {/* Close button */}
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-6 w-6 p-0 opacity-70 hover:opacity-100"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close notification</span>
            </Button>
          )}
        </div>
      </div>
    );
  }
);
Notification.displayName = "Notification";

// Notification Container
interface NotificationContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxNotifications?: number;
  children: React.ReactNode;
}

const NotificationContainer = React.forwardRef<
  HTMLDivElement,
  NotificationContainerProps
>(
  (
    {
      className,
      position = "top-right",
      maxNotifications = 5,
      children,
      ...props
    },
    ref
  ) => {
    const positionClasses = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-center": "top-4 left-1/2 -translate-x-1/2",
      "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 flex flex-col gap-2 max-w-sm w-full",
          positionClasses[position],
          className
        )}
        {...props}
      >
        {React.Children.toArray(children).slice(0, maxNotifications)}
      </div>
    );
  }
);
NotificationContainer.displayName = "NotificationContainer";

// Notification Group
interface NotificationGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

const NotificationGroup = React.forwardRef<
  HTMLDivElement,
  NotificationGroupProps
>(({ className, title, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground px-1">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
});
NotificationGroup.displayName = "NotificationGroup";

// Notification Action Button
interface NotificationActionProps extends React.ComponentProps<typeof Button> {
  variant?: "default" | "secondary" | "outline" | "ghost";
}

const NotificationAction = React.forwardRef<
  HTMLButtonElement,
  NotificationActionProps
>(({ className, variant = "outline", size = "sm", ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("text-xs", className)}
      {...props}
    />
  );
});
NotificationAction.displayName = "NotificationAction";

export {
  Notification,
  NotificationContainer,
  NotificationGroup,
  NotificationAction,
};
