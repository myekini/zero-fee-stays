import { loadStripe } from "@stripe/stripe-js";
import type {
  BookingCreateRequest,
  BookingCreateResponse,
  PaymentSessionRequest,
  PaymentSessionResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
} from "./types";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

class PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  /**
   * Create a new booking
   */
  async createBooking(
    bookingData: BookingCreateRequest
  ): Promise<BookingCreateResponse> {
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
        throw new Error(errorData.error || "Failed to create booking");
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
        throw new Error(errorData.error || "Failed to create payment session");
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
        throw new Error(errorData.error || "Failed to verify payment");
      }

      return await response.json();
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  }

  /**
   * Complete payment flow - creates booking and payment session
   */
  async completePaymentFlow(
    bookingData: BookingCreateRequest
  ): Promise<PaymentSessionResponse> {
    try {
      // Step 1: Create booking
      const bookingResponse = await this.createBooking(bookingData);

      // Step 2: Create payment session
      const sessionData: PaymentSessionRequest = {
        bookingId: bookingResponse.bookingId,
        propertyId: bookingData.property_id,
        propertyTitle: "Property", // You can pass this from the component
        totalAmount: bookingData.total_amount,
        guestName: "Guest",
        guestEmail: "guest@example.com",
        checkIn: bookingData.check_in,
        checkOut: bookingData.check_out,
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

// Export types
export type {
  BookingCreateRequest,
  BookingCreateResponse,
  PaymentSessionRequest,
  PaymentSessionResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
};
