import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  MailCheck,
  Shield,
} from "lucide-react";
import Header from "@/components/Header";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authUser, hasPermission } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setStatus("loading");
      setMessage("Verifying your account...");

      // Get the session from the URL
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (data.session) {
        // Check if this is an email confirmation
        const accessToken = data.session.access_token;
        const refreshToken = data.session.refresh_token;

        if (accessToken && refreshToken) {
          // Set the session
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            throw setSessionError;
          }

          // Check if user is verified
          if (data.session.user.email_confirmed_at) {
            setStatus("success");
            setMessage("Email verified successfully! Welcome to HiddyStays.");

            // Show success toast
            toast({
              title: "Welcome to HiddyStays!",
              description: "Your account has been verified successfully.",
            });

            // Redirect based on user role
            setTimeout(() => {
              if (hasPermission("admin")) {
                navigate("/admin", { replace: true });
              } else {
                navigate("/profile", { replace: true });
              }
            }, 2000);
          } else {
            setStatus("error");
            setMessage("Email verification failed. Please try again.");
          }
        } else {
          setStatus("error");
          setMessage("Invalid verification link. Please try again.");
        }
      } else {
        setStatus("error");
        setMessage("No session found. Please try signing up again.");
      }
    } catch (error) {
      console.error("Auth callback error:", error);
      setStatus("error");
      setMessage("An error occurred during verification. Please try again.");
    }
  };

  const handleRetry = () => {
    navigate("/auth", { replace: true });
  };

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            {status === "loading" && (
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
              </div>
            )}
            {status === "success" && (
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
            {status === "error" && (
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-full">
                  <AlertCircle className="w-12 h-12 text-white" />
                </div>
              </div>
            )}

            <CardTitle className="text-2xl font-bold text-gray-900">
              {status === "loading" && "Verifying Your Account"}
              {status === "success" && "Verification Successful!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === "success" && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What's Next:
                  </h3>
                  <ol className="text-sm text-gray-600 space-y-2 text-left">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full text-xs mr-2 mt-0.5">
                        1
                      </span>
                      Complete your profile setup
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full text-xs mr-2 mt-0.5">
                        2
                      </span>
                      Browse available properties
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full text-xs mr-2 mt-0.5">
                        3
                      </span>
                      Start booking your stays
                    </li>
                  </ol>
                </div>

                {hasPermission("admin") && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        Admin Access
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      You have admin privileges. You'll be redirected to the
                      admin dashboard.
                    </p>
                  </div>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Troubleshooting:
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs mr-2 mt-0.5">
                        •
                      </span>
                      Check if the verification link is still valid
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs mr-2 mt-0.5">
                        •
                      </span>
                      Try signing up again with a new email
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs mr-2 mt-0.5">
                        •
                      </span>
                      Contact support if the issue persists
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              {status === "success" && (
                <Button
                  onClick={handleGoHome}
                  className="w-full h-12 bg-gradient-to-r from-hiddy-sage to-hiddy-terracotta hover:from-sage-700 hover:to-terracotta-700"
                >
                  Continue to Home
                </Button>
              )}

              {status === "error" && (
                <>
                  <Button
                    onClick={handleRetry}
                    className="w-full h-12 bg-gradient-to-r from-hiddy-sage to-hiddy-terracotta hover:from-sage-700 hover:to-terracotta-700"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGoHome}
                    className="w-full h-12"
                  >
                    Go to Home
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthCallback;
