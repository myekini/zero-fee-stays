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
import { Textarea } from "@/components/ui/textarea";
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
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  Clock,
  User,
  MapPin,
  DollarSign,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PropertyForModeration {
  property_id: string;
  title: string;
  host_name: string;
  host_email: string;
  approval_status: string;
  created_at: string;
  flag_count: number;
  last_moderation_action?: string;
  last_moderation_date?: string;
}

interface PropertyDetails extends PropertyForModeration {
  description: string;
  location: string;
  country: string;
  property_type: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
}

const AdminPropertyModeration: React.FC = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<PropertyForModeration[]>([]);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");

  useEffect(() => {
    loadModerationQueue();
  }, []);

  const loadModerationQueue = async () => {
    try {
      setLoading(true);

      // Get the session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch("/api/admin/properties/moderation-queue", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      } else {
        throw new Error("Failed to load moderation queue");
      }
    } catch (error) {
      console.error("Error loading moderation queue:", error);
      toast({
        title: "Error",
        description: "Failed to load properties for moderation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyDetails = async (propertyId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `/api/admin/properties/${propertyId}/details`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedProperty(data.property);
        setDetailsOpen(true);
      } else {
        throw new Error("Failed to load property details");
      }
    } catch (error) {
      console.error("Error loading property details:", error);
      toast({
        title: "Error",
        description: "Failed to load property details.",
        variant: "destructive",
      });
    }
  };

  const approveProperty = async (propertyId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `/api/admin/properties/${propertyId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes: approvalNotes,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property approved successfully.",
        });
        setApprovalNotes("");
        setDetailsOpen(false);
        loadModerationQueue();
      } else {
        throw new Error("Failed to approve property");
      }
    } catch (error) {
      console.error("Error approving property:", error);
      toast({
        title: "Error",
        description: "Failed to approve property.",
        variant: "destructive",
      });
    }
  };

  const rejectProperty = async (propertyId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `/api/admin/properties/${propertyId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: rejectionReason,
            notes: rejectionNotes,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property rejected successfully.",
        });
        setRejectionReason("");
        setRejectionNotes("");
        setDetailsOpen(false);
        loadModerationQueue();
      } else {
        throw new Error("Failed to reject property");
      }
    } catch (error) {
      console.error("Error rejecting property:", error);
      toast({
        title: "Error",
        description: "Failed to reject property.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600">
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "needs_review":
        return (
          <Badge variant="outline" className="text-orange-600">
            Needs Review
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.host_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || property.approval_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading moderation queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Property Moderation</h1>
        <p className="text-muted-foreground">
          Review and approve property listings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties.filter(p => p.approval_status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Flagged Properties
            </CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties.reduce((sum, p) => sum + p.flag_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">User reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                properties.filter(
                  p =>
                    p.approval_status === "approved" &&
                    new Date(p.last_moderation_date || "").toDateString() ===
                      new Date().toDateString()
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Properties approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queue</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">Properties in queue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
                  placeholder="Search by property title or host name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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
                <SelectItem value="needs_review">Needs Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Queue ({filteredProperties.length})</CardTitle>
          <CardDescription>
            Properties awaiting review and approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Last Action</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map(property => (
                <TableRow key={property.property_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {property.property_id.slice(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{property.host_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {property.host_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(property.approval_status)}
                  </TableCell>
                  <TableCell>
                    {property.flag_count > 0 ? (
                      <Badge variant="destructive">{property.flag_count}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(property.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {property.last_moderation_action && (
                      <div className="text-sm">
                        <div>{property.last_moderation_action}</div>
                        <div className="text-muted-foreground">
                          {new Date(
                            property.last_moderation_date || ""
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          loadPropertyDetails(property.property_id)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Property Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Review</DialogTitle>
            <DialogDescription>
              Review property details and approve or reject the listing
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-6">
              {/* Property Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Property Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Title:</span>
                      <p className="text-sm">{selectedProperty.title}</p>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="text-sm">{selectedProperty.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedProperty.location}, {selectedProperty.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Host Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedProperty.host_name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedProperty.host_email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    ${selectedProperty.price_per_night}
                  </div>
                  <div className="text-sm text-muted-foreground">Per Night</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedProperty.max_guests}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Max Guests
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {selectedProperty.bedrooms}
                  </div>
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {selectedProperty.bathrooms}
                  </div>
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                </div>
              </div>

              {/* Amenities */}
              {selectedProperty.amenities &&
                selectedProperty.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Images */}
              {selectedProperty.images &&
                selectedProperty.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedProperty.images
                        .slice(0, 8)
                        .map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Property image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                    </div>
                  </div>
                )}

              {/* Approval Actions */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold">Moderation Actions</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Approval Notes (Optional)
                    </label>
                    <Textarea
                      placeholder="Add any notes about this approval..."
                      value={approvalNotes}
                      onChange={e => setApprovalNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject Property
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Property</AlertDialogTitle>
                          <AlertDialogDescription>
                            Please provide a reason for rejecting this property
                            listing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              Rejection Reason
                            </label>
                            <Select
                              value={rejectionReason}
                              onValueChange={setRejectionReason}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inappropriate_content">
                                  Inappropriate Content
                                </SelectItem>
                                <SelectItem value="fake_listing">
                                  Fake Listing
                                </SelectItem>
                                <SelectItem value="wrong_location">
                                  Wrong Location
                                </SelectItem>
                                <SelectItem value="poor_quality">
                                  Poor Quality Photos
                                </SelectItem>
                                <SelectItem value="incomplete_info">
                                  Incomplete Information
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Additional Notes
                            </label>
                            <Textarea
                              placeholder="Provide additional details..."
                              value={rejectionNotes}
                              onChange={e => setRejectionNotes(e.target.value)}
                            />
                          </div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              rejectProperty(selectedProperty.property_id)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={!rejectionReason}
                          >
                            Reject Property
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      onClick={() =>
                        approveProperty(selectedProperty.property_id)
                      }
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Property
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPropertyModeration;
