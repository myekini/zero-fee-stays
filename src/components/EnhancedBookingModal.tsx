import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isBefore, isAfter, differenceInDays } from "date-fns";

interface Property {
  id: string;
  title: string;
  price_per_night: number;
  max_guests: number;
  images: string[];
  location: string;
  rating?: number;
  review_count?: number;
  cleaning_fee?: number;
  service_fee_percentage?: number;
  cancellation_policy?: string;
  check_in_time?: string;
  check_out_time?: string;
  house_rules?: string[];
  amenities?: string[];
}

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
  totalNights: number;
  totalAmount: number;
  cleaningFee: number;
  serviceFee: number;
  subtotal: number;
}

interface AvailabilityData {
  available: boolean;
  conflicts: Array<{
    checkIn: string;
    checkOut: string;
  }>;
}

interface EnhancedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onBookingConfirm?: (details: any) => void;
}

const EnhancedBookingModal: React.FC<EnhancedBookingModalProps> = ({
  isOpen,
  onClose,
  property,
  onBookingConfirm,
}) => {
  const [step, setStep] = useState<
    "dates" | "guests" | "review" | "payment" | "confirmation"
  >("dates");
  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: "",
    checkOut: "",
    guests: 1,
    totalNights: 0,
    totalAmount: 0,
    cleaningFee: property.cleaning_fee || 50,
    serviceFee: 0,
    subtotal: 0,
  });

  const [availability, setAvailability] = useState<AvailabilityData | null>(
    null
  );
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const validateDates = useCallback(
    (checkIn: string, checkOut: string): Record<string, string> => {
      const errors: Record<string, string> = {};
      const today = new Date();
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isBefore(checkInDate, today)) {
        errors.checkIn = "Check-in date cannot be in the past";
      }

      if (isBefore(checkOutDate, checkInDate)) {
        errors.checkOut = "Check-out date must be after check-in date";
      }

      if (differenceInDays(checkOutDate, checkInDate) > 30) {
        errors.checkOut = "Maximum stay is 30 nights";
      }

      if (differenceInDays(checkOutDate, checkInDate) < 1) {
        errors.checkOut = "Minimum stay is 1 night";
      }

      return errors;
    },
    []
  );

  const checkAvailability = async (checkIn: string, checkOut: string) => {
    setIsCheckingAvailability(true);
    setErrors({});

    try {
      const dateErrors = validateDates(checkIn, checkOut);
      if (Object.keys(dateErrors).length > 0) {
        setErrors(dateErrors);
        setAvailability(null);
        return;
      }

      // Check for existing bookings in the date range
      const { data: conflicts, error } = await supabase
        .from("bookings")
        .select("check_in_date, check_out_date")
        .eq("property_id", property.id)
        .in("status", ["confirmed", "pending"])
        .or(`check_in_date.lte.${checkOut},check_out_date.gte.${checkIn}`);

      if (error) throw error;

      const hasConflicts = conflicts && conflicts.length > 0;
      setAvailability({
        available: !hasConflicts,
        conflicts: hasConflicts ? conflicts : [],
      });

      if (!hasConflicts) {
        calculateTotal(checkIn, checkOut, bookingData.guests);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast({
        title: "Error",
        description: "Failed to check availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const calculateTotal = (
    checkIn: string,
    checkOut: string,
    guests: number
  ) => {
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    const subtotal = property.price_per_night * nights;
    const cleaningFee = property.cleaning_fee || 50;
    const serviceFeePercentage = property.service_fee_percentage || 12;
    const serviceFee = Math.round(subtotal * (serviceFeePercentage / 100));
    const total = subtotal + cleaningFee + serviceFee;

    setBookingData((prev) => ({
      ...prev,
      checkIn,
      checkOut,
      guests,
      totalNights: nights,
      subtotal,
      cleaningFee,
      serviceFee,
      totalAmount: total,
    }));
  };

  const handleDateChange = (type: "checkIn" | "checkOut", value: string) => {
    const newData = { ...bookingData, [type]: value };
    setBookingData(newData);

    if (newData.checkIn && newData.checkOut) {
      checkAvailability(newData.checkIn, newData.checkOut);
    }
  };

  const handleGuestChange = (value: number) => {
    if (value >= 1 && value <= property.max_guests) {
      setBookingData((prev) => ({ ...prev, guests: value }));
      if (bookingData.checkIn && bookingData.checkOut) {
        calculateTotal(bookingData.checkIn, bookingData.checkOut, value);
      }
    }
  };

  const handleNext = () => {
    if (
      step === "dates" &&
      availability?.available &&
      bookingData.totalNights > 0
    ) {
      setStep("guests");
    } else if (step === "guests") {
      setStep("review");
    } else if (step === "review") {
      setStep("payment");
    }
  };

  const handleBack = () => {
    if (step === "guests") setStep("dates");
    if (step === "review") setStep("guests");
    if (step === "payment") setStep("review");
  };

  const createBooking = async () => {
    if (!userProfile) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your booking.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          property_id: property.id,
          guest_id: userProfile.id,
          host_id: property.host_id, // You'll need to add this to property data
          check_in_date: bookingData.checkIn,
          check_out_date: bookingData.checkOut,
          guests_count: bookingData.guests,
          total_amount: bookingData.totalAmount,
          status: "pending",
          special_requests: "", // Add special requests field if needed
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create Stripe payment session
      const response = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          propertyId: property.id,
          propertyTitle: property.title,
          totalAmount: bookingData.totalAmount,
          guestName: `${userProfile.first_name} ${userProfile.last_name}`,
          guestEmail: userProfile.email || "",
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment session");
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Book Your Stay</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Property Info */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{property.title}</h3>
              <div className="flex items-center text-gray-600 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {property.location}
              </div>
              {property.rating && (
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {property.rating} ({property.review_count} reviews)
                  </span>
                </div>
              )}
              <p className="text-gray-600 mt-1">
                ${property.price_per_night} per night
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="p-6">
          {/* Step Indicators */}
          <div className="flex items-center justify-center mb-8">
            {["dates", "guests", "review", "payment", "confirmation"].map(
              (stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === stepName
                        ? "bg-blue-600 text-white"
                        : step === "confirmation" ||
                            ["dates", "guests", "review", "payment"].indexOf(
                              step
                            ) > index
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step === "confirmation" ||
                    ["dates", "guests", "review", "payment"].indexOf(step) >
                      index ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 4 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        ["dates", "guests", "review", "payment"].indexOf(step) >
                        index
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>

          {/* Step Content */}
          {step === "dates" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Select Dates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <Input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) =>
                      handleDateChange("checkIn", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className={errors.checkIn ? "border-red-500" : ""}
                  />
                  {errors.checkIn && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.checkIn}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <Input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) =>
                      handleDateChange("checkOut", e.target.value)
                    }
                    min={
                      bookingData.checkIn ||
                      new Date().toISOString().split("T")[0]
                    }
                    className={errors.checkOut ? "border-red-500" : ""}
                  />
                  {errors.checkOut && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.checkOut}
                    </p>
                  )}
                </div>
              </div>

              {/* Availability Status */}
              {isCheckingAvailability && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Checking availability...</span>
                </div>
              )}

              {availability && !isCheckingAvailability && (
                <Alert
                  className={
                    availability.available
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }
                >
                  <AlertCircle
                    className={`w-4 h-4 ${availability.available ? "text-green-600" : "text-red-600"}`}
                  />
                  <AlertDescription
                    className={
                      availability.available ? "text-green-800" : "text-red-800"
                    }
                  >
                    {availability.available
                      ? `${bookingData.totalNights} night${bookingData.totalNights > 1 ? "s" : ""} available`
                      : "Selected dates are not available"}
                  </AlertDescription>
                </Alert>
              )}

              {availability?.conflicts && availability.conflicts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">
                    Conflicting Bookings:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {availability.conflicts.map((conflict, index) => (
                      <li key={index}>
                        {format(new Date(conflict.checkIn), "MMM dd")} -{" "}
                        {format(new Date(conflict.checkOut), "MMM dd, yyyy")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === "guests" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Number of Guests
              </h3>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGuestChange(bookingData.guests - 1)}
                  disabled={bookingData.guests <= 1}
                >
                  -
                </Button>
                <span className="text-2xl font-semibold">
                  {bookingData.guests}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGuestChange(bookingData.guests + 1)}
                  disabled={bookingData.guests >= property.max_guests}
                >
                  +
                </Button>
                <span className="text-gray-600">
                  of {property.max_guests} guests
                </span>
              </div>

              {/* Guest Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">
                  Guest Guidelines
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Maximum {property.max_guests} guests allowed</li>
                  <li>• Check-in: {property.check_in_time || "3:00 PM"}</li>
                  <li>• Check-out: {property.check_out_time || "11:00 AM"}</li>
                </ul>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Review Your Booking
              </h3>

              {/* Booking Summary */}
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Booking Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in</span>
                    <span>
                      {format(new Date(bookingData.checkIn), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out</span>
                    <span>
                      {format(new Date(bookingData.checkOut), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span>
                      {bookingData.guests} guest
                      {bookingData.guests > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights</span>
                    <span>
                      {bookingData.totalNights} night
                      {bookingData.totalNights > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Cancellation Policy */}
              {property.cancellation_policy && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Cancellation Policy
                  </h4>
                  <p className="text-sm text-gray-600">
                    {property.cancellation_policy}
                  </p>
                </Card>
              )}

              {/* Security Notice */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Your payment is secure and encrypted</span>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          {step !== "confirmation" && bookingData.totalAmount > 0 && (
            <Card className="p-4 mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Price Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>
                    ${property.price_per_night} × {bookingData.totalNights}{" "}
                    nights
                  </span>
                  <span>${bookingData.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>${bookingData.cleaningFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${bookingData.serviceFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${bookingData.totalAmount}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            {step !== "dates" && step !== "confirmation" && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <div className="ml-auto">
              {step === "dates" && (
                <Button
                  onClick={handleNext}
                  disabled={
                    !bookingData.checkIn ||
                    !bookingData.checkOut ||
                    !availability?.available ||
                    isCheckingAvailability
                  }
                >
                  Continue
                </Button>
              )}
              {step === "guests" && (
                <Button onClick={handleNext}>Continue to Review</Button>
              )}
              {step === "review" && (
                <Button
                  onClick={createBooking}
                  disabled={isProcessing}
                  className="min-w-[140px]"
                >
                  {isProcessing
                    ? "Processing..."
                    : `Book for $${bookingData.totalAmount}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookingModal;
