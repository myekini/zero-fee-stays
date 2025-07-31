import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, MapPin, Calendar, Users, Wifi, Car, Coffee, Bath, Home, Building2, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  country: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  amenities: string[];
  images: string[];
}

const Search = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search filters state
  const [filters, setFilters] = useState({
    location: '',
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    guests: 1,
    priceRange: [0, 1000],
    propertyType: 'all',
    amenities: [] as string[]
  });

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'parking', label: 'Free parking', icon: Car },
    { id: 'kitchen', label: 'Kitchen', icon: Coffee },
    { id: 'pool', label: 'Pool', icon: Bath },
    { id: 'garden', label: 'Garden', icon: TreePine }
  ];

  const propertyTypes = [
    { value: 'all', label: 'All types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'cottage', label: 'Cottage' }
  ];

  // Sample property data
  useEffect(() => {
    const sampleProperties: Property[] = [
      {
        id: '1',
        title: 'Modern Downtown Apartment',
        location: 'Downtown District',
        city: 'New York',
        country: 'USA',
        price_per_night: 120,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        property_type: 'apartment',
        amenities: ['wifi', 'kitchen', 'parking'],
        images: ['/api/placeholder/400/300']
      },
      {
        id: '2',
        title: 'Cozy Beach House',
        location: 'Oceanfront',
        city: 'Miami',
        country: 'USA',
        price_per_night: 200,
        max_guests: 6,
        bedrooms: 3,
        bathrooms: 2,
        property_type: 'house',
        amenities: ['wifi', 'pool', 'garden'],
        images: ['/api/placeholder/400/300']
      },
      {
        id: '3',
        title: 'Mountain View Villa',
        location: 'Hillside',
        city: 'San Francisco',
        country: 'USA',
        price_per_night: 350,
        max_guests: 8,
        bedrooms: 4,
        bathrooms: 3,
        property_type: 'villa',
        amenities: ['wifi', 'kitchen', 'parking', 'garden'],
        images: ['/api/placeholder/400/300']
      }
    ];
    
    setProperties(sampleProperties);
    setFilteredProperties(sampleProperties);
    setLoading(false);
  }, []);

  // Filter properties based on current filters
  useEffect(() => {
    let filtered = properties.filter(property => {
      // Location filter
      if (filters.location && !property.city.toLowerCase().includes(filters.location.toLowerCase()) && 
          !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Guests filter
      if (property.max_guests < filters.guests) {
        return false;
      }
      
      // Price filter
      if (property.price_per_night < filters.priceRange[0] || property.price_per_night > filters.priceRange[1]) {
        return false;
      }
      
      // Property type filter
      if (filters.propertyType !== 'all' && property.property_type !== filters.propertyType) {
        return false;
      }
      
      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity => 
          property.amenities.includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredProperties(filtered);
  }, [properties, filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Link to={`/property/${property.id}`}>
      <Card className="card-property group cursor-pointer">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-slate-800">
            ${property.price_per_night}/night
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">
            {property.title}
          </h3>
        </div>
        
        <div className="flex items-center text-slate-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.city}, {property.country}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{property.max_guests} guests</span>
          </div>
          <div className="flex items-center">
            <Home className="w-4 h-4 mr-1" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            <span>{property.bathrooms} bath</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {property.amenities.slice(0, 3).map(amenity => {
            const amenityInfo = amenitiesList.find(a => a.id === amenity);
            const Icon = amenityInfo?.icon || Wifi;
            return (
              <Badge key={amenity} variant="outline" className="text-xs">
                <Icon className="w-3 h-3 mr-1" />
                {amenityInfo?.label || amenity}
              </Badge>
            );
          })}
          {property.amenities.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{property.amenities.length - 3} more
            </Badge>
          )}
        </div>
       </div>
      </Card>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[4/3] bg-slate-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
                    <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Where are you going?"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="min-w-[120px] justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        {filters.checkIn ? format(filters.checkIn, 'MMM dd') : 'Check in'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.checkIn}
                        onSelect={(date) => handleFilterChange('checkIn', date)}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="min-w-[120px] justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        {filters.checkOut ? format(filters.checkOut, 'MMM dd') : 'Check out'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.checkOut}
                        onSelect={(date) => handleFilterChange('checkOut', date)}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Select value={filters.guests.toString()} onValueChange={(value) => handleFilterChange('guests', parseInt(value))}>
                    <SelectTrigger className="min-w-[100px]">
                      <Users className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} guest{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              
              {/* Price Range */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Price per night
                  </label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => handleFilterChange('priceRange', value)}
                    max={1000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-600 mt-1">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>
                
                {/* Property Type */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Property type
                  </label>
                  <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Amenities */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Amenities
                  </label>
                  <div className="space-y-2">
                    {amenitiesList.map(amenity => {
                      const Icon = amenity.icon;
                      return (
                        <div key={amenity.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity.id}
                            checked={filters.amenities.includes(amenity.id)}
                            onCheckedChange={() => handleAmenityToggle(amenity.id)}
                          />
                          <label
                            htmlFor={amenity.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center cursor-pointer"
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {amenity.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Properties Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {filteredProperties.length} properties found
              </h2>
            </div>
            
            {filteredProperties.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No properties found</h3>
                <p className="text-slate-600">Try adjusting your filters or search criteria.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;