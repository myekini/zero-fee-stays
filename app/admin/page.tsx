"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import {
  Users,
  Home,
  DollarSign,
  Calendar,
  TrendingUp,
  Shield,
  Mail,
  Settings,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    users: { total: 0, verified: 0, byRole: { user: 0, host: 0, admin: 0 } },
    properties: { total: 0, active: 0, inactive: 0 },
    bookings: { total: 0, byStatus: { pending: 0, confirmed: 0, cancelled: 0 } },
    revenue: { total: 0, thisMonth: 0 },
  });

  // Fetch admin stats from API
  const fetchAdminStats = async () => {
    try {
      // Get the session token from Supabase
      const { supabase } = await import("@/lib/supabase");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        console.error("No auth token available");
        return;
      }

      const response = await fetch("/api/admin/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        console.log("✅ Admin stats loaded:", data);
      } else {
        console.error("❌ Failed to fetch admin stats:", response.statusText);
      }
    } catch (error) {
      console.error("❌ Error fetching admin stats:", error);
    }
  };

  useEffect(() => {
    // Check if user has admin permission
    const checkPermission = async () => {
      if (!user) {
        router.push("/auth");
        return;
      }

      const isAdmin = await hasPermission("admin");
      if (!isAdmin) {
        router.push("/");
        return;
      }

      setLoading(false);
      // Fetch stats after permission check
      fetchAdminStats();
    };

    checkPermission();
  }, [user, router, hasPermission]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Platform management and analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <Badge>Total</Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {stats.users?.total || 0}
            </h3>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Verified: {stats.users?.verified || 0} | Hosts: {stats.users?.byRole?.host || 0}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Home className="w-8 h-8 text-green-600" />
              <Badge variant="secondary">Active</Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {stats.properties?.active || 0}
            </h3>
            <p className="text-sm text-muted-foreground">Active Properties</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Total: {stats.properties?.total || 0} | Inactive: {stats.properties?.inactive || 0}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
              <Badge variant="outline">All Time</Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {stats.bookings?.total || 0}
            </h3>
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Confirmed: {stats.bookings?.byStatus?.confirmed || 0} | Pending: {stats.bookings?.byStatus?.pending || 0}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-orange-600" />
              <Badge variant="destructive">Revenue</Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              ${(stats.revenue?.total || 0).toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <div className="mt-2 text-xs text-muted-foreground">
              This Month: ${(stats.revenue?.thisMonth || 0).toLocaleString()}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">User Management</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Manage users, roles, and permissions
            </p>
            <Button variant="outline" className="w-full">
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Home className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Property Management</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Review and manage property listings
            </p>
            <Button variant="outline" className="w-full">
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Booking Management</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage all bookings
            </p>
            <Button variant="outline" className="w-full">
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Analytics</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              View platform analytics and insights
            </p>
            <Button variant="outline" className="w-full">
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Email System</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Manage email templates and campaigns
            </p>
            <Button variant="outline" className="w-full">
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Platform Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Configure platform settings and fees
            </p>
            <Button variant="outline" className="w-full">
              Coming Soon
            </Button>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="p-6 mt-8 bg-muted">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Admin Features Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground">
              Full admin management features are currently in development. Basic admin
              access control is already in place.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
