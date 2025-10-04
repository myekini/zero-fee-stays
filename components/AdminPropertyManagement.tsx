import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Building,
  MapPin,
  DollarSign,
  Star,
  Calendar,
  Users,
  Bed,
  Bath,
  Trash2,
} from "lucide-react";
import { propertyService, Property, PropertyStats } from "@/services/propertyService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

import { withErrorBoundary } from "@/components/ErrorBoundaryWrapper";

import SelectFilter from "@/components/filters/SelectFilter";

const AdminPropertyManagement: React.FC = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<PropertyStats>({
    totalProperties: 0,
    activeProperties: 0,
    featuredProperties: 0,
    totalRevenue: 0,
    averageRating: 0,
    averageOccupancy: 0,
    newThisMonth: 0,
    topPerforming: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyDetailsOpen, setPropertyDetailsOpen] = useState(false);

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      const propertiesData = await propertyService.getProperties({
        status: filterStatus === "all" ? undefined : filterStatus,
        property_type: filterType === "all" ? undefined : filterType,
        country: filterCountry === "all" ? undefined : filterCountry,
        search: searchTerm || undefined,
      });
      setProperties(propertiesData);
    } catch (error) {
      console.error("Error loading properties:", error);
      toast({
        title: "Error",
        description: "Failed to load properties.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, filterCountry, searchTerm, toast]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await propertyService.getPropertyStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

  useEffect(() => {
    loadProperties();
    loadStats();
  }, [loadProperties, loadStats]);

  const handlePropertyAction = async (
    propertyId: string,
    action: "activate" | "deactivate" | "feature" | "unfeature" | "delete"
  ) => {
    const originalProperties = [...properties];
    let updatedProperties = [...properties];

    const propertyIndex = updatedProperties.findIndex((p) => p.id === propertyId);
    if (propertyIndex === -1) return;

    const property = updatedProperties[propertyIndex];

    // Optimistic UI updates
    switch (action) {
      case "activate":
        updatedProperties[propertyIndex] = { ...(property as any), is_active: true } as any;
        break;
      case "deactivate":
        updatedProperties[propertyIndex] = { ...(property as any), is_active: false } as any;
        break;
      case "feature":
        updatedProperties[propertyIndex] = { ...(property as any), is_featured: true } as any;
        break;
      case "unfeature":
        updatedProperties[propertyIndex] = { ...(property as any), is_featured: false } as any;
        break;
      case "delete":
        updatedProperties = updatedProperties.filter((p) => p.id !== propertyId);
        break;
    }
    setProperties(updatedProperties);

    try {
      const token = session?.access_token;
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      switch (action) {
        case "activate":
          await propertyService.togglePropertyStatus(propertyId, true, token);
          break;
        case "deactivate":
          await propertyService.togglePropertyStatus(propertyId, false, token);
          break;
        case "feature":
          await propertyService.togglePropertyFeatured(propertyId, true, token);
          break;
        case "unfeature":
          await propertyService.togglePropertyFeatured(propertyId, false, token);
          break;
        case "delete":
          await propertyService.deleteProperty(propertyId, token);
          break;
      }

      toast({
        title: "Success",
        description: `Property ${action}d successfully.`,
      });

      // Refresh stats after a successful action
      if (action === "delete" || action === "activate" || action === "deactivate") {
        loadStats();
      }
    } catch (error) {
      console.error(`Error performing ${action} on property:`, error);
      setProperties(originalProperties); // Revert on error
      toast({
        title: "Error",
        description: `Failed to ${action} property.`,
        variant: "destructive",
      });
    }
  };

  const openPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setPropertyDetailsOpen(true);
  };

  const uniqueCountries = useMemo(() => {
    const countries = properties.map((p) => p.country).filter(Boolean);
    return Array.from(new Set(countries));
  }, [properties]);

  const uniqueTypes = useMemo(() => {
    const types = properties.map((p) => p.property_type).filter(Boolean);
    return Array.from(new Set(types));
  }, [properties]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Property Management</h1>
        <p className="text-muted-foreground">
          Manage all properties on the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Properties
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Properties
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProperties}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeProperties / stats.totalProperties) * 100).toFixed(
                1
              )}
              % active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Featured Properties
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featuredProperties}</div>
            <p className="text-xs text-muted-foreground">Premium listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.topPerforming} top performing
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
                  placeholder="Search by title, location, or host..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <SelectFilter
              value={filterStatus}
              onValueChange={setFilterStatus}
              placeholder="Filter by status"
              items={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "featured", label: "Featured" },
              ]}
            />
            <SelectFilter
              value={filterType}
              onValueChange={setFilterType}
              placeholder="Filter by type"
              items={uniqueTypes.map((type: string) => ({ value: type, label: type }))}
            />
            <SelectFilter
              value={filterCountry}
              onValueChange={setFilterCountry}
              placeholder="Filter by country"
              items={uniqueCountries.map((country: string) => ({ value: country, label: country }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({properties.length})</CardTitle>
          <CardDescription>
            Manage property listings and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {property.property_type} • {property.bedrooms} bed,{" "}
                        {property.bathrooms} bath
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{property.host.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {property.host.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${property.price_per_night}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {property.is_active ? (
                        <Badge variant="outline" className="text-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600">
                          Inactive
                        </Badge>
                      )}
                      {property.is_featured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{(property as any).total_bookings}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">
                        {(property as any).average_rating?.toFixed?.(1) || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPropertyDetails(property)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {!property.is_active ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handlePropertyAction(property.id, "activate")
                          }
                        >
                          <Building className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handlePropertyAction(property.id, "deactivate")
                          }
                        >
                          <Building className="h-4 w-4" />
                        </Button>
                      )}

                      {!property.is_featured ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handlePropertyAction(property.id, "feature")
                          }
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handlePropertyAction(property.id, "unfeature")
                          }
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Property</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete "
                              {property.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handlePropertyAction(property.id, "delete")
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Property Details Dialog */}
      <Dialog open={propertyDetailsOpen} onOpenChange={setPropertyDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected property
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-6">
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
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedProperty.property_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Host Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-sm">{selectedProperty.host.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-sm">{selectedProperty.host.email}</p>
                    </div>
                  </div>
                </div>
              </div>

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
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedProperty.max_guests}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Max Guests
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedProperty.bedrooms}
                  </div>
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedProperty.bathrooms}
                  </div>
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {(selectedProperty as any).total_bookings}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Bookings
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    ${((selectedProperty as any).total_revenue?.toLocaleString?.() || "0")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Revenue
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {((selectedProperty as any).average_rating?.toFixed?.(1) || "N/A")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Rating
                  </div>
                </div>
              </div>

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

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Created:{" "}
                    {new Date(selectedProperty.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Updated:{" "}
                    {new Date(selectedProperty.updated_at).toLocaleDateString()}
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

export default withErrorBoundary(AdminPropertyManagement);
