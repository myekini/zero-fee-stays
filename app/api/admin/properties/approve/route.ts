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

  // Check if user is admin
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
 * POST /api/admin/properties/approve
 * Approve or reject a property
 * Admin only
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
    const { propertyId, action, adminNotes, rejectionReason } = body;

    if (!propertyId || !action) {
      return NextResponse.json(
        { error: "Property ID and action are required" },
        { status: 400 }
      );
    }

    const validActions = ["approve", "reject", "flag"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID format" },
        { status: 400 }
      );
    }

    // Check if property exists
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, title, host_id, approval_status")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (action === "approve") {
      updateData.approval_status = "approved";
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = auth.userId;
      updateData.rejected_reason = null;
      updateData.rejection_notes = null;
    } else if (action === "reject") {
      updateData.approval_status = "rejected";
      updateData.rejected_reason =
        rejectionReason || "Property does not meet platform standards";
      updateData.rejection_notes = adminNotes;
      updateData.approved_at = null;
      updateData.approved_by = null;
    } else if (action === "flag") {
      updateData.approval_status = "flagged";
      updateData.admin_notes = adminNotes;
    }

    if (adminNotes && action !== "reject") {
      updateData.admin_notes = adminNotes;
    }

    // Update property
    const { data: updatedProperty, error: updateError } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", propertyId)
      .select(
        `
        *,
        host:profiles!properties_host_id_fkey(
          id,
          user_id,
          first_name,
          last_name,
          email
        )
      `
      )
      .single();

    if (updateError) {
      console.error("Property update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update property" },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabase.from("activity_logs").insert({
        user_id: auth.userId,
        action: `property_${action}`,
        entity_type: "property",
        entity_id: propertyId,
        metadata: {
          property_title: property.title,
          previous_status: property.approval_status,
          new_status: updateData.approval_status,
          admin_notes: adminNotes,
          rejection_reason: rejectionReason,
        },
      });
    } catch (logError) {
      console.warn("Failed to log activity:", logError);
      // Don't fail the request if logging fails
    }

    // Send notification to host
    try {
      await supabase.from("notifications").insert({
        user_id: property.host_id,
        type: `property_${action}`,
        title: `Property ${action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Flagged"}!`,
        message: `Your property "${property.title}" has been ${action === "approve" ? "approved and is now live" : action === "reject" ? "rejected" : "flagged for review"}.`,
        data: {
          property_id: propertyId,
          property_title: property.title,
          action,
          admin_notes: adminNotes,
          rejection_reason: rejectionReason,
        },
      });
    } catch (notificationError) {
      console.warn("Failed to send notification:", notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      property: updatedProperty,
      message: `Property ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "flagged"} successfully`,
    });
  } catch (error) {
    console.error("Property approval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/properties/approve
 * Get properties pending approval
 * Admin only
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
    const approvalStatus = searchParams.get("approval_status") || "pending";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const validStatuses = ["pending", "flagged", "rejected"];
    if (!validStatuses.includes(approvalStatus)) {
      return NextResponse.json(
        {
          error: `Invalid approval_status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const {
      data: properties,
      error,
      count,
    } = await supabase
      .from("properties")
      .select(
        `
        *,
        host:profiles!properties_host_id_fkey(
          id,
          user_id,
          first_name,
          last_name,
          email,
          phone
        ),
        property_images!property_images_property_id_fkey(
          id,
          public_url,
          is_primary,
          display_order
        )
      `,
        { count: "exact" }
      )
      .eq("approval_status", approvalStatus)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching properties:", error);
      return NextResponse.json(
        { error: "Failed to fetch properties" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      properties,
      count,
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error("Property moderation queue error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

