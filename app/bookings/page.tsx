"use client";

import { UserBookingDashboard } from "@/components/UserBookingDashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <ErrorBoundary>
              <UserBookingDashboard />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}