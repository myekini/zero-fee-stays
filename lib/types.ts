// Re-export the generated types from Supabase and import locally for usage
import type { Database } from "@/integrations/supabase/types";
export type { Database } from "@/integrations/supabase/types";

export type BookingCreateRequest =
  Database["public"]["Tables"]["bookings"]["Insert"];
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

// Additional type definitions for new features
export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyInsert =
  Database["public"]["Tables"]["properties"]["Insert"];
export type PropertyUpdate =
  Database["public"]["Tables"]["properties"]["Update"];

export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
export type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];

// Property approval types
export type PropertyApprovalAction = "approve" | "reject" | "flag";
export type PropertyApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "flagged";

// Payment status types
export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "disputed";

// User role types
export type UserRole = "user" | "host" | "admin" | "super_admin" | "moderator";

// Review status types
export type ReviewStatus = "pending" | "published" | "flagged" | "hidden";

// API response types
export type PropertyApprovalRequest = {
  propertyId: string;
  action: PropertyApprovalAction;
  adminNotes?: string;
  rejectionReason?: string;
};

export type ReviewCreationRequest = {
  bookingId: string;
  propertyId: string;
  rating: number;
  title?: string;
  comment?: string;
  cleanlinessRating?: number;
  accuracyRating?: number;
  communicationRating?: number;
  locationRating?: number;
  valueRating?: number;
  reviewImages?: Array<{
    url: string;
    caption?: string;
  }>;
};

export type UserRoleUpdateRequest = {
  userId: string;
  role: UserRole;
  isVerified?: boolean;
};

export type BulkUserRoleUpdateRequest = {
  updates: Array<{
    userId: string;
    role: UserRole;
    isVerified?: boolean;
  }>;
};
