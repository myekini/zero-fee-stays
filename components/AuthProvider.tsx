"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthUtils, { AuthUser } from "@/lib/auth";
import SessionManager from "@/lib/session";
import AuthNotifications from "@/lib/auth-notifications";

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithGitHub: () => Promise<{ error: any }>;
  signInWithTwitter: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error: any }>;
  hasPermission: (requiredRole: "user" | "host" | "admin") => Promise<boolean>;
  refreshSession: () => Promise<void>;
  testSupabaseConnection: () => Promise<{ success: boolean; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Rate limiting for authentication attempts
  const authRateLimiter = AuthUtils.createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      console.log("Session details:", {
        event,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        userId: session?.user?.id,
        sessionExpiry: session?.expires_at,
      });

      setSession(session);
      setUser(session?.user ?? null);

      // Convert to AuthUser and validate session
      if (session?.user) {
        const validatedUser = AuthUtils.validateSession(session);
        console.log("Validated user:", validatedUser);
        setAuthUser(validatedUser);

        // Store session data
        SessionManager.storeSession(session);

        if (event === "SIGNED_IN") {
          AuthNotifications.showSignInSuccess(
            validatedUser?.firstName || validatedUser?.email
          );
        }
      } else {
        console.log("No session or user, clearing auth state");
        setAuthUser(null);
        SessionManager.clearSession();
        if (event === "SIGNED_OUT") {
          AuthNotifications.showSignOutSuccess();
        }
      }

      setLoading(false);
    });

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();
        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          const validatedUser = AuthUtils.validateSession(existingSession);
          setAuthUser(validatedUser);
          SessionManager.storeSession(existingSession);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    // Rate limiting check
    if (!authRateLimiter(email)) {
      return {
        error: {
          message: "Too many signup attempts. Please try again later.",
        },
      };
    }

    // Validate email and password
    if (!AuthUtils.isValidEmail(email)) {
      return { error: { message: "Please enter a valid email address." } };
    }

    const passwordValidation = AuthUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        error: {
          message:
            "Password requirements not met: " +
            passwordValidation.errors.join(", "),
        },
      };
    }

    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: "user", // Default role, can be updated by admin later
        },
      },
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "📧 Verification Email Sent!",
        description:
          "We've sent you a confirmation link to complete your registration. Please check your email inbox and spam folder.",
        variant: "success",
        duration: 6000,
      });

      // Send welcome email asynchronously (don't block on it)
      if (firstName) {
        import("@/lib/emailNotificationService").then((service) => {
          service
            .sendWelcomeEmail({
              email,
              firstName,
              lastName,
            })
            .then(() => {
              console.log("✅ Welcome email sent successfully");
            })
            .catch((err) => {
              console.error("❌ Failed to send welcome email:", err);
              // Don't show error to user - this is non-critical
            });
        });
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Rate limiting check
    if (!authRateLimiter(email)) {
      return {
        error: {
          message: "Too many signin attempts. Please try again later.",
        },
      };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear all auth state
      setUser(null);
      setAuthUser(null);
      setSession(null);
      SessionManager.clearSession();

      // Show success message
      toast({
        title: "Signed Out Successfully",
        description: "You have been signed out. Redirecting to sign up page...",
        variant: "default",
      });

      // Redirect to auth page after a short delay
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Error",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const testSupabaseConnection = async () => {
    console.log("Testing Supabase connection...");
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log("Supabase connection test:", { data, error });

      return { success: !error, error };
    } catch (err) {
      console.error("Supabase connection test failed:", err);
      return { success: false, error: err };
    }
  };

  const signInWithGoogle = async () => {
    console.log("Starting Google OAuth sign-in...");
    console.log("Current origin:", window.location.origin);
    console.log("Current URL:", window.location.href);
    console.log("Redirect URL:", `${window.location.origin}/auth/callback`);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google OAuth error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack,
        });
        toast({
          title: "Google sign in failed",
          description: `Error: ${error.message}. Status: ${error.status}. Please check Supabase dashboard settings.`,
          variant: "destructive",
        });
      } else {
        console.log("Google OAuth initiated successfully", data);
        if (data?.url) {
          console.log("OAuth URL:", data.url);
        }
      }

      return { error };
    } catch (catchError) {
      console.error("Unexpected error in Google OAuth:", catchError);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred during Google sign-in.",
        variant: "destructive",
      });
      return { error: catchError };
    }
  };

  const signInWithGitHub = async () => {
    console.log("Starting GitHub OAuth sign-in...");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("GitHub OAuth error details:", error);
        toast({
          title: "GitHub sign in failed",
          description: `Error: ${error.message}. Please check Supabase dashboard settings.`,
          variant: "destructive",
        });
      } else {
        console.log("GitHub OAuth initiated successfully", data);
      }

      return { error };
    } catch (catchError) {
      console.error("Unexpected error in GitHub OAuth:", catchError);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred during GitHub sign-in.",
        variant: "destructive",
      });
      return { error: catchError };
    }
  };

  const signInWithTwitter = async () => {
    console.log("Starting Twitter OAuth sign-in...");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Twitter OAuth error details:", error);
        toast({
          title: "Twitter sign in failed",
          description: `Error: ${error.message}. Please check Supabase dashboard settings.`,
          variant: "destructive",
        });
      } else {
        console.log("Twitter OAuth initiated successfully", data);
      }

      return { error };
    } catch (catchError) {
      console.error("Unexpected error in Twitter OAuth:", catchError);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred during Twitter sign-in.",
        variant: "destructive",
      });
      return { error: catchError };
    }
  };

  const signInWithApple = async () => {
    console.log("Starting Apple OAuth sign-in...");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Apple OAuth error details:", error);
        toast({
          title: "Apple sign in failed",
          description: `Error: ${error.message}. Please check Supabase dashboard settings.`,
          variant: "destructive",
        });
      } else {
        console.log("Apple OAuth initiated successfully", data);
      }

      return { error };
    } catch (catchError) {
      console.error("Unexpected error in Apple OAuth:", catchError);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred during Apple sign-in.",
        variant: "destructive",
      });
      return { error: catchError };
    }
  };

  const resetPassword = async (email: string) => {
    if (!AuthUtils.isValidEmail(email)) {
      return { error: { message: "Please enter a valid email address." } };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      AuthNotifications.showPasswordResetError(error.message);
    } else {
      AuthNotifications.showPasswordResetEmailSent(email);
    }

    return { error };
  };

  const updatePassword = async (password: string) => {
    const passwordValidation = AuthUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        error: {
          message:
            "Password requirements not met: " +
            passwordValidation.errors.join(", "),
        },
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      AuthNotifications.showPasswordUpdateError(error.message);
    } else {
      AuthNotifications.showPasswordUpdated();
    }

    return { error };
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: updates.firstName,
        last_name: updates.lastName,
        role: updates.role,
      },
    });

    if (error) {
      AuthNotifications.showProfileUpdateError(error.message);
    } else {
      AuthNotifications.showProfileUpdated();
    }

    return { error };
  };

  const hasPermission = async (requiredRole: "user" | "host" | "admin"): Promise<boolean> => {
    if (!user) return false;

    try {
      // Fetch role from database instead of relying on JWT metadata
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error || !profile) {
        console.error("Error fetching user role:", error);
        return false;
      }

      // Type guard to ensure profile has role property
      const userRole = (profile as any)?.role as "user" | "host" | "admin" | undefined;

      if (!userRole || !["user", "host", "admin"].includes(userRole)) {
        console.error("Invalid user role:", userRole);
        return false;
      }

      // Role hierarchy: admin > host > user
      const roleHierarchy: Record<string, number> = {
        user: 1,
        host: 2,
        admin: 3,
      };

      // TypeScript assertion: userRole is guaranteed to be valid at this point
      const userRoleValue = roleHierarchy[userRole as "user" | "host" | "admin"]!;
      const requiredRoleValue = roleHierarchy[requiredRole]!;

      return userRoleValue >= requiredRoleValue;
    } catch (error) {
      console.error("Error in hasPermission:", error);
      return false;
    }
  };

  const refreshSession = async () => {
    try {
      const {
        data: { session: newSession },
        error,
      } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Error refreshing session:", error);
        return;
      }

      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        const validatedUser = AuthUtils.validateSession(newSession);
        setAuthUser(validatedUser);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  const value = {
    user,
    authUser,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    signInWithTwitter,
    signInWithApple,
    resetPassword,
    updatePassword,
    updateProfile,
    hasPermission,
    refreshSession,
    testSupabaseConnection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
