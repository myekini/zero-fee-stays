import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, Mail, Clock, DollarSign, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
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
} from '@/components/ui/alert-dialog';

interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_amount: number;
  status: string;
  created_at: string;
  guest_phone?: string;
  special_requests?: string;
  properties: {
    title: string;
    location: string;
    city: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
    phone?: string;
  };
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      // Get current user's profile to find their host properties
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get host profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get bookings for this host's properties
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties!inner(
            title,
            location,
            city,
            host_id
          ),
          profiles!bookings_guest_id_fkey(
            first_name,
            last_name,
            phone
          )
        `)
        .eq('properties.host_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus as any }
            : booking
        )
      );

      toast({
        title: 'Success',
        description: `Booking ${newStatus} successfully.`,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status.',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const getTabCount = (status: string) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  const renderBookingCard = (booking: Booking) => {
    const nights = differenceInDays(new Date(booking.check_out_date), new Date(booking.check_in_date));
    const guestName = `${booking.profiles?.first_name || ''} ${booking.profiles?.last_name || ''}`.trim();

    return (
      <Card key={booking.id} className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">{booking.properties.title}</h3>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-slate-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{booking.properties.location}, {booking.properties.city}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900">${booking.total_amount}</div>
            <div className="text-sm text-slate-500">Total</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="font-medium">{guestName || 'Guest'}</span>
            </div>
            {booking.guest_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">{booking.guest_phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">{booking.guests_count} guest{booking.guests_count > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm">
                {format(new Date(booking.check_in_date), 'MMM dd')} - {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">{nights} night{nights > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">${Math.round(booking.total_amount / nights)}/night</span>
            </div>
          </div>
        </div>

        {booking.special_requests && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Special Requests:</strong> {booking.special_requests}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {booking.status === 'pending' && (
            <>
              <Button
                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Decline
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Decline Booking</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to decline this booking? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Decline Booking
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          
          {booking.status === 'confirmed' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Cancel Booking
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this confirmed booking? This may affect your cancellation rate.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cancel Booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button variant="outline" className="ml-auto">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Guest
          </Button>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Management</h1>
        <p className="text-slate-600">Manage your property bookings and guest requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending" className="relative">
            Pending
            {getTabCount('pending') > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                {getTabCount('pending')}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed
            {getTabCount('confirmed') > 0 && (
              <Badge className="ml-2 bg-green-500 text-white text-xs">
                {getTabCount('confirmed')}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No {activeTab} bookings</h3>
                <p>You don't have any {activeTab} bookings at the moment.</p>
              </div>
            </Card>
          ) : (
            filteredBookings.map(renderBookingCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingManagement;