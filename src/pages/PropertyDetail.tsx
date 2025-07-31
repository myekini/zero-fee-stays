import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Wifi, Car, Coffee, TreePine, Star, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import BookingFlow from '@/components/BookingFlow';
import Header from '@/components/Header';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  amenities: string[];
  house_rules?: string;
  check_in_time?: string;
  check_out_time?: string;
  host_id: string;
}

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Sample property images for demo
  const sampleImages = [
    '/api/placeholder/800/600',
    '/api/placeholder/800/600?2',
    '/api/placeholder/800/600?3',
    '/api/placeholder/800/600?4',
    '/api/placeholder/800/600?5'
  ];

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'parking', label: 'Free parking', icon: Car },
    { id: 'kitchen', label: 'Kitchen', icon: Coffee },
    { id: 'garden', label: 'Garden', icon: TreePine }
  ];

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      // For demo, we'll use sample data since we don't have real properties yet
      const sampleProperty: Property = {
        id: id || '1',
        title: 'Modern Downtown Apartment',
        description: 'A beautiful, modern apartment in the heart of downtown. Perfect for business travelers and tourists alike. Features include a fully equipped kitchen, high-speed WiFi, and stunning city views from the balcony. The space is professionally cleaned between each stay and includes all the amenities you need for a comfortable visit.',
        location: 'Downtown District',
        city: 'New York',
        country: 'USA',
        price_per_night: 120,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        property_type: 'apartment',
        amenities: ['wifi', 'kitchen', 'parking'],
        house_rules: 'No smoking, No pets, Quiet hours 10 PM - 8 AM',
        check_in_time: '15:00',
        check_out_time: '11:00',
        host_id: '1'
      };

      setProperty(sampleProperty);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-96 bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="h-64 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Property not found</h1>
          <Button onClick={() => navigate('/search')} className="btn-primary">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Property Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.title}</h1>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{property.city}, {property.country}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
              <span>4.8 (24 reviews)</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-96 lg:h-80">
            {/* Main Image */}
            <div className="lg:col-span-2 lg:row-span-2">
              <img
                src={sampleImages[selectedImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImageIndex(0)}
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="hidden lg:block">
              <img
                src={sampleImages[1]}
                alt="Property view 2"
                className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImageIndex(1)}
              />
            </div>
            <div className="hidden lg:block">
              <img
                src={sampleImages[2]}
                alt="Property view 3"
                className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImageIndex(2)}
              />
            </div>
            <div className="hidden lg:block">
              <img
                src={sampleImages[3]}
                alt="Property view 4"
                className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImageIndex(3)}
              />
            </div>
            <div className="hidden lg:block">
              <img
                src={sampleImages[4]}
                alt="Property view 5"
                className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImageIndex(4)}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)} hosted by Sarah
                </h2>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">S</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-slate-600 mb-4">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{property.max_guests} guests</span>
                </div>
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{property.bathrooms} bathroom{property.bathrooms > 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <p className="text-slate-700 leading-relaxed">{property.description}</p>
            </Card>

            {/* Amenities */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.amenities.map(amenityId => {
                  const amenity = amenitiesList.find(a => a.id === amenityId);
                  if (!amenity) return null;
                  
                  const Icon = amenity.icon;
                  return (
                    <div key={amenityId} className="flex items-center">
                      <Icon className="w-5 h-5 mr-3 text-slate-600" />
                      <span className="text-slate-700">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* House Rules */}
            {property.house_rules && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">House rules</h3>
                <div className="space-y-2">
                  {property.house_rules.split(',').map((rule, index) => (
                    <p key={index} className="text-slate-700">• {rule.trim()}</p>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">Check-in:</span> {property.check_in_time || '3:00 PM'}
                  </div>
                  <div>
                    <span className="font-medium">Check-out:</span> {property.check_out_time || '11:00 AM'}
                  </div>
                </div>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-xl font-semibold text-slate-900">4.8 • 24 reviews</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Cleanliness</span>
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div className="h-2 bg-slate-800 rounded-full" style={{ width: '98%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Communication</span>
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div className="h-2 bg-slate-800 rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Check-in</span>
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div className="h-2 bg-slate-800 rounded-full" style={{ width: '98%' }} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Accuracy</span>
                      <span className="text-sm font-medium">4.7</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div className="h-2 bg-slate-800 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Location</span>
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div className="h-2 bg-slate-800 rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Value</span>
                      <span className="text-sm font-medium">4.6</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div className="h-2 bg-slate-800 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-2xl font-bold text-slate-900">${property.price_per_night}</span>
                  <span className="text-slate-600 ml-1">/ night</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm font-medium">4.8</span>
                </div>
              </div>

              <Button
                onClick={() => setShowBooking(true)}
                className="btn-primary w-full mb-4 h-12"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Now
              </Button>

              <p className="text-center text-sm text-slate-600 mb-4">You won't be charged yet</p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">${property.price_per_night} × 5 nights</span>
                  <span className="text-slate-900">${property.price_per_night * 5}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cleaning fee</span>
                  <span className="text-slate-900">$50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Service fee</span>
                  <span className="text-slate-900">$30</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(property.price_per_night * 5) + 50 + 30}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Flow Modal */}
      {showBooking && (
        <BookingFlow
          property={property}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetail;