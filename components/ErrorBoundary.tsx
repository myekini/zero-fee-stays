"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            reset={() => this.setState({ hasError: false, error: undefined })}
          />
        );
      }

      // Check if it's a chunk loading error
      const isChunkError =
        this.state.error?.message?.includes("Loading chunk") ||
        this.state.error?.message?.includes("ChunkLoadError") ||
        this.state.error?.name === "ChunkLoadError";

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="p-8 max-w-md w-full text-center">
            {isChunkError ? (
              <>
                <WifiOff className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Connection Issue
                </h3>
                <p className="text-gray-600 mb-6">
                  There was a problem loading the application. This usually
                  happens due to network issues or cached files.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      // Clear cache and reload
                      if ("caches" in window) {
                        caches.keys().then((names) => {
                          names.forEach((name) => {
                            caches.delete(name);
                          });
                        });
                      }
                      window.location.reload();
                    }}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Cache & Reload
                  </Button>
                  <Button
                    onClick={() =>
                      this.setState({ hasError: false, error: undefined })
                    }
                    variant="outline"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-gray-600 mb-6">
                  We encountered an error while loading this component.
                </p>
                <Button
                  onClick={() =>
                    this.setState({ hasError: false, error: undefined })
                  }
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
