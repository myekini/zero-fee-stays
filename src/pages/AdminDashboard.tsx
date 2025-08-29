import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Star,
  PlusCircle,
  Users,
  Building,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import PlatformAnalytics from "@/components/PlatformAnalytics";
import AdminUserManagement from "@/components/AdminUserManagement";
import AdminPropertyManagement from "@/components/AdminPropertyManagement";
import AdminBookingManagement from "@/components/AdminBookingManagement";

interface DashboardStats {
  totalEarnings: number;
  activeBookings: number;
  totalBookings: number;
  totalProperties: number;
  averageRating: number;
  occupancyRate: number;
}

const AdminDashboard: React.FC = () => {
  const { authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    activeBookings: 0,
    totalBookings: 0,
    totalProperties: 0,
    averageRating: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  if (!authUser || authUser.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for demo
      setStats({
        totalEarnings: 15750.0,
        activeBookings: 8,
        totalBookings: 145,
        totalProperties: 12,
        averageRating: 4.7,
        occupancyRate: 82,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive platform administration and management
              </p>
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Earnings
                      </p>
                      <p className="text-2xl font-bold">
                        ${stats.totalEarnings.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        +15% from last month
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Properties
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.totalProperties}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {stats.activeBookings} currently booked
                      </p>
                    </div>
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Bookings
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.totalBookings}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {stats.occupancyRate}% occupancy rate
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Average Rating
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.averageRating}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        From guest reviews
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage platform operations and users
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <Button
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab("users")}
                >
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab("properties")}
                >
                  <Building className="h-6 w-6" />
                  <span>Manage Properties</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab("bookings")}
                >
                  <Calendar className="h-6 w-6" />
                  <span>Manage Bookings</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>View Analytics</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="properties">
            <AdminPropertyManagement />
          </TabsContent>

          <TabsContent value="bookings">
            <AdminBookingManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <PlatformAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>
                  Configure platform settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Settings Coming Soon
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Platform configuration options will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
