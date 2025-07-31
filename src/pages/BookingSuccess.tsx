import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Calendar, User, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import Header from '@/components/Header';

interface BookingDetails {
  id: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalAmount: number;
}

const BookingSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const { toast } = useToast();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setLoading(false);
      toast({
        title: 'Error',
        description: 'No payment session found.',
        variant: 'destructive'
      });
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/payments/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();

      setPaymentStatus(data.paymentStatus);
      setBooking(data.booking);

      if (data.paymentStatus === 'paid') {
        toast({
          title: 'Payment Successful!',
          description: 'Your booking has been confirmed.',
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: 'Verification Error',
        description: 'Unable to verify payment status. Please contact support.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-slate-600">Verifying your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {paymentStatus === 'paid' ? (
          // Success State
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
              <p className="text-slate-600">
                Your payment has been processed successfully and your booking is confirmed.
              </p>
            </div>

            {booking && (
              <Card className="p-6 text-left">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Booking Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Check-in & Check-out</p>
                      <p className="text-slate-600">
                        {format(new Date(booking.checkInDate), 'MMM dd, yyyy')} - {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Guests</p>
                      <p className="text-slate-600">{booking.guestsCount} guest{booking.guestsCount > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Total Paid</p>
                      <p className="text-slate-600">${booking.totalAmount} CAD</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Status</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>What's next?</strong> You'll receive a confirmation email shortly with all the details. 
                The host will also be notified of your confirmed booking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="btn-primary">
                <Link to="/">Back to Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/search">Find More Properties</Link>
              </Button>
            </div>
          </div>
        ) : (
          // Payment Failed or Pending
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Issue</h1>
              <p className="text-slate-600">
                There was an issue processing your payment. Please try again or contact support.
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <span className="capitalize font-medium text-red-600">{paymentStatus || 'Unknown'}</span>
                </div>
                {booking && (
                  <div className="flex justify-between">
                    <span>Booking Status</span>
                    <span className="capitalize font-medium">{booking.status}</span>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="btn-primary">
                <Link to="/">Back to Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/search">Try Another Property</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSuccess;