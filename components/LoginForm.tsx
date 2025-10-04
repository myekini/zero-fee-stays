"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  CheckCircle,
  XCircle,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

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

  // Password strength validation
  const validatePasswordStrength = (password: string) => {
    const validation = AuthUtils.validatePassword(password);
    setPasswordErrors(validation.errors);

    const requirements = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    const strength =
      (requirements.filter(Boolean).length / requirements.length) * 100;
    setPasswordStrength(strength);

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
          variant: "default",
        });
        setTimeout(() => {
          router.push("/");
        }, 1000);
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
          description: "Welcome to HiddyStays!",
          variant: "default",
        });

        setSignUpData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setPasswordStrength(0);
        setPasswordErrors([]);

        setTimeout(() => {
          router.push("/");
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

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to <span className="text-blue-600">HiddyStays</span>
        </h1>
        <p className="text-gray-600 font-medium">
          Sign in to your account or create a new one
        </p>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
          <TabsTrigger
            value="signin"
            className="rounded-md font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="rounded-md font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>

        {/* Sign In Tab */}
        <TabsContent value="signin" className="space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signInData.email}
                  onChange={(e) =>
                    setSignInData({ ...signInData, email: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={signInData.password}
                  onChange={(e) =>
                    setSignInData({ ...signInData, password: e.target.value })
                  }
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </TabsContent>

        {/* Sign Up Tab */}
        <TabsContent value="signup" className="space-y-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signup-firstname">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-firstname"
                    type="text"
                    placeholder="First name"
                    value={signUpData.firstName}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        firstName: e.target.value,
                      })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-lastname">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-lastname"
                    type="text"
                    placeholder="Last name"
                    value={signUpData.lastName}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, lastName: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signUpData.email}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, email: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={signUpData.password}
                  onChange={(e) => {
                    setSignUpData({ ...signUpData, password: e.target.value });
                    validatePasswordStrength(e.target.value);
                  }}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {signUpData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Password strength
                    </span>
                    <span
                      className={`font-medium ${
                        passwordStrength < 40
                          ? "text-red-600"
                          : passwordStrength < 70
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {passwordStrength < 40
                        ? "Weak"
                        : passwordStrength < 70
                          ? "Medium"
                          : "Strong"}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2" />

                  {/* Password Requirements */}
                  <div className="space-y-1 text-xs">
                    <div
                      className={`flex items-center space-x-2 ${
                        signUpData.password.length >= 8
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {signUpData.password.length >= 8 ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${
                        /[A-Z]/.test(signUpData.password)
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {/[A-Z]/.test(signUpData.password) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>One uppercase letter</span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${
                        /[a-z]/.test(signUpData.password)
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {/[a-z]/.test(signUpData.password) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>One lowercase letter</span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${
                        /[0-9]/.test(signUpData.password)
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {/[0-9]/.test(signUpData.password) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>One number</span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${
                        /[^A-Za-z0-9]/.test(signUpData.password)
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {/[^A-Za-z0-9]/.test(signUpData.password) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={signUpData.confirmPassword}
                  onChange={(e) =>
                    setSignUpData({
                      ...signUpData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={isLoading || passwordErrors.length > 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 py-1 text-gray-500 font-medium tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
      </div>
    </div>
  );
}
