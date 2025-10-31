import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return { isAdmin: false, error: "Missing or invalid authorization header" };
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { isAdmin: false, error: "Invalid token" };
  }

  // Check if user is admin or moderator
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !["admin", "super_admin", "moderator"].includes(profile.role)
  ) {
    return { isAdmin: false, error: "Insufficient permissions" };
  }

  return { isAdmin: true, userId: user.id };
}

/**
 * GET /api/admin/reviews
 * Get reviews for moderation
 * Admin/Moderator only
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden", message: auth.error },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const validStatuses = ["pending", "flagged", "hidden"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const {
      data: reviews,
      error,
      count,
    } = await supabase
      .from("reviews")
      .select(
        `
        *,
        property:properties!reviews_property_id_fkey(
          id,
          title,
          address
        ),
        guest:profiles!reviews_guest_id_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url
        ),
        host:profiles!reviews_host_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        review_images!review_images_review_id_fkey(
          id,
          image_url,
          caption,
          order_index
        ),
        review_reports!review_reports_review_id_fkey(
          id,
          reason,
          details,
          status,
          created_at
        )
      `,
        { count: "exact" }
      )
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reviews,
      count,
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error("Review moderation queue error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/reviews
 * Moderate a review (approve, reject, flag)
 * Admin/Moderator only
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden", message: auth.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reviewId, action, moderatorNotes } = body;

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: "Review ID and action are required" },
        { status: 400 }
      );
    }

    const validActions = ["approve", "reject", "flag", "unflag"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID format" },
        { status: 400 }
      );
    }

    // Check if review exists
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("id, status, property_id, guest_id, host_id, rating, comment")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (action === "approve") {
      updateData.status = "published";
    } else if (action === "reject") {
      updateData.status = "hidden";
    } else if (action === "flag") {
      updateData.status = "flagged";
    } else if (action === "unflag") {
      updateData.status = "pending";
    }

    // Update review
    const { data: updatedReview, error: updateError } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", reviewId)
      .select(
        `
        *,
        property:properties!reviews_property_id_fkey(
          id,
          title
        ),
        guest:profiles!reviews_guest_id_fkey(
          id,
          first_name,
          last_name
        )
      `
      )
      .single();

    if (updateError) {
      console.error("Review update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update review" },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabase.from("activity_logs").insert({
        user_id: auth.userId,
        action: `review_${action}`,
        entity_type: "review",
        entity_id: reviewId,
        metadata: {
          property_id: review.property_id,
          guest_id: review.guest_id,
          previous_status: review.status,
          new_status: updateData.status,
          moderator_notes: moderatorNotes,
        },
      });
    } catch (logError) {
      console.warn("Failed to log activity:", logError);
      // Don't fail the request if logging fails
    }

    // Send notification to guest
    if (action === "approve") {
      try {
        await supabase.from("notifications").insert({
          user_id: review.guest_id,
          type: "review_approved",
          title: "Review Published! ⭐",
          message: `Your review has been approved and is now visible to other guests.`,
          data: {
            review_id: reviewId,
            property_id: review.property_id,
            rating: review.rating,
          },
        });
      } catch (notificationError) {
        console.warn("Failed to send notification:", notificationError);
        // Don't fail the request if notification fails
      }
    } else if (action === "reject") {
      try {
        await supabase.from("notifications").insert({
          user_id: review.guest_id,
          type: "review_rejected",
          title: "Review Not Approved",
          message: `Your review did not meet our community guidelines and has been removed.`,
          data: {
            review_id: reviewId,
            property_id: review.property_id,
            moderator_notes: moderatorNotes,
          },
        });
      } catch (notificationError) {
        console.warn("Failed to send notification:", notificationError);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: `Review ${action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "flag" ? "flagged" : "unflagged"} successfully`,
    });
  } catch (error) {
    console.error("Review moderation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/reviews
 * Report a review
 * Admin/Moderator only
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden", message: auth.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reviewId, reason, details } = body;

    if (!reviewId || !reason) {
      return NextResponse.json(
        { error: "Review ID and reason are required" },
        { status: 400 }
      );
    }

    const validReasons = [
      "inappropriate",
      "spam",
      "fake",
      "offensive",
      "other",
    ];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: `Invalid reason. Must be one of: ${validReasons.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if review exists
    const { data: review } = await supabase
      .from("reviews")
      .select("id, status")
      .eq("id", reviewId)
      .single();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Create report
    const { data: report, error: reportError } = await supabase
      .from("review_reports")
      .insert({
        review_id: reviewId,
        reporter_id: auth.userId,
        reason,
        details,
        status: "reviewed", // Admin reports are automatically reviewed
      })
      .select()
      .single();

    if (reportError) {
      console.error("Review report error:", reportError);
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 }
      );
    }

    // Update review reported count and status
    await supabase
      .from("reviews")
      .update({
        status: "flagged",
      })
      .eq("id", reviewId);

    // Increment reported count using a separate update
    const { data: currentReview } = await supabase
      .from("reviews")
      .select("reported_count")
      .eq("id", reviewId)
      .single();

    if (currentReview) {
      await supabase
        .from("reviews")
        .update({
          reported_count: (currentReview.reported_count || 0) + 1,
        })
        .eq("id", reviewId);
    }

    return NextResponse.json({
      success: true,
      report,
      message: "Review reported successfully",
    });
  } catch (error) {
    console.error("Review report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

