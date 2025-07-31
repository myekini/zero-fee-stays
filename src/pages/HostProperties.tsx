import React, { useEffect, useState } from 'react';
import { Plus, Building, Eye, Edit, MoreVertical, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import HostLayout from '@/components/HostLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Property {
  id: string;
  title: string;
  type: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  is_active: boolean;
  image_url?: string;
  booking_count: number;
  monthly_revenue: number;
}

const HostProperties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      // Mock data for demo - in real app, fetch from Supabase
      setProperties([
        {
          id: '1',
          title: 'Ocean View Apartment',
          type: 'Apartment',
          location: 'Santa Monica, CA',
          price_per_night: 180,
          max_guests: 4,
          bedrooms: 2,
          bathrooms: 2,
          is_active: true,
          booking_count: 15,
          monthly_revenue: 2700
        },
        {
          id: '2',
          title: 'Downtown Loft',
          type: 'Loft',
          location: 'Los Angeles, CA',
          price_per_night: 120,
          max_guests: 2,
          bedrooms: 1,
          bathrooms: 1,
          is_active: true,
          booking_count: 8,
          monthly_revenue: 960
        },
        {
          id: '3',
          title: 'Mountain Cabin',
          type: 'Cabin',
          location: 'Big Bear, CA',
          price_per_night: 200,
          max_guests: 6,
          bedrooms: 3,
          bathrooms: 2,
          is_active: false,
          booking_count: 5,
          monthly_revenue: 1000
        }
      ]);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <HostLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading properties...</p>
          </div>
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
            <p className="text-slate-600">Manage your rental properties and listings</p>
          </div>
          <Link to="/host/properties/new">
            <Button className="btn-primary mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Add New Property
            </Button>
          </Link>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Properties Yet</h3>
              <p className="text-slate-600 mb-6">
                Start earning by adding your first rental property to the platform.
              </p>
              <Link to="/host/properties/new">
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-slate-200 relative">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={property.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {property.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Actions Menu */}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Building className="mr-2 h-4 w-4" />
                          {property.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-slate-600">{property.location}</p>
                      <p className="text-xs text-slate-500">{property.type}</p>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{property.max_guests} guests</span>
                      </div>
                      <div>
                        {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                      </div>
                      <div>
                        {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500">Monthly Revenue</p>
                        <p className="text-sm font-semibold text-slate-900">${property.monthly_revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Bookings</p>
                        <p className="text-sm font-semibold text-slate-900">{property.booking_count} this month</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-slate-600" />
                        <span className="font-semibold text-slate-900">${property.price_per_night}</span>
                        <span className="text-sm text-slate-600">/ night</span>
                      </div>
                      
                      <Link to={`/property/${property.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default HostProperties;