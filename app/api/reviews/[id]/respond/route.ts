import { createClient } from "@/integrations/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reviews/[id]/respond
 * Host responds to a review
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
    const reviewId = resolvedParams.id;

    const body = await req.json();
    const { host_response } = body;

    // Validate host response
    if (!host_response || host_response.trim().length === 0) {
      return NextResponse.json(
        { error: "Host response is required" },
        { status: 400 }
      );
    }

    if (host_response.length > 1000) {
      return NextResponse.json(
        { error: "Host response must be 1000 characters or less" },
        { status: 400 }
      );
    }

    // Get review and verify property ownership
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        property_id,
        host_response,
        properties!inner (
          host_id
        )
      `
      )
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Verify user is the property host
    if (review.properties.host_id !== user.id) {
      return NextResponse.json(
        { error: "Only the property host can respond to reviews" },
        { status: 403 }
      );
    }

    // Check if host has already responded
    if (review.host_response) {
      return NextResponse.json(
        { error: "Host response already exists. Use PATCH to update." },
        { status: 400 }
      );
    }

    // Update review with host response
    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        host_response: host_response.trim(),
        host_response_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to submit host response" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "respond_to_review",
      entity_type: "review",
      entity_id: reviewId,
      metadata: {
        property_id: review.property_id,
        response_length: host_response.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Host response submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting host response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reviews/[id]/respond
 * Update host response to a review
 */
export async function PATCH(
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
    const reviewId = resolvedParams.id;

    const body = await req.json();
    const { host_response } = body;

    // Validate host response
    if (!host_response || host_response.trim().length === 0) {
      return NextResponse.json(
        { error: "Host response is required" },
        { status: 400 }
      );
    }

    if (host_response.length > 1000) {
      return NextResponse.json(
        { error: "Host response must be 1000 characters or less" },
        { status: 400 }
      );
    }

    // Get review and verify property ownership
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        property_id,
        host_response,
        properties!inner (
          host_id
        )
      `
      )
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Verify user is the property host
    if (review.properties.host_id !== user.id) {
      return NextResponse.json(
        { error: "Only the property host can update review responses" },
        { status: 403 }
      );
    }

    // Check if host response exists
    if (!review.host_response) {
      return NextResponse.json(
        { error: "No host response exists. Use POST to create." },
        { status: 400 }
      );
    }

    // Update review with new host response
    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        host_response: host_response.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update host response" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update_review_response",
      entity_type: "review",
      entity_id: reviewId,
      metadata: {
        property_id: review.property_id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Host response updated successfully",
    });
  } catch (error) {
    console.error("Error updating host response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]/respond
 * Delete host response to a review
 */
export async function DELETE(
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
    const reviewId = resolvedParams.id;

    // Get review and verify property ownership
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        property_id,
        host_response,
        properties!inner (
          host_id
        )
      `
      )
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Verify user is the property host
    if (review.properties.host_id !== user.id) {
      return NextResponse.json(
        { error: "Only the property host can delete review responses" },
        { status: 403 }
      );
    }

    // Check if host response exists
    if (!review.host_response) {
      return NextResponse.json(
        { error: "No host response exists to delete" },
        { status: 400 }
      );
    }

    // Remove host response
    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        host_response: null,
        host_response_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to delete host response" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete_review_response",
      entity_type: "review",
      entity_id: reviewId,
      metadata: {
        property_id: review.property_id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Host response deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting host response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
