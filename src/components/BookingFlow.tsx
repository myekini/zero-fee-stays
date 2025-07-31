import React, { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import AvailabilityCalendar from './AvailabilityCalendar';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  price_per_night: number;
  max_guests: number;
  check_in_time?: string;
  check_out_time?: string;
}

interface BookingFlowProps {
  property: Property;
  onClose: () => void;
}

interface BookingData {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  agreedToTerms: boolean;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ property, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: null,
    checkOut: null,
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
    agreedToTerms: false
  });
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Load existing bookings and blocked dates
  useEffect(() => {
    loadUnavailableDates();
  }, [property.id]);

  const loadUnavailableDates = async () => {
    try {
      // Load confirmed bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('check_in_date, check_out_date')
        .eq('property_id', property.id)
        .in('status', ['pending', 'confirmed']);

      if (bookingsError) throw bookingsError;

      // Load blocked dates
      const { data: blocked, error: blockedError } = await supabase
        .from('availability')
        .select('date')
        .eq('property_id', property.id)
        .eq('is_available', false);

      if (blockedError) throw blockedError;

      // Convert booking date ranges to individual dates
      const booked: Date[] = [];
      bookings?.forEach(booking => {
        const start = new Date(booking.check_in_date);
        const end = new Date(booking.check_out_date);
        const days = differenceInDays(end, start);
        
        for (let i = 0; i < days; i++) {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          booked.push(date);
        }
      });

      setBookedDates(booked);
      setBlockedDates(blocked?.map(b => new Date(b.date)) || []);
    } catch (error) {
      console.error('Error loading unavailable dates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar data. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return null;
    
    const nights = differenceInDays(bookingData.checkOut, bookingData.checkIn);
    const subtotal = nights * property.price_per_night;
    const cleaningFee = 50; // Static cleaning fee for demo
    const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
    
    return {
      nights,
      subtotal,
      cleaningFee,
      serviceFee,
      total: subtotal + cleaningFee + serviceFee
    };
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!bookingData.checkIn) newErrors.checkIn = 'Please select a check-in date';
      if (!bookingData.checkOut) newErrors.checkOut = 'Please select a check-out date';
      if (bookingData.guests < 1 || bookingData.guests > property.max_guests) {
        newErrors.guests = `Number of guests must be between 1 and ${property.max_guests}`;
      }
    }

    if (stepNumber === 2) {
      if (!bookingData.guestName.trim()) newErrors.guestName = 'Name is required';
      if (!bookingData.guestEmail.trim()) newErrors.guestEmail = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(bookingData.guestEmail)) newErrors.guestEmail = 'Invalid email format';
      if (!bookingData.guestPhone.trim()) newErrors.guestPhone = 'Phone number is required';
      if (!bookingData.agreedToTerms) newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      const total = calculateTotal();
      if (!total) return;
      
      // Create booking record first
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          property_id: property.id,
          check_in_date: bookingData.checkIn?.toISOString().split('T')[0],
          check_out_date: bookingData.checkOut?.toISOString().split('T')[0],
          guests_count: bookingData.guests,
          guest_id: '00000000-0000-0000-0000-000000000000', // Temporary guest ID for demo
          host_id: '00000000-0000-0000-0000-000000000000', // Temporary host ID for demo
          guest_phone: bookingData.guestPhone,
          special_requests: bookingData.specialRequests,
          total_amount: total.total,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create Stripe payment session via Python API
      const response = await fetch('http://localhost:8000/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          bookingId: booking.id,
          propertyId: property.id,
          propertyTitle: property.title,
          totalAmount: total.total,
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          checkIn: bookingData.checkIn?.toISOString().split('T')[0],
          checkOut: bookingData.checkOut?.toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const paymentData = await response.json();

      // Redirect to Stripe Checkout
      if (paymentData?.url) {
        window.open(paymentData.url, '_blank');
        setStep(4); // Show success step
        toast({
          title: 'Redirecting to Payment',
          description: 'Please complete your payment in the new tab.',
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: 'There was an error processing your booking. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRangeSelect = (range: { checkIn: Date | null; checkOut: Date | null }) => {
    setBookingData(prev => ({
      ...prev,
      checkIn: range.checkIn,
      checkOut: range.checkOut
    }));
    setErrors(prev => ({ ...prev, checkIn: '', checkOut: '' }));
  };

  const updateBookingData = (field: keyof BookingData, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Step 1: Date & Guest Selection
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Select your dates</h2>
        <p className="text-slate-600">Choose your check-in and check-out dates</p>
      </div>

      <AvailabilityCalendar
        propertyId={property.id}
        selectedRange={{ checkIn: bookingData.checkIn, checkOut: bookingData.checkOut }}
        onRangeSelect={handleRangeSelect}
        bookedDates={bookedDates}
        blockedDates={blockedDates}
        minStay={1}
      />

      {(errors.checkIn || errors.checkOut) && (
        <div className="text-red-600 text-sm">
          {errors.checkIn || errors.checkOut}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="guests" className="text-base font-medium">Number of guests</Label>
          <Select value={bookingData.guests.toString()} onValueChange={(value) => updateBookingData('guests', parseInt(value))}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: property.max_guests }, (_, i) => i + 1).map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} guest{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.guests && <p className="text-red-600 text-sm mt-1">{errors.guests}</p>}
        </div>

        {bookingData.checkIn && bookingData.checkOut && calculateTotal() && (
          <Card className="p-4 bg-slate-50">
            <h3 className="font-semibold text-slate-900 mb-3">Price breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>${property.price_per_night} × {calculateTotal()!.nights} nights</span>
                <span>${calculateTotal()!.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleaning fee</span>
                <span>${calculateTotal()!.cleaningFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>${calculateTotal()!.serviceFee}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${calculateTotal()!.total}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );

  // Step 2: Guest Information
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Guest information</h2>
        <p className="text-slate-600">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="guestName">Full Name *</Label>
          <Input
            id="guestName"
            value={bookingData.guestName}
            onChange={(e) => updateBookingData('guestName', e.target.value)}
            className="mt-1"
            placeholder="Enter your full name"
          />
          {errors.guestName && <p className="text-red-600 text-sm mt-1">{errors.guestName}</p>}
        </div>

        <div>
          <Label htmlFor="guestEmail">Email Address *</Label>
          <Input
            id="guestEmail"
            type="email"
            value={bookingData.guestEmail}
            onChange={(e) => updateBookingData('guestEmail', e.target.value)}
            className="mt-1"
            placeholder="Enter your email"
          />
          {errors.guestEmail && <p className="text-red-600 text-sm mt-1">{errors.guestEmail}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="guestPhone">Phone Number *</Label>
        <Input
          id="guestPhone"
          type="tel"
          value={bookingData.guestPhone}
          onChange={(e) => updateBookingData('guestPhone', e.target.value)}
          className="mt-1"
          placeholder="Enter your phone number"
        />
        {errors.guestPhone && <p className="text-red-600 text-sm mt-1">{errors.guestPhone}</p>}
      </div>

      <div>
        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
        <Textarea
          id="specialRequests"
          value={bookingData.specialRequests}
          onChange={(e) => updateBookingData('specialRequests', e.target.value)}
          className="mt-1"
          placeholder="Any special requests or requirements?"
          rows={3}
        />
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={bookingData.agreedToTerms}
          onCheckedChange={(checked) => updateBookingData('agreedToTerms', checked)}
        />
        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
          I agree to the <span className="text-blue-600 underline">Terms and Conditions</span> and <span className="text-blue-600 underline">Cancellation Policy</span>
        </Label>
      </div>
      {errors.terms && <p className="text-red-600 text-sm">{errors.terms}</p>}

      {/* Booking Summary */}
      <Card className="p-4 bg-slate-50">
        <h3 className="font-semibold text-slate-900 mb-3">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Check-in</span>
            <span>{bookingData.checkIn && format(bookingData.checkIn, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out</span>
            <span>{bookingData.checkOut && format(bookingData.checkOut, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span>Guests</span>
            <span>{bookingData.guests}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>${calculateTotal()?.total || 0}</span>
          </div>
        </div>
      </Card>
    </div>
  );

  // Step 3: Payment
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment</h2>
        <p className="text-slate-600">Secure payment processing with Stripe</p>
      </div>

      <Card className="p-6 border-2 border-green-200 bg-green-50">
        <div className="flex items-center gap-3 text-green-800 mb-3">
          <CreditCard className="w-5 h-5" />
          <span className="font-semibold">Secure Payment</span>
        </div>
        <p className="text-green-700 text-sm">
          Your payment is processed securely through Stripe. You will be redirected to complete your payment after confirming this booking.
        </p>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Final Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Property</span>
            <span className="text-right">{property.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Dates</span>
            <span>
              {bookingData.checkIn && bookingData.checkOut && 
                `${format(bookingData.checkIn, 'MMM dd')} - ${format(bookingData.checkOut, 'MMM dd, yyyy')}`
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span>Guests</span>
            <span>{bookingData.guests}</span>
          </div>
          <div className="flex justify-between">
            <span>Guest</span>
            <span>{bookingData.guestName}</span>
          </div>
          <div className="flex justify-between">
            <span>Email</span>
            <span>{bookingData.guestEmail}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold text-lg">
            <span>Total (CAD)</span>
            <span>${calculateTotal()?.total || 0}</span>
          </div>
        </div>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Important:</strong> By proceeding with payment, you agree to our terms and conditions. 
          Your booking will be confirmed once payment is successfully processed.
        </p>
      </div>
    </div>
  );

  // Step 4: Success
  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Required!</h2>
        <p className="text-slate-600">
          Please complete your payment in the new tab that opened. Your booking will be confirmed once payment is processed.
        </p>
      </div>

      <Card className="p-4 text-left">
        <h3 className="font-semibold text-slate-900 mb-3">Booking Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Property</span>
            <span>{property.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Dates</span>
            <span>
              {bookingData.checkIn && bookingData.checkOut && 
                `${format(bookingData.checkIn, 'MMM dd')} - ${format(bookingData.checkOut, 'MMM dd, yyyy')}`
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span>Guest</span>
            <span>{bookingData.guestName}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="text-yellow-600 font-medium">Pending Payment</span>
          </div>
        </div>
      </Card>

      <Button onClick={onClose} className="btn-primary">
        Close
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {step > 1 && step < 4 && (
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-900">{property.title}</h1>
                <p className="text-slate-600 text-sm">
                  Step {step} of {step === 4 ? 4 : 3}
                </p>
              </div>
            </div>
            
            {step < 4 && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>

          {step < 4 && (
            <div className="mt-4">
              <div className="flex space-x-2">
                {[1, 2, 3].map(stepNum => (
                  <div
                    key={stepNum}
                    className={`flex-1 h-2 rounded-full ${
                      stepNum <= step ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {step < 4 && (
          <div className="p-6 border-t border-slate-200">
            <div className="flex justify-between">
              <div></div>
              <div className="flex gap-3">
                {step < 3 && (
                  <Button 
                    onClick={handleNext}
                    className="btn-primary"
                    disabled={loading}
                  >
                    Continue
                  </Button>
                )}
                {step === 3 && (
                  <Button 
                    onClick={handleSubmit}
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Booking'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;