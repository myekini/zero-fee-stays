import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_your_publishable_key_here"
);

export interface BookingRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  guestName?: string;
  guestEmail?: string;
}

export interface PaymentSessionRequest {
  bookingId: string;
  propertyId: string;
  propertyTitle: string;
  totalAmount: number;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
}

export interface PaymentSessionResponse {
  sessionId: string;
  url: string;
}

export interface PaymentVerificationRequest {
  sessionId: string;
}

export interface PaymentVerificationResponse {
  paymentStatus: string;
  bookingStatus: string;
  booking: {
    id: string;
    status: string;
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    totalAmount: number;
  };
}

export interface BookingResponse {
  bookingId: string;
  status: string;
  message: string;
}

class PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create booking");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  /**
   * Create a Stripe payment session
   */
  async createPaymentSession(
    sessionData: PaymentSessionRequest
  ): Promise<PaymentSessionResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/payments/create-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sessionData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create payment session");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating payment session:", error);
      throw error;
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(
    verificationData: PaymentVerificationRequest
  ): Promise<PaymentVerificationResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/payments/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(verificationData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to verify payment");
      }

      return await response.json();
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/bookings/${bookingId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get booking");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting booking:", error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: string,
    paymentIntentId?: string
  ): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, payment_intent_id: paymentIntentId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update booking status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  }

  /**
   * Complete payment flow - creates booking and payment session
   */
  async completePaymentFlow(
    bookingData: BookingRequest
  ): Promise<PaymentSessionResponse> {
    try {
      // Step 1: Create booking
      const bookingResponse = await this.createBooking(bookingData);

      // Step 2: Create payment session
      const sessionData: PaymentSessionRequest = {
        bookingId: bookingResponse.bookingId,
        propertyId: bookingData.propertyId,
        propertyTitle: "Property", // You can pass this from the component
        totalAmount: bookingData.totalAmount,
        guestName: bookingData.guestName || "Guest",
        guestEmail: bookingData.guestEmail || "guest@example.com",
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
      };

      const sessionResponse = await this.createPaymentSession(sessionData);

      return sessionResponse;
    } catch (error) {
      console.error("Error in payment flow:", error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(checkoutUrl: string): Promise<void> {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      throw new Error("No checkout URL provided");
    }
  }

  /**
   * Get Stripe instance
   */
  async getStripe() {
    return await stripePromise;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
