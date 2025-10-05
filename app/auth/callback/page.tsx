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

        // Test Supabase connection first
        const connectionTest = await testSupabaseConnection();
        console.log("Connection test result:", connectionTest);

        // Check for error in URL (OAuth or email verification error)
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (error) {
          console.error("Auth callback error from URL:", error, errorDescription);
          router.push(`/auth?error=${encodeURIComponent(errorDescription || error)}`);
          return;
        }

        // Check for success message (email verification)
        const type = urlParams.get("type");
        if (type === "signup") {
          console.log("Email verification successful");
          // User verified email, try to get session
        }

        // Get the session (works for both OAuth and email verification)
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Auth callback session error:", sessionError);
          router.push("/auth?error=callback_failed");
          return;
        }

        if (data.session) {
          console.log("Session found, redirecting to home...");
          // Small delay to ensure auth state is propagated
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
      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
        router.push("/auth?error=unexpected_error");
      }
    };

    handleAuthCallback();
  }, [router, testSupabaseConnection]);

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
