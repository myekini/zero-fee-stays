import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import AuthUtils, { AuthUser } from "@/lib/auth";
import SessionManager from "@/lib/session";

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
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error: any }>;
  hasPermission: (requiredRole: "user" | "host" | "admin") => boolean;
  refreshSession: () => Promise<void>;
  testSupabaseConnection: () => Promise<{ success: boolean; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          toast({
            title: "Welcome back!",
            description: `Signed in as ${validatedUser?.firstName || validatedUser?.email}`,
          });
        }
      } else {
        console.log("No session or user, clearing auth state");
        setAuthUser(null);
        SessionManager.clearSession();
        if (event === "SIGNED_OUT") {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
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

    // Determine role based on email
    let userRole = "user";
    if (email.toLowerCase() === "myekini1@gmail.com") {
      userRole = "admin";
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: userRole, // Set role based on email
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
        title: "Check your email",
        description:
          "We've sent you a confirmation link to complete your registration.",
      });
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
    await supabase.auth.signOut();
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

  const resetPassword = async (email: string) => {
    if (!AuthUtils.isValidEmail(email)) {
      return { error: { message: "Please enter a valid email address." } };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions.",
      });
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
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
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
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    }

    return { error };
  };

  const hasPermission = (requiredRole: "user" | "host" | "admin"): boolean => {
    if (!authUser) return false;
    return AuthUtils.hasPermission(authUser, requiredRole);
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
    resetPassword,
    updatePassword,
    updateProfile,
    hasPermission,
    refreshSession,
    testSupabaseConnection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
