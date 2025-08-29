import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Home,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Plus,
  Settings,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  status: "active" | "inactive" | "maintenance";
  bookings: number;
  revenue: number;
  rating: number;
  image: string;
}

interface Booking {
  id: string;
  propertyTitle: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  total: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  guestCount: number;
}

const HostDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data
  const properties: Property[] = [
    {
      id: "1",
      title: "Luxury Beachfront Villa",
      location: "Vancouver, BC",
      price: 450,
      status: "active",
      bookings: 12,
      revenue: 5400,
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    },
    {
      id: "2",
      title: "Modern Downtown Loft",
      location: "Toronto, ON",
      price: 280,
      status: "active",
      bookings: 8,
      revenue: 2240,
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
    },
    {
      id: "3",
      title: "Cozy Mountain Cabin",
      location: "Banff, AB",
      price: 320,
      status: "maintenance",
      bookings: 5,
      revenue: 1600,
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    },
  ];

  const bookings: Booking[] = [
    {
      id: "1",
      propertyTitle: "Luxury Beachfront Villa",
      guestName: "Sarah Johnson",
      checkIn: "2024-02-15",
      checkOut: "2024-02-18",
      total: 1350,
      status: "confirmed",
      guestCount: 4,
    },
    {
      id: "2",
      propertyTitle: "Modern Downtown Loft",
      guestName: "Mike Chen",
      checkIn: "2024-02-20",
      checkOut: "2024-02-22",
      total: 560,
      status: "pending",
      guestCount: 2,
    },
    {
      id: "3",
      propertyTitle: "Luxury Beachfront Villa",
      guestName: "Emily Davis",
      checkIn: "2024-02-25",
      checkOut: "2024-02-28",
      total: 1350,
      status: "completed",
      guestCount: 3,
    },
  ];

  // Analytics data
  const revenueData = [
    { month: "Jan", revenue: 4200 },
    { month: "Feb", revenue: 3800 },
    { month: "Mar", revenue: 5200 },
    { month: "Apr", revenue: 4800 },
    { month: "May", revenue: 6100 },
    { month: "Jun", revenue: 5800 },
  ];

  const bookingData = [
    { month: "Jan", bookings: 8 },
    { month: "Feb", bookings: 12 },
    { month: "Mar", bookings: 15 },
    { month: "Apr", bookings: 11 },
    { month: "May", bookings: 18 },
    { month: "Jun", bookings: 16 },
  ];

  const statusData = [
    { name: "Active", value: 2, color: "#10B981" },
    { name: "Maintenance", value: 1, color: "#F59E0B" },
    { name: "Inactive", value: 0, color: "#EF4444" },
  ];

  const totalRevenue = properties.reduce(
    (sum, property) => sum + property.revenue,
    0
  );
  const totalBookings = properties.reduce(
    (sum, property) => sum + property.bookings,
    0
  );
  const averageRating =
    properties.reduce((sum, property) => sum + property.rating, 0) /
    properties.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPropertyStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-display">
                Host Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your properties and track your earnings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="border-hiddy-teal text-hiddy-teal hover:bg-hiddy-teal hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-hiddy-coral hover:bg-hiddy-coral text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-hiddy-coral" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline w-3 h-3 text-green-500 mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Bookings
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-hiddy-teal" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline w-3 h-3 text-green-500 mr-1" />
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Properties
                  </CardTitle>
                  <Home className="h-4 w-4 text-hiddy-sunset" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{properties.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {properties.filter((p) => p.status === "active").length}{" "}
                    active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Rating
                  </CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {averageRating.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all properties
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{booking.propertyTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.guestName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${booking.total}</p>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge
                      className={`absolute top-3 left-3 ${getPropertyStatusColor(property.status)}`}
                    >
                      {property.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {property.location}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold">${property.price}/night</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Bookings
                        </p>
                        <p className="font-semibold">{property.bookings}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="font-semibold">${property.revenue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-semibold">
                            {property.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Messages
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-semibold">
                            {booking.propertyTitle}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {booking.guestName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.checkIn} - {booking.checkOut} •{" "}
                            {booking.guestCount} guests
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${booking.total}</p>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#FF6B6B"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#4ECDC4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HostDashboard;
