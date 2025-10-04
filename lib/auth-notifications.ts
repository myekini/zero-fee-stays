import { toast } from "@/hooks/use-toast";

/**
 * Standardized notification system for authentication flows
 * Provides consistent messaging and styling across all auth operations
 */

export interface AuthNotification {
  title: string;
  description: string;
  variant: "success" | "destructive" | "warning" | "info";
  duration?: number;
}

export class AuthNotifications {
  // Success notifications
  static signUpSuccess = (email: string): AuthNotification => ({
    title: "Welcome to HiddyStays! 🎉",
    description: `We've sent a verification email to ${email}. Please check your inbox and click the verification link to complete your registration.`,
    variant: "success",
    duration: 8000,
  });

  static signInSuccess = (name?: string): AuthNotification => ({
    title: "Welcome back! 👋",
    description: name
      ? `Signed in as ${name}`
      : "You've been signed in successfully.",
    variant: "success",
    duration: 4000,
  });

  static signOutSuccess = (): AuthNotification => ({
    title: "See you soon! 👋",
    description: "You've been signed out successfully.",
    variant: "success",
    duration: 3000,
  });

  static passwordResetEmailSent = (email: string): AuthNotification => ({
    title: "Reset email sent! 📧",
    description: `We've sent password reset instructions to ${email}. Please check your inbox and follow the link to reset your password.`,
    variant: "success",
    duration: 6000,
  });

  static passwordUpdated = (): AuthNotification => ({
    title: "Password updated! ✅",
    description:
      "Your password has been successfully updated. Redirecting to sign in...",
    variant: "success",
    duration: 4000,
  });

  static profileUpdated = (): AuthNotification => ({
    title: "Profile updated! ✨",
    description: "Your profile has been successfully updated.",
    variant: "success",
    duration: 3000,
  });

  static emailVerified = (): AuthNotification => ({
    title: "Email verified! ✅",
    description:
      "Your email has been successfully verified. You can now access all features.",
    variant: "success",
    duration: 4000,
  });

  // Error notifications
  static signUpError = (error: string): AuthNotification => ({
    title: "Sign up failed",
    description:
      error || "Something went wrong during sign up. Please try again.",
    variant: "destructive",
    duration: 5000,
  });

  static signInError = (error: string): AuthNotification => ({
    title: "Sign in failed",
    description:
      error ||
      "Invalid email or password. Please check your credentials and try again.",
    variant: "destructive",
    duration: 5000,
  });

  static passwordResetError = (error: string): AuthNotification => ({
    title: "Reset failed",
    description: error || "Failed to send reset email. Please try again.",
    variant: "destructive",
    duration: 5000,
  });

  static passwordUpdateError = (error: string): AuthNotification => ({
    title: "Password update failed",
    description: error || "Failed to update password. Please try again.",
    variant: "destructive",
    duration: 5000,
  });

  static profileUpdateError = (error: string): AuthNotification => ({
    title: "Profile update failed",
    description: error || "Failed to update profile. Please try again.",
    variant: "destructive",
    duration: 5000,
  });

  static invalidResetLink = (): AuthNotification => ({
    title: "Invalid reset link",
    description:
      "This password reset link is invalid or has expired. Please request a new one.",
    variant: "destructive",
    duration: 5000,
  });

  static passwordMismatch = (): AuthNotification => ({
    title: "Passwords don't match",
    description: "Please make sure both passwords are the same.",
    variant: "destructive",
    duration: 4000,
  });

  static passwordRequirementsNotMet = (errors: string[]): AuthNotification => ({
    title: "Password requirements not met",
    description: errors.join(", "),
    variant: "destructive",
    duration: 6000,
  });

  static invalidEmail = (): AuthNotification => ({
    title: "Invalid email",
    description: "Please enter a valid email address.",
    variant: "destructive",
    duration: 4000,
  });

  static networkError = (): AuthNotification => ({
    title: "Connection error",
    description: "Please check your internet connection and try again.",
    variant: "destructive",
    duration: 5000,
  });

  // Warning notifications
  static rateLimitExceeded = (): AuthNotification => ({
    title: "Too many attempts",
    description:
      "You've made too many attempts. Please wait a few minutes before trying again.",
    variant: "warning",
    duration: 6000,
  });

  static sessionExpired = (): AuthNotification => ({
    title: "Session expired",
    description: "Your session has expired. Please sign in again.",
    variant: "warning",
    duration: 5000,
  });

  // Info notifications
  static loading = (action: string): AuthNotification => ({
    title: "Please wait",
    description: `${action}...`,
    variant: "info",
    duration: 2000,
  });

  static emailNotVerified = (): AuthNotification => ({
    title: "Email not verified",
    description:
      "Please check your email and click the verification link to complete your registration.",
    variant: "info",
    duration: 6000,
  });

  // Helper method to show notifications
  static show(notification: AuthNotification): void {
    toast({
      title: notification.title,
      description: notification.description,
      variant: notification.variant,
      duration: notification.duration,
    });
  }

  // Convenience methods for common auth actions
  static showSignUpSuccess(email: string): void {
    this.show(this.signUpSuccess(email));
  }

  static showSignInSuccess(name?: string): void {
    this.show(this.signInSuccess(name));
  }

  static showSignOutSuccess(): void {
    this.show(this.signOutSuccess());
  }

  static showPasswordResetEmailSent(email: string): void {
    this.show(this.passwordResetEmailSent(email));
  }

  static showPasswordUpdated(): void {
    this.show(this.passwordUpdated());
  }

  static showProfileUpdated(): void {
    this.show(this.profileUpdated());
  }

  static showSignUpError(error: string): void {
    this.show(this.signUpError(error));
  }

  static showSignInError(error: string): void {
    this.show(this.signInError(error));
  }

  static showPasswordResetError(error: string): void {
    this.show(this.passwordResetError(error));
  }

  static showPasswordUpdateError(error: string): void {
    this.show(this.passwordUpdateError(error));
  }

  static showProfileUpdateError(error: string): void {
    this.show(this.profileUpdateError(error));
  }

  static showInvalidResetLink(): void {
    this.show(this.invalidResetLink());
  }

  static showPasswordMismatch(): void {
    this.show(this.passwordMismatch());
  }

  static showPasswordRequirementsNotMet(errors: string[]): void {
    this.show(this.passwordRequirementsNotMet(errors));
  }

  static showInvalidEmail(): void {
    this.show(this.invalidEmail());
  }

  static showNetworkError(): void {
    this.show(this.networkError());
  }

  static showRateLimitExceeded(): void {
    this.show(this.rateLimitExceeded());
  }

  static showSessionExpired(): void {
    this.show(this.sessionExpired());
  }

  static showLoading(action: string): void {
    this.show(this.loading(action));
  }

  static showEmailNotVerified(): void {
    this.show(this.emailNotVerified());
  }
}

export default AuthNotifications;

