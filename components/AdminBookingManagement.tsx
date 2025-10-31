import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Building,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "refunded" | "failed";
  created_at: string;
  updated_at: string;
  guest: {
    id: string;
    name: string;
    email: string;
  };
  host: {
    id: string;
    name: string;
    email: string;
  };
  property: {
    id: string;
    title: string;
    location: string;
    price_per_night: number;
  };
  payment_intent_id?: string;
  refund_amount?: number;
  cancellation_reason?: string;
}

interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  newThisMonth: number;
  upcomingBookings: number;
}

const AdminBookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
    newThisMonth: 0,
    upcomingBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, filterStatus, filterPaymentStatus]);

  const loadBookings = async () => {
    try {
      setLoading(true);

      // Fetch bookings with related data
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          guest:profiles!guest_id(
            id,
            first_name,
            last_name,
            email
          ),
          property:properties!property_id(
            id,
            title,
            location,
            price_per_night,
            host:profiles!host_id(
              id,
              first_name,
              last_name,
              email
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      // Transform data
      const transformedBookings: Booking[] = (bookingsData || []).map(
        (booking: any) => ({
          id: booking.id,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          guests_count: booking.guests_count,
          total_amount: booking.total_amount,
          status: booking.status,
          payment_status: booking.payment_status,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
          guest: {
            id: booking.guest?.id || "",
            name: `${booking.guest?.first_name || ""} ${booking.guest?.last_name || ""}`.trim(),
            email: booking.guest?.email || "",
          },
          host: {
            id: booking.property?.host?.id || "",
            name: `${booking.property?.host?.first_name || ""} ${booking.property?.host?.last_name || ""}`.trim(),
            email: booking.property?.host?.email || "",
          },
          property: {
            id: booking.property?.id || "",
            title: booking.property?.title || "",
            location: booking.property?.location || "",
            price_per_night: booking.property?.price_per_night || 0,
          },
          payment_intent_id: booking.payment_intent_id,
          refund_amount: booking.refund_amount,
          cancellation_reason: booking.cancellation_reason,
        })
      );

      setBookings(transformedBookings);
      calculateStats(transformedBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingList: Booking[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats: BookingStats = {
      totalBookings: bookingList.length,
      confirmedBookings: bookingList.filter((b) => b.status === "confirmed")
        .length,
      pendingBookings: bookingList.filter((b) => b.status === "pending").length,
      cancelledBookings: bookingList.filter((b) => b.status === "cancelled")
        .length,
      completedBookings: bookingList.filter((b) => b.status === "completed")
        .length,
      totalRevenue: bookingList.reduce((sum, b) => sum + b.total_amount, 0),
      averageBookingValue:
        bookingList.length > 0
          ? bookingList.reduce((sum, b) => sum + b.total_amount, 0) /
            bookingList.length
          : 0,
      newThisMonth: bookingList.filter(
        (b) => new Date(b.created_at) >= thisMonth
      ).length,
      upcomingBookings: bookingList.filter(
        (b) => b.status === "confirmed" && new Date(b.check_in_date) <= nextWeek
      ).length,
    };

    setStats(stats);
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.property.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((booking) => booking.status === filterStatus);
    }

    // Payment status filter
    if (filterPaymentStatus !== "all") {
      filtered = filtered.filter(
        (booking) => booking.payment_status === filterPaymentStatus
      );
    }

    setFilteredBookings(filtered);
  };

  const handleBookingAction = async (bookingId: string, action: string) => {
    try {
      let updateData: any = {};

      switch (action) {
        case "confirm":
          updateData = { status: "confirmed" };
          break;
        case "cancel":
          updateData = {
            status: "cancelled",
            cancellation_reason: "Cancelled by admin",
          };
          break;
        case "complete":
          updateData = { status: "completed" };
          break;
        case "refund":
          // Handle refund logic
          updateData = {
            payment_status: "refunded",
            refund_amount: 0, // Would need to calculate
          };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from("bookings")
          .update(updateData)
          .eq("id", bookingId);

        if (error) throw error;
      }

      // Reload bookings
      await loadBookings();
    } catch (error) {
      console.error(`Error performing ${action} on booking:`, error);
    }
  };

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setBookingDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-600">
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600">
            Pending
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "completed":
        return (
          <Badge variant="outline" className="text-blue-600">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="text-green-600">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600">
            Pending
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="outline" className="text-blue-600">
            Refunded
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground">
          Manage all bookings and reservations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingBookings} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${stats.averageBookingValue.toFixed(0)} avg booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by guest, host, property, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterPaymentStatus}
              onValueChange={setFilterPaymentStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription>
            Manage booking statuses and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {booking.id.slice(0, 8)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.guest.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.guest.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {booking.property.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.property.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {new Date(booking.check_in_date).toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">
                        to{" "}
                        {new Date(booking.check_out_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {calculateNights(
                          booking.check_in_date,
                          booking.check_out_date
                        )}{" "}
                        nights
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${booking.total_amount}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.guests_count} guests
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(booking.payment_status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openBookingDetails(booking)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {booking.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleBookingAction(booking.id, "confirm")
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {booking.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleBookingAction(booking.id, "complete")
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {booking.status !== "cancelled" &&
                        booking.status !== "completed" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Cancel Booking
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this booking?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleBookingAction(booking.id, "cancel")
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                      {booking.payment_status === "paid" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Process Refund
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to process a refund for
                                this booking?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleBookingAction(booking.id, "refund")
                                }
                              >
                                Process Refund
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Booking Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Booking ID:</span>
                      <p className="text-sm font-mono">{selectedBooking.id}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <div className="mt-1">
                        {getStatusBadge(selectedBooking.status)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Payment Status:</span>
                      <div className="mt-1">
                        {getPaymentStatusBadge(selectedBooking.payment_status)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Total Amount:</span>
                      <p className="text-sm font-semibold">
                        ${selectedBooking.total_amount}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Dates & Guests</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Check-in:</span>
                      <p className="text-sm">
                        {new Date(
                          selectedBooking.check_in_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Check-out:</span>
                      <p className="text-sm">
                        {new Date(
                          selectedBooking.check_out_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-sm">
                        {calculateNights(
                          selectedBooking.check_in_date,
                          selectedBooking.check_out_date
                        )}{" "}
                        nights
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Guests:</span>
                      <p className="text-sm">
                        {selectedBooking.guests_count} people
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Guest Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-sm">{selectedBooking.guest.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-sm">{selectedBooking.guest.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Host Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-sm">{selectedBooking.host.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-sm">{selectedBooking.host.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Property Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Title:</span>
                    <p className="text-sm">{selectedBooking.property.title}</p>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <p className="text-sm">
                      {selectedBooking.property.location}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Price per Night:</span>
                    <p className="text-sm">
                      ${selectedBooking.property.price_per_night}
                    </p>
                  </div>
                </div>
              </div>

              {selectedBooking.payment_intent_id && (
                <div>
                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Payment Intent ID:</span>
                      <p className="text-sm font-mono">
                        {selectedBooking.payment_intent_id}
                      </p>
                    </div>
                    {selectedBooking.refund_amount && (
                      <div>
                        <span className="font-medium">Refund Amount:</span>
                        <p className="text-sm">
                          ${selectedBooking.refund_amount}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.cancellation_reason && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Cancellation Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Reason:</span>
                      <p className="text-sm">
                        {selectedBooking.cancellation_reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Created:{" "}
                    {new Date(selectedBooking.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Updated:{" "}
                    {new Date(selectedBooking.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookingManagement;
