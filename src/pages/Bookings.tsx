import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface Booking {
  id: string;
  propertyTitle: string;
  propertyImage: string;
  location: string;
  checkIn: string;
  checkOut: string;
  total: number;
  status: "upcoming" | "completed" | "cancelled" | "pending";
  guestCount: number;
  hostName: string;
  hostImage: string;
  rating?: number;
  review?: string;
  bookingDate: string;
  propertyId: string;
}

const Bookings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample bookings data
  const bookings: Booking[] = [
    {
      id: "1",
      propertyTitle: "Luxury Beachfront Villa",
      propertyImage:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      location: "Vancouver, BC",
      checkIn: "2024-03-15",
      checkOut: "2024-03-18",
      total: 1350,
      status: "upcoming",
      guestCount: 4,
      hostName: "Sarah Wilson",
      hostImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      bookingDate: "2024-02-01",
      propertyId: "1",
    },
    {
      id: "2",
      propertyTitle: "Modern Downtown Loft",
      propertyImage:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
      location: "Toronto, ON",
      checkIn: "2024-02-20",
      checkOut: "2024-02-22",
      total: 560,
      status: "completed",
      guestCount: 2,
      hostName: "Mike Chen",
      hostImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      review:
        "Amazing stay! The loft was exactly as described and the location was perfect.",
      bookingDate: "2024-01-15",
      propertyId: "2",
    },
    {
      id: "3",
      propertyTitle: "Cozy Mountain Cabin",
      propertyImage:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
      location: "Banff, AB",
      checkIn: "2024-01-10",
      checkOut: "2024-01-13",
      total: 960,
      status: "completed",
      guestCount: 3,
      hostName: "Emily Davis",
      hostImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      review: "Beautiful cabin with stunning mountain views. Highly recommend!",
      bookingDate: "2023-12-20",
      propertyId: "3",
    },
    {
      id: "4",
      propertyTitle: "Historic City Apartment",
      propertyImage:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
      location: "Montreal, QC",
      checkIn: "2024-02-25",
      checkOut: "2024-02-28",
      total: 660,
      status: "cancelled",
      guestCount: 2,
      hostName: "Jean-Pierre Dubois",
      hostImage:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      bookingDate: "2024-01-30",
      propertyId: "4",
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeTab === "all" || booking.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-display">
                My Bookings
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your upcoming trips and view booking history
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="border-hiddy-teal text-hiddy-teal hover:bg-hiddy-teal hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-hiddy-coral hover:bg-hiddy-coral text-white">
                <Calendar className="w-4 h-4 mr-2" />
                New Booking
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
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No bookings found
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {activeTab === "upcoming"
                      ? "You don't have any upcoming trips planned."
                      : activeTab === "completed"
                        ? "You haven't completed any trips yet."
                        : activeTab === "cancelled"
                          ? "You don't have any cancelled bookings."
                          : "No bookings match your search criteria."}
                  </p>
                  <Button
                    className="bg-hiddy-coral hover:bg-hiddy-coral text-white"
                    onClick={() => navigate("/search")}
                  >
                    Browse Properties
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Property Image */}
                      <div className="md:w-64 md:h-48 h-48 md:h-auto">
                        <img
                          src={booking.propertyImage}
                          alt={booking.propertyTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-1">
                              {booking.propertyTitle}
                            </h3>
                            <div className="flex items-center text-slate-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{booking.location}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{booking.guestCount} guests</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={`flex items-center space-x-1 ${getStatusColor(booking.status)}`}
                            >
                              {getStatusIcon(booking.status)}
                              <span className="capitalize">
                                {booking.status}
                              </span>
                            </Badge>
                            {booking.status === "upcoming" && (
                              <p className="text-sm text-slate-600 mt-1">
                                {getDaysUntil(booking.checkIn)} days until
                                check-in
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Dates and Host */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-600">Check-in</p>
                            <p className="font-medium">
                              {formatDate(booking.checkIn)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Check-out</p>
                            <p className="font-medium">
                              {formatDate(booking.checkOut)}
                            </p>
                          </div>
                        </div>

                        {/* Host Info */}
                        <div className="flex items-center mb-4">
                          <img
                            src={booking.hostImage}
                            alt={booking.hostName}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <div>
                            <p className="text-sm text-slate-600">Host</p>
                            <p className="font-medium">{booking.hostName}</p>
                          </div>
                        </div>

                        {/* Review Section */}
                        {booking.status === "completed" && booking.rating && (
                          <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center mb-2">
                              <div className="flex items-center mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < booking.rating!
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-slate-600">
                                Your rating
                              </span>
                            </div>
                            {booking.review && (
                              <p className="text-sm text-slate-700 italic">
                                "{booking.review}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">Total</p>
                            <p className="text-2xl font-bold text-slate-900">
                              ${booking.total}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {booking.status === "upcoming" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-hiddy-teal text-hiddy-teal hover:bg-hiddy-teal hover:text-white"
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Message Host
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              className="bg-hiddy-coral hover:bg-hiddy-coral text-white"
                              onClick={() =>
                                navigate(`/property/${booking.propertyId}`)
                              }
                            >
                              View Property
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Bookings;
