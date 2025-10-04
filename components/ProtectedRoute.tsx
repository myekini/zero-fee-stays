"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "user" | "host" | "admin";
  fallbackPath?: string;
}

const ProtectedRoute = ({
  children,
  requiredRole = "user",
  fallbackPath = "/auth",
}: ProtectedRouteProps) => {
  const { authUser, loading } = useAuth();
  const router = useRouter();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!authUser) {
    router.push(fallbackPath);
    return null;
  }

  // Check role-based access
  if (requiredRole !== "user") {
    const roleHierarchy = {
      user: 1,
      host: 2,
      admin: 3,
    };

    if (roleHierarchy[authUser.role] < roleHierarchy[requiredRole]) {
      // User doesn't have required role, redirect to appropriate dashboard
      let redirectPath = "/profile";

      if (authUser.role === "admin") {
        redirectPath = "/admin";
      } else if (authUser.role === "host") {
        redirectPath = "/host-dashboard";
      }

      router.push(redirectPath);
      return null;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

export default ProtectedRoute;
export { ProtectedRoute };
