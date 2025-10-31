"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { testSupabaseConnection } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Handling auth callback...");

        // Check for error in URL (OAuth or email verification error)
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");
        const errorCode = urlParams.get("error_code");

        if (error) {
          console.error(
            "Auth callback error from URL:",
            error,
            errorDescription,
            errorCode
          );

          // Map common errors to user-friendly messages
          let userMessage = errorDescription || error;

          switch (error) {
            case "access_denied":
              userMessage = "You cancelled the sign-in process. Please try again.";
              break;
            case "server_error":
              userMessage = "A server error occurred. Please try again later.";
              break;
            case "temporarily_unavailable":
              userMessage = "The authentication service is temporarily unavailable. Please try again in a few moments.";
              break;
            case "invalid_request":
              userMessage = "Invalid authentication request. Please contact support if this persists.";
              break;
            case "unauthorized_client":
              userMessage = "OAuth configuration error. Please contact support.";
              break;
            case "invalid_grant":
              userMessage = "Authentication expired. Please try signing in again.";
              break;
            default:
              if (errorDescription?.includes("Email link is invalid")) {
                userMessage = "This email verification link has expired or already been used. Please request a new one.";
              } else if (errorDescription?.includes("not authorized")) {
                userMessage = "You don't have permission to access this application.";
              }
          }

          router.push(
            `/auth?error=${encodeURIComponent(userMessage)}`
          );
          return;
        }

        // Check for success message (email verification)
        const type = urlParams.get("type");
        const accessToken = urlParams.get("access_token");
        const refreshToken = urlParams.get("refresh_token");

        console.log("Callback params:", {
          type,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });

        // If we have tokens in URL (from email verification), set the session
        if (accessToken && refreshToken) {
          console.log("Setting session from URL tokens...");
          const { data, error: setSessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          if (setSessionError) {
            console.error(
              "Error setting session from tokens:",
              setSessionError
            );
            router.push("/auth?error=session_set_failed");
            return;
          }

          if (data.session) {
            console.log("Session set successfully, redirecting to home...");
            // Wait for auth state to propagate
            setTimeout(() => {
              router.push("/");
            }, 1000);
            return;
          }
        }

        // Fallback: Try to get existing session
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Auth callback session error:", sessionError);

          let errorMessage = "Authentication failed. Please try signing in again.";

          if (sessionError.message?.includes("refresh_token_not_found")) {
            errorMessage = "Your session has expired. Please sign in again.";
          } else if (sessionError.message?.includes("invalid_grant")) {
            errorMessage = "Authentication link is invalid or expired. Please request a new one.";
          }

          router.push(`/auth?error=${encodeURIComponent(errorMessage)}`);
          return;
        }

        if (data.session) {
          console.log("Existing session found, redirecting to home...");
          setTimeout(() => {
            router.push("/");
          }, 500);
        } else {
          console.log("No session found after callback");
          // If email was just verified but no session, show success message
          if (type === "signup") {
            router.push("/auth?verified=true");
          } else {
            router.push("/auth");
          }
        }
      } catch (error: any) {
        console.error("Unexpected error in auth callback:", error);

        let errorMessage = "An unexpected error occurred during authentication.";

        if (error?.message) {
          if (error.message.includes("network")) {
            errorMessage = "Network error. Please check your connection and try again.";
          } else if (error.message.includes("fetch")) {
            errorMessage = "Unable to connect to authentication service. Please try again.";
          }
        }

        router.push(`/auth?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="bg-white rounded-lg p-8 shadow-sm border max-w-md mx-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Completing sign in...
          </h2>
          <p className="text-gray-600 mb-4">
            Please wait while we complete your authentication.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
