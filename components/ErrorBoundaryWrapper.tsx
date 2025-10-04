"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-red-600">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-600 text-center">
                We encountered an unexpected error. Please try refreshing the
                page.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 justify-center">
                <Button onClick={this.handleReset} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component wrapper
export function withErrorBoundary<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponentWithErrorBoundary = (props: T) => {
    return (
      <ErrorBoundaryWrapper fallback={fallback} onError={onError}>
        <WrappedComponent {...props} />
      </ErrorBoundaryWrapper>
    );
  };

  WrappedComponentWithErrorBoundary.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WrappedComponentWithErrorBoundary;
}

export default ErrorBoundaryWrapper;
