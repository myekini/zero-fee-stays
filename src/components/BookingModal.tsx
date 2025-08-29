import React, { useState } from "react";
import { X, Calendar, Users, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { paymentService, BookingRequest } from "@/services/paymentService";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    price_per_night: number;
    max_guests: number;
    images: string[];
  };
  onBookingConfirm?: (details: any) => void;
}

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
  totalNights: number;
  totalAmount: number;
  cleaningFee: number;
  serviceFee: number;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  property,
  onBookingConfirm,
}) => {
  const [step, setStep] = useState<
    "dates" | "guests" | "payment" | "confirmation"
  >("dates");
  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: "",
    checkOut: "",
    guests: 1,
    totalNights: 0,
    totalAmount: 0,
    cleaningFee: 50,
    serviceFee: 0,
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
    email: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const calculateTotal = () => {
    const nights = bookingData.totalNights;
    const basePrice = property.price_per_night * nights;
    const cleaningFee = bookingData.cleaningFee;
    const serviceFee = Math.round(basePrice * 0.12); // 12% service fee
    const total = basePrice + cleaningFee + serviceFee;

    setBookingData((prev) => ({
      ...prev,
      totalAmount: total,
      serviceFee,
    }));
  };

  const handleDateChange = (type: "checkIn" | "checkOut", value: string) => {
    const newData = { ...bookingData, [type]: value };

    if (newData.checkIn && newData.checkOut) {
      const checkIn = new Date(newData.checkIn);
      const checkOut = new Date(newData.checkOut);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (nights > 0) {
        newData.totalNights = nights;
        setBookingData(newData);
        calculateTotal();
      }
    } else {
      setBookingData(newData);
    }
  };

  const handleGuestChange = (value: number) => {
    if (value >= 1 && value <= property.max_guests) {
      setBookingData((prev) => ({ ...prev, guests: value }));
    }
  };

  const handleNext = () => {
    if (
      step === "dates" &&
      bookingData.checkIn &&
      bookingData.checkOut &&
      bookingData.totalNights > 0
    ) {
      setStep("guests");
    } else if (step === "guests") {
      setStep("payment");
    }
  };

  const handleBack = () => {
    if (step === "guests") setStep("dates");
    if (step === "payment") setStep("guests");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Prepare booking data for the backend
      const bookingRequest: BookingRequest = {
        propertyId: property.id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalAmount: bookingData.totalAmount,
        guestName: paymentData.name,
        guestEmail: paymentData.email,
      };

      // Create booking and get payment session
      console.log("Submitting booking:", bookingRequest);
      const paymentSession = await paymentService.completePaymentFlow(bookingRequest);
      
      // Redirect to Stripe Checkout
      console.log("Redirecting to Stripe Checkout:", paymentSession.url);
      await paymentService.redirectToCheckout(paymentSession.url);
      
    } catch (error) {
      console.error("Payment submission failed:", error);
      setIsProcessing(false);
      
      // Show error to user (you could add error state to show in UI)
      alert("Failed to process payment. Please try again.");
    }
  };

  const handleConfirmBooking = () => {
    // Here you would typically send the booking data to your backend
    console.log("Booking confirmed:", { property, bookingData, paymentData });

    if (onBookingConfirm) {
      const bookingDetails = {
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        nights: bookingData.totalNights,
        subtotal: property.price_per_night * bookingData.totalNights,
        serviceFee: bookingData.serviceFee,
        total: bookingData.totalAmount,
      };
      onBookingConfirm(bookingDetails);
    } else {
      onClose();
      setStep("dates");
      setBookingData({
        checkIn: "",
        checkOut: "",
        guests: 1,
        totalNights: 0,
        totalAmount: 0,
        cleaningFee: 50,
        serviceFee: 0,
      });
    }
  };

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
            <div>
              <h3 className="font-semibold text-gray-900">{property.title}</h3>
              <p className="text-gray-600">
                ${property.price_per_night} per night
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="p-6">
          {/* Step Indicators */}
          <div className="flex items-center justify-center mb-8">
            {["dates", "guests", "payment", "confirmation"].map(
              (stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === stepName
                        ? "bg-blue-600 text-white"
                        : step === "confirmation" ||
                            ["dates", "guests", "payment"].indexOf(step) > index
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step === "confirmation" ||
                    ["dates", "guests", "payment"].indexOf(step) > index ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        ["dates", "guests", "payment"].indexOf(step) > index
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
                  />
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
                  />
                </div>
              </div>
              {bookingData.totalNights > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    {bookingData.totalNights} night
                    {bookingData.totalNights > 1 ? "s" : ""} selected
                  </p>
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
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Payment Information
              </h3>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        cardNumber: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) =>
                        setPaymentData((prev) => ({
                          ...prev,
                          expiryDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) =>
                        setPaymentData((prev) => ({
                          ...prev,
                          cvv: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={paymentData.name}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={paymentData.email}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </form>
            </div>
          )}

          {step === "confirmation" && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Booking Confirmed!
                </h3>
                <p className="text-gray-600">
                  Your reservation has been successfully created.
                </p>
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
                  <span>
                    ${property.price_per_night * bookingData.totalNights}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>${bookingData.cleaningFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${bookingData.serviceFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
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
                    bookingData.totalNights === 0
                  }
                >
                  Continue
                </Button>
              )}
              {step === "guests" && (
                <Button onClick={handleNext}>Continue to Payment</Button>
              )}
              {step === "payment" && (
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                  className="min-w-[120px]"
                >
                  {isProcessing ? "Processing..." : "Confirm Booking"}
                </Button>
              )}
              {step === "confirmation" && (
                <Button onClick={handleConfirmBooking}>Done</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
