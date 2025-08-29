import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle, Info, XCircle, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/5",
        success:
          "border-emerald-200 text-emerald-900 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-100 dark:bg-emerald-950/20 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
        warning:
          "border-amber-200 text-amber-900 bg-amber-50 dark:border-amber-800 dark:text-amber-100 dark:bg-amber-950/20 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        info:
          "border-blue-200 text-blue-900 bg-blue-50 dark:border-blue-800 dark:text-blue-100 dark:bg-blue-950/20 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        // HiddyStays brand variants
        sage:
          "border-sage-200 text-sage-900 bg-sage-50 dark:border-sage-800 dark:text-sage-100 dark:bg-sage-950/20 [&>svg]:text-sage-600 dark:[&>svg]:text-sage-400",
        sand:
          "border-sand-200 text-sand-900 bg-sand-50 dark:border-sand-800 dark:text-sand-100 dark:bg-sand-950/20 [&>svg]:text-sand-600 dark:[&>svg]:text-sand-400",
        terracotta:
          "border-terracotta-200 text-terracotta-900 bg-terracotta-50 dark:border-terracotta-800 dark:text-terracotta-100 dark:bg-terracotta-950/20 [&>svg]:text-terracotta-600 dark:[&>svg]:text-terracotta-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, children, ...props }, ref) => {
  // Auto-detect icon based on variant if no icon is provided
  const getIcon = () => {
    if (React.Children.toArray(children).some(child => 
      React.isValidElement(child) && child.type === AlertIcon
    )) {
      return null // Icon already provided
    }
    
    switch (variant) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      case "destructive":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const icon = getIcon()

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon}
      {children}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("absolute left-4 top-4", className)}
    {...props}
  >
    {children}
  </div>
))
AlertIcon.displayName = "AlertIcon"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertIcon, AlertTitle, AlertDescription }
