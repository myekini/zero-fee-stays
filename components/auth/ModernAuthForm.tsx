"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AuthUtils from "@/lib/auth";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface ModernAuthFormProps {
  mode?: "signin" | "signup";
}

export function ModernAuthForm({ mode = "signin" }: ModernAuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [authMode, setAuthMode] = useState<"signin" | "signup">(mode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sign In Form
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  // Sign Up Form
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Password validation for signup
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePasswordStrength = (password: string) => {
    const validation = AuthUtils.validatePassword(password);
    setPasswordErrors(validation.errors);
    return validation.isValid;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(signInData.email, signInData.password);
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePasswordStrength(signUpData.password)) {
      toast({
        title: "Weak password",
        description: "Please meet all password requirements.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(
        signUpData.email,
        signUpData.password,
        signUpData.firstName,
        signUpData.lastName
      );
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description:
            "Please check your email to verify your account before signing in.",
          duration: 6000,
        });

        // Clear form
        setSignUpData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setPasswordErrors([]);

        // Switch to sign in mode after a delay
        setTimeout(() => {
          setAuthMode("signin");
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
      // Keep loading state until redirect
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Password requirement checker for signup
  const getPasswordRequirements = () => {
    const password = signUpData.password;
    return [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "One uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "One lowercase letter",
        met: /[a-z]/.test(password),
      },
      {
        label: "One number",
        met: /[0-9]/.test(password),
      },
      {
        label: "One special character",
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];
  };

  if (authMode === "signin") {
    return (
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={signInData.email}
                onChange={(e) =>
                  setSignInData({ ...signInData, email: e.target.value })
                }
                className="pl-11 h-12 text-base"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={signInData.password}
                onChange={(e) =>
                  setSignInData({ ...signInData, password: e.target.value })
                }
                className="pl-11 pr-11 h-12 text-base"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="btn-primary-modern w-full h-12 text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-12 font-medium text-base"
        >
          <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </Button>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
            disabled={isLoading}
          >
            Sign up
          </button>
        </div>
      </div>
    );
  }

  // Sign Up Mode
  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Get started with your free account today.
        </p>
      </div>

      {/* Sign Up Form */}
      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
              First Name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={signUpData.firstName}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, firstName: e.target.value })
                }
                className="pl-11 h-12 text-base"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
              Last Name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={signUpData.lastName}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, lastName: e.target.value })
                }
                className="pl-11 h-12 text-base"
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="signup-email"
              type="email"
              placeholder="your@email.com"
              value={signUpData.email}
              onChange={(e) =>
                setSignUpData({ ...signUpData, email: e.target.value })
              }
              className="pl-11 h-12 text-base"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={signUpData.password}
              onChange={(e) => {
                setSignUpData({ ...signUpData, password: e.target.value });
                validatePasswordStrength(e.target.value);
              }}
              className="pl-11 pr-11 h-12 text-base"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          {signUpData.password && (
            <div className="mt-3 space-y-2">
              {getPasswordRequirements().map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 text-xs ${
                    req.met ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {req.met ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirm-password"
            className="text-sm font-medium text-foreground"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={signUpData.confirmPassword}
              onChange={(e) =>
                setSignUpData({
                  ...signUpData,
                  confirmPassword: e.target.value,
                })
              }
              className="pl-11 pr-11 h-12 text-base"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="btn-primary-modern w-full h-12 text-base"
          disabled={isLoading || passwordErrors.length > 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full h-12 font-medium text-base"
      >
        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign up with Google
      </Button>

      {/* Sign In Link */}
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setAuthMode("signin")}
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
          disabled={isLoading}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
