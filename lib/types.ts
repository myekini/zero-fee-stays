export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          property_id: string;
          guest_id: string;
          host_id: string;
          check_in: string;
          check_out: string;
          guests_count: number;
          total_amount: number;
          currency: string;
          status: "pending" | "confirmed" | "cancelled" | "completed";
          special_requests: string | null;
          payment_status: "pending" | "paid" | "failed" | "refunded" | null;
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          guest_id: string;
          host_id: string;
          check_in: string;
          check_out: string;
          guests_count?: number;
          total_amount: number;
          currency?: string;
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          special_requests?: string | null;
          payment_status?: "pending" | "paid" | "failed" | "refunded" | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          guest_id?: string;
          host_id?: string;
          check_in?: string;
          check_out?: string;
          guests_count?: number;
          total_amount?: number;
          currency?: string;
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          special_requests?: string | null;
          payment_status?: "pending" | "paid" | "failed" | "refunded" | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          location: string;
          price_per_night: number;
          max_guests: number;
          bedrooms: number;
          bathrooms: number;
          images: string[];
          amenities: string[];
          host_id: string;
          host_name: string;
          rating: number;
          review_count: number;
          cleaning_fee: number | null;
          service_fee: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          location: string;
          price_per_night: number;
          max_guests: number;
          bedrooms: number;
          bathrooms: number;
          images: string[];
          amenities: string[];
          host_id: string;
          host_name: string;
          rating?: number;
          review_count?: number;
          cleaning_fee?: number | null;
          service_fee?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          location?: string;
          price_per_night?: number;
          max_guests?: number;
          bedrooms?: number;
          bathrooms?: number;
          images?: string[];
          amenities?: string[];
          host_id?: string;
          host_name?: string;
          rating?: number;
          review_count?: number;
          cleaning_fee?: number | null;
          service_fee?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          role: "guest" | "host" | "admin";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: "guest" | "host" | "admin";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: "guest" | "host" | "admin";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type BookingCreateRequest = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingCreateResponse = {
  bookingId: string;
  checkoutUrl?: string;
};
export type PaymentSessionRequest = {
  bookingId: string;
  propertyId: string;
  propertyTitle: string;
  totalAmount: number;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
};
export type PaymentSessionResponse = {
  sessionId: string;
  checkoutUrl: string;
};
export type PaymentVerificationRequest = {
  sessionId: string;
};
export type PaymentVerificationResponse = {
  status: "paid" | "unpaid" | "no_session";
};
