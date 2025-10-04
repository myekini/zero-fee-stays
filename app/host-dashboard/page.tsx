"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  Plus,
  Home,
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Eye,
  Edit,
  MoreHorizontal,
  MapPin,
  Bed,
  Bath,
  Clock,
  MessageSquare,
  Settings,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PropertyForm } from "@/components/PropertyForm";
import { CalendarManagement } from "@/components/CalendarManagement";
import { BookingManagement } from "@/components/BookingManagement";
import { supabase } from "@/integrations/supabase/client";

interface Property {
  id: string;
  title: string;
  address: string;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  is_active: boolean;
  rating: number;
  review_count: number;
  booking_count: number;
  revenue: number;
  occupancy_rate: number;
}

interface Booking {
  id: string;
  property_id: string;
  property_title: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: "confirmed" | "pending" | "cancelled";
  created_at: string;
}

function HostDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    total_properties: 0,
    active_bookings: 0,
    monthly_revenue: 0,
    avg_rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [hostProfileId, setHostProfileId] = useState<string | null>(null);

  // Load real data from API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!user?.id) return;

        // Resolve host profile ID (profiles.id) from auth user.id once
        let hostIdParam = hostProfileId;
        if (!hostIdParam) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();
          if (profile?.id) {
            hostIdParam = profile.id as string;
            setHostProfileId(profile.id as string);
          } else {
            // Fallback to auth user id if profile lookup fails
            hostIdParam = user.id;
          }
        }

        // Load properties for this host only
        const propertiesResponse = await fetch(`/api/properties?host_id=${hostIdParam}`);
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json();
          // Transform API response to match the Property interface
          const transformedProperties = (propertiesData.properties || []).map((prop: any) => ({
            id: prop.id,
            title: prop.title,
            address: prop.address,
            price_per_night: prop.price_per_night,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            images: prop.metrics?.images || [],
            is_active: prop.is_active,
            rating: prop.rating || prop.metrics?.avg_rating || 0,
            review_count: prop.review_count || prop.metrics?.review_count || 0,
            booking_count: prop.metrics?.total_bookings || 0,
            revenue: prop.metrics?.total_revenue || 0,
            occupancy_rate: prop.metrics?.occupancy_rate || 0,
          }));
          setProperties(transformedProperties);
        }

        // Load bookings
        const bookingsResponse = await fetch(
          `/api/bookings?host_id=${hostIdParam}&limit=5`
        );
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setRecentBookings(bookingsData.bookings || []);
        }

        // Load stats
        const statsResponse = await fetch(`/api/host/stats?host_id=${hostIdParam}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Error",
          description:
            "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, toast, hostProfileId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Host Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.user_metadata?.first_name || "Host"}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                setSelectedProperty(null);
                setShowPropertyForm(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Properties</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.total_properties}
                    </p>
                    <p className="text-xs text-primary flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      +2 this month
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Active Bookings
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.active_bookings}
                    </p>
                    <p className="text-xs text-primary flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ${stats.monthly_revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-primary flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      +8% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Rating</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.avg_rating}
                    </p>
                    <p className="text-xs text-primary flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      +0.2 from last month
                    </p>
                  </div>
                  <div className="p-3 bg-accentCustom-100 rounded-lg">
                    <Star className="w-6 h-6 text-accentCustom-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Properties Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Properties</CardTitle>
                    <CardDescription>
                      Manage and monitor your property listings
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {properties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden">
                        <div className="flex">
                          {/* Property Image */}
                          <div className="w-32 h-32 flex-shrink-0 relative bg-muted">
                            <img
                              src={property.images?.[0] || '/assets/apartment_lobby_ss.jpg'}
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=400&fit=crop';
                              }}
                            />
                            <div className="absolute top-2 left-2">
                              <Badge
                                variant={
                                  property.is_active ? "default" : "secondary"
                                }
                                className={
                                  property.is_active ? "bg-primary" : ""
                                }
                              >
                                {property.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>

                          {/* Property Details */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-foreground line-clamp-1">
                                {property.title}
                              </h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedProperty(property);
                                      setShowPropertyForm(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedProperty(property);
                                      setShowPropertyForm(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedProperty(property);
                                      setShowCalendar(true);
                                    }}
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Manage Calendar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                              <MapPin className="w-4 h-4" />
                              <span>{property.address}</span>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Bed className="w-4 h-4" />
                                  <span>{property.bedrooms}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Bath className="w-4 h-4" />
                                  <span>{property.bathrooms}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-foreground">
                                  ${property.price_per_night}/night
                                </p>
                              </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Star className="w-3 h-3 fill-accentCustom-400 text-accentCustom-400" />
                                  <span className="text-sm font-medium">
                                    {property.rating}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {property.review_count} reviews
                                </p>
                              </div>

                              <div className="text-center">
                                <div className="text-sm font-medium text-foreground mb-1">
                                  {property.occupancy_rate}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Occupancy
                                </p>
                              </div>

                              <div className="text-center">
                                <div className="text-sm font-medium text-foreground mb-1">
                                  ${property.revenue.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Revenue
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>
                      Latest booking requests and confirmations
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-foreground">
                                  {booking.guest_name}
                                </h3>
                                <Badge
                                  variant={
                                    booking.status === "confirmed"
                                      ? "default"
                                      : booking.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className={`${booking.status === "confirmed" ? "bg-primary" : booking.status === "pending" ? "bg-accentCustom-400" : ""}`}
                                >
                                  {booking.status === "confirmed" && (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {booking.status === "pending" && (
                                    <Clock className="w-3 h-3 mr-1" />
                                  )}
                                  {booking.status === "cancelled" && (
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1)}
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground mb-2">
                                {booking.property_title}
                              </p>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(
                                      booking.check_in
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(
                                      booking.check_out
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="font-medium">
                                    ${booking.total_amount}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Manage Booking
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Properties</CardTitle>
                    <CardDescription>
                      Manage all your property listings
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setSelectedProperty(null);
                      setShowPropertyForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={property.images?.[0] || '/assets/default-property.jpg'}
                            alt={property.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge
                              variant={
                                property.is_active ? "default" : "secondary"
                              }
                              className={
                                property.is_active ? "bg-primary" : ""
                              }
                            >
                              {property.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground mb-2">
                            {property.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {property.address}
                          </p>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Bed className="w-4 h-4" />
                                <span>{property.bedrooms}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Bath className="w-4 h-4" />
                                <span>{property.bathrooms}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                ${property.price_per_night}/night
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowPropertyForm(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowCalendar(true);
                              }}
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <BookingManagement hostId={user?.id} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  Detailed insights and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and insights will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedProperty(null);
                  setShowPropertyForm(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Add Property
                      </p>
                      <p className="text-sm text-muted-foreground">
                        List new property
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  if (properties.length > 0) {
setSelectedProperty(properties[0]!);
                    setShowCalendar(true);
                  } else {
                    toast({
                      title: "No Properties",
                      description:
                        "Please add a property first to manage calendar",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Manage Calendar
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Update availability
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Analytics</p>
                      <p className="text-sm text-muted-foreground">View insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Form Modal */}
      <PropertyForm
        property={selectedProperty}
        isOpen={showPropertyForm}
        onClose={() => {
          setShowPropertyForm(false);
          setSelectedProperty(null);
        }}
        onSuccess={(property) => {
          // Refresh properties list
          const loadDashboardData = async () => {
            try {
              if (!user?.id) return;

              // Resolve host profile ID
              let hostIdParam = hostProfileId;
              if (!hostIdParam) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("user_id", user.id)
                  .single();
                hostIdParam = profile?.id || user.id;
              }

              // Load properties
              const propertiesResponse = await fetch(
                `/api/properties?host_id=${hostIdParam}`
              );
              if (propertiesResponse.ok) {
                const propertiesData = await propertiesResponse.json();
                setProperties(propertiesData.properties || []);
              }
            } catch (error) {
              console.error("Error refreshing properties:", error);
            }
          };
          loadDashboardData();
        }}
      />

      {/* Calendar Management Modal */}
      {selectedProperty && (
        <CalendarManagement
          propertyId={selectedProperty.id}
          isOpen={showCalendar}
          onClose={() => {
            setShowCalendar(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </div>
  );
}

const HostDashboardWithErrorBoundary = () => (
  <ErrorBoundary>
    <HostDashboard />
  </ErrorBoundary>
);

export default HostDashboardWithErrorBoundary;
