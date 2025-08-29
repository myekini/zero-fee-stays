import { toast, showToast } from "@/hooks/use-toast";

// Types for different alert types
export type AlertType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "sage"
  | "sand"
  | "terracotta";

export type AlertCategory =
  | "auth"
  | "booking"
  | "payment"
  | "network"
  | "system"
  | "user"
  | "property";

export interface AlertOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoClose?: boolean;
  category?: AlertCategory;
}

export interface AlertConfig {
  defaultDuration: number;
  maxToasts: number;
  position:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  enableSound: boolean;
  enableVibration: boolean;
}

// Default configuration
const defaultConfig: AlertConfig = {
  defaultDuration: 5000,
  maxToasts: 3,
  position: "top-right",
  enableSound: false,
  enableVibration: false,
};

class AlertingService {
  private config: AlertConfig = defaultConfig;
  private isOnline = navigator.onLine;

  constructor(config?: Partial<AlertConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.setupNetworkListeners();
  }

  // Configuration methods
  updateConfig(newConfig: Partial<AlertConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AlertConfig {
    return { ...this.config };
  }

  // Network status monitoring
  private setupNetworkListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.showNetworkStatus("online");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.showNetworkStatus("offline");
    });
  }

  private showNetworkStatus(status: "online" | "offline") {
    if (status === "online") {
      showToast.online("Connection Restored", "You are back online");
    } else {
      showToast.offline(
        "Connection Lost",
        "Please check your internet connection"
      );
    }
  }

  // Generic alert methods
  show(type: AlertType, options: AlertOptions) {
    const {
      title,
      description,
      duration = this.config.defaultDuration,
    } = options;

    // Add haptic feedback for mobile
    if (this.config.enableVibration && "vibrate" in navigator) {
      navigator.vibrate(50);
    }

    // Show toast based on type
    switch (type) {
      case "success":
        return showToast.success(title, description);
      case "error":
        return showToast.error(title, description);
      case "warning":
        return showToast.warning(title, description);
      case "info":
        return showToast.info(title, description);
      case "sage":
        return showToast.sage(title, description);
      case "sand":
        return showToast.sand(title, description);
      case "terracotta":
        return showToast.terracotta(title, description);
      default:
        return toast({ title, description });
    }
  }

  // Category-specific methods
  auth = {
    success: (title: string, description?: string) =>
      showToast.authSuccess(title, description),
    error: (title: string, description?: string) =>
      showToast.authError(title, description),
    loginSuccess: () =>
      showToast.authSuccess("Welcome back!", "You have successfully signed in"),
    loginError: (error?: string) =>
      showToast.authError(
        "Login Failed",
        error || "Please check your credentials"
      ),
    signupSuccess: (email?: string) =>
      showToast.authSuccess(
        "Account Created!",
        email
          ? `Please check ${email} to verify your account`
          : "Please check your email to verify your account"
      ),
    signupError: (error?: string) =>
      showToast.authError("Sign Up Failed", error || "Please try again"),
    logoutSuccess: () =>
      showToast.authSuccess(
        "Signed Out",
        "You have been successfully signed out"
      ),
    passwordResetSent: (email?: string) =>
      showToast.authSuccess(
        "Reset Email Sent",
        email
          ? `Password reset instructions sent to ${email}`
          : "Password reset instructions sent to your email"
      ),
    passwordResetError: (error?: string) =>
      showToast.authError("Password Reset Failed", error || "Please try again"),
    emailVerified: () =>
      showToast.authSuccess(
        "Email Verified",
        "Your email has been successfully verified"
      ),
    emailVerificationError: () =>
      showToast.authError(
        "Email Verification Failed",
        "Please try again or contact support"
      ),
  };

  booking = {
    success: (title: string, description?: string) =>
      showToast.bookingSuccess(title, description),
    error: (title: string, description?: string) =>
      showToast.bookingError(title, description),
    created: (propertyName?: string) =>
      showToast.bookingSuccess(
        "Booking Confirmed!",
        propertyName
          ? `Your booking for ${propertyName} has been confirmed`
          : "Your booking has been confirmed"
      ),
    cancelled: (propertyName?: string) =>
      showToast.bookingSuccess(
        "Booking Cancelled",
        propertyName
          ? `Your booking for ${propertyName} has been cancelled`
          : "Your booking has been cancelled"
      ),
    updated: (propertyName?: string) =>
      showToast.bookingSuccess(
        "Booking Updated",
        propertyName
          ? `Your booking for ${propertyName} has been updated`
          : "Your booking has been updated"
      ),
    failed: (error?: string) =>
      showToast.bookingError("Booking Failed", error || "Please try again"),
    paymentRequired: (amount?: string) =>
      showToast.warning(
        "Payment Required",
        amount
          ? `Please complete payment of ${amount} to confirm your booking`
          : "Please complete payment to confirm your booking"
      ),
  };

  payment = {
    success: (title: string, description?: string) =>
      showToast.paymentSuccess(title, description),
    error: (title: string, description?: string) =>
      showToast.paymentError(title, description),
    completed: (amount?: string) =>
      showToast.paymentSuccess(
        "Payment Successful!",
        amount
          ? `Payment of ${amount} has been processed`
          : "Payment has been processed successfully"
      ),
    failed: (error?: string) =>
      showToast.paymentError(
        "Payment Failed",
        error || "Please try again with a different payment method"
      ),
    pending: () =>
      showToast.info("Payment Pending", "Your payment is being processed"),
    refunded: (amount?: string) =>
      showToast.paymentSuccess(
        "Refund Processed",
        amount
          ? `Refund of ${amount} has been processed`
          : "Your refund has been processed"
      ),
    declined: (reason?: string) =>
      showToast.paymentError(
        "Payment Declined",
        reason || "Your payment was declined. Please try a different method"
      ),
  };

  network = {
    error: (title: string, description?: string) =>
      showToast.networkError(title, description),
    offline: (title?: string, description?: string) =>
      showToast.offline(
        title || "Connection Lost",
        description || "Please check your internet connection"
      ),
    online: (title?: string, description?: string) =>
      showToast.online(
        title || "Connection Restored",
        description || "You are back online"
      ),
    slow: () =>
      showToast.warning(
        "Slow Connection",
        "Your connection seems slow. Some features may be limited"
      ),
    timeout: () =>
      showToast.networkError(
        "Request Timeout",
        "The request took too long. Please try again"
      ),
  };

  system = {
    success: (title: string, description?: string) =>
      this.show("success", { title, description }),
    error: (title: string, description?: string) =>
      this.show("error", { title, description }),
    warning: (title: string, description?: string) =>
      this.show("warning", { title, description }),
    info: (title: string, description?: string) =>
      this.show("info", { title, description }),
    maintenance: () =>
      showToast.warning(
        "System Maintenance",
        "We are performing maintenance. Some features may be temporarily unavailable"
      ),
    update: () =>
      showToast.info(
        "Update Available",
        "A new version is available. Please refresh the page"
      ),
    errorBoundary: (error?: string) =>
      showToast.error(
        "Something went wrong",
        error || "Please refresh the page or contact support"
      ),
  };

  user = {
    success: (title: string, description?: string) =>
      this.show("success", { title, description }),
    error: (title: string, description?: string) =>
      this.show("error", { title, description }),
    warning: (title: string, description?: string) =>
      this.show("warning", { title, description }),
    info: (title: string, description?: string) =>
      this.show("info", { title, description }),
    profileUpdated: () =>
      showToast.success(
        "Profile Updated",
        "Your profile has been successfully updated"
      ),
    profileError: (error?: string) =>
      showToast.error("Profile Update Failed", error || "Please try again"),
    preferencesSaved: () =>
      showToast.success(
        "Preferences Saved",
        "Your preferences have been saved"
      ),
    preferencesError: (error?: string) =>
      showToast.error(
        "Preferences Error",
        error || "Failed to save preferences"
      ),
  };

  property = {
    success: (title: string, description?: string) =>
      this.show("success", { title, description }),
    error: (title: string, description?: string) =>
      this.show("error", { title, description }),
    warning: (title: string, description?: string) =>
      this.show("warning", { title, description }),
    info: (title: string, description?: string) =>
      this.show("info", { title, description }),
    created: (propertyName?: string) =>
      showToast.success(
        "Property Listed!",
        propertyName
          ? `${propertyName} has been successfully listed`
          : "Your property has been successfully listed"
      ),
    updated: (propertyName?: string) =>
      showToast.success(
        "Property Updated",
        propertyName
          ? `${propertyName} has been updated`
          : "Your property has been updated"
      ),
    deleted: (propertyName?: string) =>
      showToast.success(
        "Property Removed",
        propertyName
          ? `${propertyName} has been removed`
          : "Your property has been removed"
      ),
    published: (propertyName?: string) =>
      showToast.success(
        "Property Published",
        propertyName
          ? `${propertyName} is now live and accepting bookings`
          : "Your property is now live and accepting bookings"
      ),
    unpublished: (propertyName?: string) =>
      showToast.warning(
        "Property Unpublished",
        propertyName
          ? `${propertyName} is no longer accepting bookings`
          : "Your property is no longer accepting bookings"
      ),
    saved: (propertyName?: string) =>
      showToast.success(
        "Property Saved",
        propertyName
          ? `${propertyName} has been added to your favorites`
          : "Property has been added to your favorites"
      ),
    unsaved: (propertyName?: string) =>
      showToast.info(
        "Property Removed",
        propertyName
          ? `${propertyName} has been removed from your favorites`
          : "Property has been removed from your favorites"
      ),
  };

  // Utility methods
  dismissAll() {
    toast.dismiss();
  }

  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  // Error handling with automatic categorization
  handleError(error: any, context?: string) {
    console.error("AlertingService Error:", error, context);

    let title = "An error occurred";
    let description = "Please try again";

    if (error?.message) {
      description = error.message;
    }

    if (error?.name === "NetworkError" || error?.code === "NETWORK_ERROR") {
      this.network.error(title, description);
    } else if (error?.name === "AuthError" || error?.code === "AUTH_ERROR") {
      this.auth.error(title, description);
    } else if (
      error?.name === "PaymentError" ||
      error?.code === "PAYMENT_ERROR"
    ) {
      this.payment.error(title, description);
    } else if (
      error?.name === "BookingError" ||
      error?.code === "BOOKING_ERROR"
    ) {
      this.booking.error(title, description);
    } else {
      this.system.error(title, description);
    }
  }

  // Success handling with automatic categorization
  handleSuccess(message: string, context?: string) {
    if (context?.includes("auth")) {
      this.auth.success("Success", message);
    } else if (context?.includes("booking")) {
      this.booking.success("Success", message);
    } else if (context?.includes("payment")) {
      this.payment.success("Success", message);
    } else if (context?.includes("property")) {
      this.property.success("Success", message);
    } else {
      this.system.success("Success", message);
    }
  }
}

// Create and export a singleton instance
export const alertingService = new AlertingService();

// Export the class for custom instances
export { AlertingService };

// Convenience exports for direct usage
export const { auth, booking, payment, network, system, user, property } =
  alertingService;
