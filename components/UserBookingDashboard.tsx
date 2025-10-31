"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Download,
  RefreshCw,
  Filter,
  Search,
  Star,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ReviewForm } from "@/components/ReviewForm";

interface UserBooking {
  id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  special_requests?: string;
  created_at: string;
  updated_at: string;
  property: {
    id: string;
    title: string;
    address: string;
    location: string;
    price_per_night: number;
    images: string[];
  };
  host_name: string;
  host_email: string;
}

interface UserBookingDashboardProps {
  userId?: string;
}

export function UserBookingDashboard({ userId }: UserBookingDashboardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [cancellationPolicy, setCancellationPolicy] = useState<any>(null);
  const [loadingCancellation, setLoadingCancellation] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    sortBy: "created_at",
  });

  useEffect(() => {
    loadUserBookings();
  }, [userId, user, filters]);

  const loadUserBookings = async () => {
    setLoading(true);
    try {
      const guestId = userId || user?.id;
      if (!guestId) {
        console.warn("No user ID available");
        setBookings([]);
        return;
      }

      const params = new URLSearchParams();
      params.append("guest_id", guestId);
      if (filters.status !== "all") params.append("status", filters.status);
      params.append("limit", "50");

      const response = await fetch(`/api/bookings?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        let userBookings = data.bookings || [];

        // Apply search filter
        if (filters.search) {
          userBookings = userBookings.filter(
            (booking: UserBooking) =>
              booking.property.title
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              booking.property.location
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              booking.host_name
                .toLowerCase()
                .includes(filters.search.toLowerCase())
          );
        }

        // Apply sorting
        userBookings.sort((a: UserBooking, b: UserBooking) => {
          switch (filters.sortBy) {
            case "check_in_date":
              return (
                new Date(a.check_in_date).getTime() -
                new Date(b.check_in_date).getTime()
              );
            case "created_at":
            default:
              return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
              );
          }
        });

        setBookings(userBookings);
      } else {
        throw new Error("Failed to load bookings");
      }
    } catch (error) {
      console.error("Error loading user bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load your bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCancellationPolicy = async (booking: UserBooking) => {
    if (!user?.id) return;

    setLoadingCancellation(true);
    try {
      const response = await fetch(
        `/api/bookings/cancel?booking_id=${booking.id}&user_id=${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setCancellationPolicy(data.cancellation_policy);
      } else {
        const error = await response.json();
        console.error("Error loading cancellation policy:", error);
      }
    } catch (error) {
      console.error("Error loading cancellation policy:", error);
    } finally {
      setLoadingCancellation(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !user?.id) return;

    setLoadingCancellation(true);
    try {
      const response = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          userId: user.id,
          reason: "Cancelled by guest",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Booking Cancelled ✅",
          description: `Your booking has been cancelled. ${data.refund?.eligible ? `Refund of ${formatCurrency(data.refund.amount)} will be processed in ${data.refund.processing_time}.` : ""}`,
        });
        setShowCancelDialog(false);
        setSelectedBooking(null);
        setCancellationPolicy(null);
        loadUserBookings();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setLoadingCancellation(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const getDaysUntilCheckIn = (checkInDate: string) => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const diffTime = checkIn.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const canCancelBooking = (booking: UserBooking) => {
    const daysUntilCheckIn = getDaysUntilCheckIn(booking.check_in_date);
    return booking.status === "confirmed" && daysUntilCheckIn > 1;
  };

  const canReviewBooking = (booking: UserBooking) => {
    // Can review if booking is completed and checkout date has passed
    const checkoutDate = new Date(booking.check_out_date);
    const now = new Date();
    return booking.status === "completed" && checkoutDate < now;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">My Bookings</h2>
          <p className="text-neutral-600">
            Manage and view all your booking reservations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadUserBookings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search by property, location, or host..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, sortBy: value }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Created</SelectItem>
              <SelectItem value="check_in_date">Check-in Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No bookings found
            </h3>
            <p className="text-neutral-600">
              {filters.search || filters.status !== "all"
                ? "Try adjusting your filters to see more bookings."
                : "You haven't made any bookings yet. Start exploring properties!"}
            </p>
          </Card>
        ) : (
          bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(booking.status)} text-white`}
                        >
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">
                            {booking.status}
                          </span>
                        </Badge>
                        <span className="text-sm text-neutral-500">
                          Booking #{booking.id.slice(-8)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={booking.property.images?.[0] || '/assets/default-property.jpg'}
                              alt={booking.property.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="font-semibold text-neutral-900">
                                {booking.property.title}
                              </h3>
                              <div className="flex items-center gap-1 text-sm text-neutral-600">
                                <MapPin className="w-3 h-3" />
                                <span>{booking.property.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-neutral-600" />
                              <span>
                                {formatDate(booking.check_in_date)} -{" "}
                                {formatDate(booking.check_out_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-neutral-600" />
                              <span>
                                {booking.guests_count}{" "}
                                {booking.guests_count === 1
                                  ? "guest"
                                  : "guests"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-neutral-600" />
                              <span className="font-medium">
                                {formatCurrency(booking.total_amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {booking.special_requests && (
                        <div className="mb-3">
                          <p className="text-sm text-neutral-600">
                            <strong>Special Requests:</strong>{" "}
                            {booking.special_requests}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Booked {formatDate(booking.created_at)}</span>
                        </div>
                        {booking.status === "confirmed" && (
                          <span>
                            Check-in in{" "}
                            {getDaysUntilCheckIn(booking.check_in_date)} days
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>

                      {canCancelBooking(booking) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedBooking(booking);
                            loadCancellationPolicy(booking);
                            setShowCancelDialog(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}

                      {canReviewBooking(booking) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowReviewForm(true);
                          }}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Write Review
                        </Button>
                      )}

                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Host
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about your booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Property Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Property:</strong>{" "}
                      {selectedBooking.property.title}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {selectedBooking.property.location}
                    </p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {selectedBooking.property.address}
                    </p>
                    <p>
                      <strong>Price/Night:</strong>{" "}
                      {formatCurrency(selectedBooking.property.price_per_night)}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Host Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Host:</strong> {selectedBooking.host_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedBooking.host_email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Booking Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Check-in:</strong>{" "}
                      {formatDate(selectedBooking.check_in_date)}
                    </p>
                    <p>
                      <strong>Check-out:</strong>{" "}
                      {formatDate(selectedBooking.check_out_date)}
                    </p>
                    <p>
                      <strong>Guests:</strong> {selectedBooking.guests_count}
                    </p>
                    <p>
                      <strong>Total Amount:</strong>{" "}
                      {formatCurrency(selectedBooking.total_amount)}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <Badge
                        className={`ml-2 ${getStatusColor(selectedBooking.status)} text-white`}
                      >
                        {selectedBooking.status}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Timeline</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Booked:</strong>{" "}
                      {formatDate(selectedBooking.created_at)}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {formatDate(selectedBooking.updated_at)}
                    </p>
                    {selectedBooking.status === "confirmed" && (
                      <p>
                        <strong>Days Until Check-in:</strong>{" "}
                        {getDaysUntilCheckIn(selectedBooking.check_in_date)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div>
                  <h4 className="font-semibold mb-2">Special Requests</h4>
                  <p className="text-sm text-neutral-600">
                    {selectedBooking.special_requests}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Review the cancellation policy before proceeding
            </DialogDescription>
          </DialogHeader>

          {loadingCancellation ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : cancellationPolicy ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Cancellation Policy</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {cancellationPolicy.reason}
                </p>

                {cancellationPolicy.can_cancel && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Refund Amount:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(cancellationPolicy.refund_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Time:</span>
                      <span>{cancellationPolicy.processing_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hours until check-in:</span>
                      <span>
                        {Math.round(cancellationPolicy.hours_until_checkin)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!cancellationPolicy.can_cancel && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Cannot Cancel</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    {cancellationPolicy.reason}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancellationPolicy(null);
                    setSelectedBooking(null);
                  }}
                  className="flex-1"
                >
                  Keep Booking
                </Button>
                {cancellationPolicy.can_cancel && (
                  <Button
                    onClick={handleCancelBooking}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    disabled={loadingCancellation}
                  >
                    {loadingCancellation ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Booking"
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">
                Unable to load cancellation policy
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Form Dialog */}
      {selectedBooking && (
        <ReviewForm
          bookingId={selectedBooking.id}
          propertyId={selectedBooking.property_id}
          propertyTitle={selectedBooking.property.title}
          isOpen={showReviewForm}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedBooking(null);
          }}
          onSuccess={() => {
            toast({
              title: "Review Submitted! ⭐",
              description: "Thank you for sharing your experience",
            });
          }}
        />
      )}
    </div>
  );
}
