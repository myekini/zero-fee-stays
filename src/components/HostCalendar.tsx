import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Settings, DollarSign, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isAvailable: boolean;
  hasBooking: boolean;
  bookingStatus?: string;
  customPrice?: number;
  note?: string;
}

interface Property {
  id: string;
  title: string;
  price_per_night: number;
}

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
}

interface AvailabilityRule {
  date: string;
  is_available: boolean;
  custom_price?: number;
  note?: string;
}

const HostCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRule[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [bulkAction, setBulkAction] = useState<'block' | 'unblock' | 'price' | null>(null);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkNote, setBulkNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadCalendarData();
    }
  }, [currentDate, selectedProperty]);

  const loadProperties = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price_per_night')
        .eq('host_id', profile.id)
        .eq('is_active', true);

      if (error) throw error;
      setProperties(data || []);
      if (data && data.length > 0) {
        setSelectedProperty(data[0]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties.',
        variant: 'destructive'
      });
    }
  };

  const loadCalendarData = async () => {
    if (!selectedProperty) return;

    try {
      setLoading(true);

      // Load bookings for the month
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('id, check_in_date, check_out_date, status')
        .eq('property_id', selectedProperty.id)
        .gte('check_in_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('check_out_date', format(monthEnd, 'yyyy-MM-dd'));

      if (bookingError) throw bookingError;

      // Load availability rules
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability')
        .select('date, is_available, custom_price')
        .eq('property_id', selectedProperty.id)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));

      if (availabilityError) throw availabilityError;

      setBookings(bookingData || []);
      setAvailability(availabilityData || []);
      generateCalendarDays(bookingData || [], availabilityData || []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (bookings: Booking[], availability: AvailabilityRule[]) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const today = new Date();

    const calendarDays = days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Check if there's a booking on this date
      const hasBooking = bookings.some(booking => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        return date >= checkIn && date < checkOut;
      });

      const booking = bookings.find(booking => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        return date >= checkIn && date < checkOut;
      });

      // Check availability rules
      const availabilityRule = availability.find(rule => rule.date === dateStr);
      const isAvailable = availabilityRule ? availabilityRule.is_available : true;

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isSameDay(date, today),
        isAvailable,
        hasBooking,
        bookingStatus: booking?.status,
        customPrice: availabilityRule?.custom_price
      };
    });

    setCalendarDays(calendarDays);
  };

  const getDayClassName = (day: CalendarDay) => {
    let baseClass = 'h-20 p-2 border border-slate-200 cursor-pointer transition-colors';
    
    if (!day.isCurrentMonth) {
      baseClass += ' bg-slate-50 text-slate-400';
    } else if (day.hasBooking) {
      switch (day.bookingStatus) {
        case 'confirmed':
          baseClass += ' bg-blue-100 text-blue-900 border-blue-200';
          break;
        case 'pending':
          baseClass += ' bg-yellow-100 text-yellow-900 border-yellow-200';
          break;
        default:
          baseClass += ' bg-gray-100 text-gray-900 border-gray-200';
      }
    } else if (!day.isAvailable) {
      baseClass += ' bg-red-100 text-red-900 border-red-200';
    } else {
      baseClass += ' bg-green-100 text-green-900 border-green-200 hover:bg-green-200';
    }

    if (day.isToday) {
      baseClass += ' ring-2 ring-blue-500';
    }

    if (selectedDates.some(selectedDate => isSameDay(selectedDate, day.date))) {
      baseClass += ' ring-2 ring-purple-500 bg-purple-100';
    }

    return baseClass;
  };

  const handleDateClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;

    const isSelected = selectedDates.some(selectedDate => isSameDay(selectedDate, day.date));
    
    if (isSelected) {
      setSelectedDates(prev => prev.filter(date => !isSameDay(date, day.date)));
    } else {
      setSelectedDates(prev => [...prev, day.date]);
    }
  };

  const applyBulkAction = async () => {
    if (selectedDates.length === 0 || !selectedProperty) return;

    try {
      setLoading(true);

      const updates = selectedDates.map(date => ({
        property_id: selectedProperty.id,
        date: format(date, 'yyyy-MM-dd'),
        is_available: bulkAction !== 'block',
        custom_price: bulkAction === 'price' && bulkPrice ? parseFloat(bulkPrice) : null
      }));

      const { error } = await supabase
        .from('availability')
        .upsert(updates, { onConflict: 'property_id,date' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Updated ${selectedDates.length} dates successfully.`,
      });

      setSelectedDates([]);
      setBulkAction(null);
      setBulkPrice('');
      setBulkNote('');
      loadCalendarData();
    } catch (error) {
      console.error('Error applying bulk action:', error);
      toast({
        title: 'Error',
        description: 'Failed to update dates.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    setSelectedDates([]);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Calendar Management</h1>
          <p className="text-slate-600">Manage availability and pricing for your properties</p>
        </div>
        
        {properties.length > 1 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="property-select">Property:</Label>
            <select
              id="property-select"
              className="px-3 py-2 border border-slate-300 rounded-md"
              value={selectedProperty?.id || ''}
              onChange={(e) => {
                const property = properties.find(p => p.id === e.target.value);
                setSelectedProperty(property || null);
              }}
            >
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedProperty && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{selectedProperty.title}</h2>
            <div className="text-sm text-slate-600">
              Base Rate: ${selectedProperty.price_per_night}/night
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={() => navigateMonth('prev')}
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h3 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            
            <Button
              variant="outline"
              onClick={() => navigateMonth('next')}
              disabled={loading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Blocked</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-slate-300 rounded-lg overflow-hidden">
            {/* Week headers */}
            {weekDays.map(day => (
              <div key={day} className="bg-slate-100 p-2 text-center font-medium text-slate-700 border-b border-slate-300">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={getDayClassName(day)}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{format(day.date, 'd')}</span>
                  {day.customPrice && (
                    <span className="text-xs">${day.customPrice}</span>
                  )}
                </div>
                {day.hasBooking && (
                  <div className="text-xs mt-1 capitalize">
                    {day.bookingStatus}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedDates.length > 0 && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">
                  {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDates([])}
                >
                  Clear Selection
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={bulkAction === 'block' ? 'default' : 'outline'}
                  onClick={() => setBulkAction('block')}
                >
                  Block Dates
                </Button>
                <Button
                  variant={bulkAction === 'unblock' ? 'default' : 'outline'}
                  onClick={() => setBulkAction('unblock')}
                >
                  Unblock Dates
                </Button>
                <Button
                  variant={bulkAction === 'price' ? 'default' : 'outline'}
                  onClick={() => setBulkAction('price')}
                >
                  Set Custom Price
                </Button>
              </div>

              {bulkAction === 'price' && (
                <div className="mt-4 flex items-center gap-2">
                  <Label htmlFor="bulk-price">Price per night:</Label>
                  <Input
                    id="bulk-price"
                    type="number"
                    placeholder="0.00"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="w-32"
                  />
                </div>
              )}

              <Button
                onClick={applyBulkAction}
                disabled={loading || !bulkAction}
                className="mt-4"
              >
                Apply Changes
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default HostCalendar;