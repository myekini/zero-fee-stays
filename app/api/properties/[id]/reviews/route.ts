import { createClient } from "@/integrations/supabase/server";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/properties/[id]/reviews
 * Get all reviews for a property with pagination
 * Query params: page, limit, sort (newest, highest, lowest)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const resolvedParams = await params;
    const propertyId = resolvedParams.id;

    // Pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "10"),
      50
    );
    const sort = searchParams.get("sort") || "newest";
    const offset = (page - 1) * limit;

    // Check if property exists
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, title")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Build query for reviews
    let query = supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        cleanliness_rating,
        accuracy_rating,
        communication_rating,
        location_rating,
        value_rating,
        comment,
        host_response,
        host_response_date,
        created_at,
        profiles!reviews_guest_id_fkey (
          first_name,
          last_name,
          avatar_url
        )
      `,
        { count: "exact" }
      )
      .eq("property_id", propertyId)
      .eq("status", "published");

    // Apply sorting
    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "highest") {
      query = query.order("rating", { ascending: false });
    } else if (sort === "lowest") {
      query = query.order("rating", { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error: reviewsError, count } = await query;

    if (reviewsError) {
      console.error("Reviews query error:", reviewsError);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    // Get review summary using database function
    const { data: summaryData } = await supabase.rpc("get_review_summary", {
      property_uuid: propertyId,
    });

    const summary = summaryData?.[0] || {
      average_rating: null,
      total_reviews: 0,
      rating_5_stars: 0,
      rating_4_stars: 0,
      rating_3_stars: 0,
      rating_2_stars: 0,
      rating_1_star: 0,
      avg_cleanliness: null,
      avg_accuracy: null,
      avg_communication: null,
      avg_location: null,
      avg_value: null,
    };

    // Format reviews
    const formattedReviews = reviews?.map((review: any) => ({
      id: review.id,
      guest: {
        name: `${review.profiles?.first_name || ""} ${review.profiles?.last_name || ""}`.trim() || "Anonymous",
        avatar: review.profiles?.avatar_url,
      },
      rating: Number(review.rating),
      breakdown: {
        cleanliness: review.cleanliness_rating
          ? Number(review.cleanliness_rating)
          : null,
        accuracy: review.accuracy_rating
          ? Number(review.accuracy_rating)
          : null,
        communication: review.communication_rating
          ? Number(review.communication_rating)
          : null,
        location: review.location_rating
          ? Number(review.location_rating)
          : null,
        value: review.value_rating ? Number(review.value_rating) : null,
      },
      text: review.comment,
      created_at: review.created_at,
      host_response: review.host_response,
      host_response_date: review.host_response_date,
    }));

    return NextResponse.json({
      reviews: formattedReviews || [],
      summary: {
        average_rating: summary.average_rating
          ? Number(summary.average_rating)
          : null,
        total_reviews: summary.total_reviews || 0,
        rating_distribution: {
          5: summary.rating_5_stars || 0,
          4: summary.rating_4_stars || 0,
          3: summary.rating_3_stars || 0,
          2: summary.rating_2_stars || 0,
          1: summary.rating_1_star || 0,
        },
        category_averages: {
          cleanliness: summary.avg_cleanliness
            ? Number(summary.avg_cleanliness)
            : null,
          accuracy: summary.avg_accuracy
            ? Number(summary.avg_accuracy)
            : null,
          communication: summary.avg_communication
            ? Number(summary.avg_communication)
            : null,
          location: summary.avg_location
            ? Number(summary.avg_location)
            : null,
          value: summary.avg_value ? Number(summary.avg_value) : null,
        },
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error getting reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties/[id]/reviews
 * Submit a review for a property (must have completed booking)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const propertyId = resolvedParams.id;

    const body = await req.json();
    const {
      booking_id,
      rating,
      cleanliness_rating,
      accuracy_rating,
      communication_rating,
      location_rating,
      value_rating,
      comment,
    } = body;

    // Validate required fields
    if (!booking_id || !rating) {
      return NextResponse.json(
        { error: "booking_id and rating are required" },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate review text length
    if (
      comment &&
      (comment.length < 10 || comment.length > 2000)
    ) {
      return NextResponse.json(
        { error: "Review text must be between 10 and 2000 characters" },
        { status: 400 }
      );
    }

    // Verify booking exists, belongs to user, and is completed
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, property_id, guest_id, status, check_out_date")
      .eq("id", booking_id)
      .eq("property_id", propertyId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.guest_id !== user.id) {
      return NextResponse.json(
        { error: "You can only review your own bookings" },
        { status: 403 }
      );
    }

    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Can only review completed bookings" },
        { status: 400 }
      );
    }

    // Check if checkout date has passed
    if (new Date(booking.check_out_date) > new Date()) {
      return NextResponse.json(
        { error: "Cannot review before checkout date" },
        { status: 400 }
      );
    }

    // Check if review already exists for this booking
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", booking_id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already submitted for this booking" },
        { status: 400 }
      );
    }

    // Get property to find host_id
    const { data: property, error: hostFetchError } = await supabase
      .from("properties")
      .select("host_id")
      .eq("id", propertyId)
      .single();

    if (hostFetchError || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Insert review
    const { data: newReview, error: insertError } = await supabase
      .from("reviews")
      .insert({
        property_id: propertyId,
        booking_id: booking_id,
        guest_id: user.id,
        host_id: property.host_id,
        rating,
        cleanliness_rating: cleanliness_rating || null,
        accuracy_rating: accuracy_rating || null,
        communication_rating: communication_rating || null,
        location_rating: location_rating || null,
        value_rating: value_rating || null,
        comment: comment || null,
        status: "published",
      } as TablesInsert<"reviews">)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "create_review",
      entity_type: "property",
      entity_id: propertyId,
      metadata: {
        review_id: newReview.id,
        booking_id,
        rating,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review: {
        id: (newReview as Tables<"reviews">).id,
        rating: rating,
        created_at: (newReview as Tables<"reviews">).created_at,
      },
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
