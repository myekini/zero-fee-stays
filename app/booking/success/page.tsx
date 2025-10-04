"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await fetch("/api/payments/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(data);

        toast({
          title: "Booking Confirmed! 🎉",
          description:
            "Your payment was successful. Check your email for details.",
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast({
        title: "Verification Error",
        description:
          "There was an issue verifying your payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-neutral-600 text-lg">
            Your payment was successful and your booking is confirmed.
          </p>
        </motion.div>

        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-brand-600" />
                  <div>
                    <p className="font-medium">Check-in & Check-out</p>
                    <p className="text-neutral-600">
                      {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'} -{" "}
                      {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  <div>
                    <p className="font-medium">Property</p>
                    <p className="text-neutral-600">{booking.propertyTitle || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-brand-600" />
                  <div>
                    <p className="font-medium">Guests</p>
                    <p className="text-neutral-600">{booking.guestsCount || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-brand-600" />
                  <div>
                    <p className="font-medium">Total Amount</p>
                    <p className="text-neutral-600">
                      ${booking.totalAmount ? Number(booking.totalAmount).toLocaleString() : '0'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              🎉 You saved on platform fees! No additional charges.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <a href="/bookings">View My Bookings</a>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/">Continue Browsing</a>
            </Button>
          </div>

          <p className="text-sm text-neutral-600">
            A confirmation email has been sent to your email address with all
            the details.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
