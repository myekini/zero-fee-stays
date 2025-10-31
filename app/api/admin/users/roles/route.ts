import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifySuperAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return {
      isSuperAdmin: false,
      error: "Missing or invalid authorization header",
    };
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { isSuperAdmin: false, error: "Invalid token" };
  }

  // Check if user is super admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "super_admin") {
    return {
      isSuperAdmin: false,
      error: "Insufficient permissions - super admin required",
    };
  }

  return { isSuperAdmin: true, userId: user.id };
}

/**
 * GET /api/admin/users/roles
 * Get all users with their roles
 * Super admin only
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifySuperAdmin(request);
    if (!auth.isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden", message: auth.error },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const validRoles = ["user", "host", "admin", "super_admin", "moderator"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        user_id,
        email,
        first_name,
        last_name,
        role,
        is_host,
        is_verified,
        created_at,
        last_login_at,
        login_count,
        location
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (role) {
      query = query.eq("role", role);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users,
      count,
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error("User roles fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/roles
 * Update user role
 * Super admin only
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifySuperAdmin(request);
    if (!auth.isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden", message: auth.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role, isVerified } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    const validRoles = ["user", "host", "admin", "super_admin", "moderator"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, user_id, email, first_name, last_name, role")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      role,
      updated_at: new Date().toISOString(),
    };

    // Update is_host based on role
    if (role === "host" || role === "admin" || role === "super_admin") {
      updateData.is_host = true;
    } else {
      updateData.is_host = false;
    }

    // Update verification status if provided
    if (typeof isVerified === "boolean") {
      updateData.is_verified = isVerified;
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", userId)
      .select(
        `
        id,
        user_id,
        email,
        first_name,
        last_name,
        role,
        is_host,
        is_verified,
        created_at,
        last_login_at,
        login_count
      `
      )
      .single();

    if (updateError) {
      console.error("User role update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update user role" },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabase.from("activity_logs").insert({
        user_id: auth.userId,
        action: "user_role_updated",
        entity_type: "user",
        entity_id: userId,
        metadata: {
          target_user_email: user.email,
          target_user_name: `${user.first_name} ${user.last_name}`,
          previous_role: user.role,
          new_role: role,
          is_verified: isVerified,
        },
      });
    } catch (logError) {
      console.warn("Failed to log activity:", logError);
      // Don't fail the request if logging fails
    }

    // Send notification to user if role changed significantly
    if (user.role !== role) {
      try {
        await supabase.from("notifications").insert({
          user_id: userId,
          type: "role_updated",
          title: "Account Role Updated",
          message: `Your account role has been updated to ${role}.`,
          data: {
            previous_role: user.role,
            new_role: role,
            is_verified: isVerified,
          },
        });
      } catch (notificationError) {
        console.warn("Failed to send notification:", notificationError);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User role updated to ${role} successfully`,
    });
  } catch (error) {
    console.error("User role update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users/roles
 * Bulk update user roles
 * Super admin only
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifySuperAdmin(request);
    if (!auth.isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden", message: auth.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Updates array is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (updates.length > 100) {
      return NextResponse.json(
        { error: "Cannot update more than 100 users at once" },
        { status: 400 }
      );
    }

    const validRoles = ["user", "host", "admin", "super_admin", "moderator"];
    const results = [];
    const errors = [];

    for (const update of updates) {
      const { userId, role, isVerified } = update;

      if (!userId || !role) {
        errors.push({ userId, error: "User ID and role are required" });
        continue;
      }

      if (!validRoles.includes(role)) {
        errors.push({ userId, error: `Invalid role: ${role}` });
        continue;
      }

      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        errors.push({ userId, error: "Invalid user ID format" });
        continue;
      }

      try {
        // Check if user exists
        const { data: user, error: userError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("user_id", userId)
          .single();

        if (userError || !user) {
          errors.push({ userId, error: "User not found" });
          continue;
        }

        // Prepare update data
        const updateData: any = {
          role,
          updated_at: new Date().toISOString(),
        };

        // Update is_host based on role
        if (role === "host" || role === "admin" || role === "super_admin") {
          updateData.is_host = true;
        } else {
          updateData.is_host = false;
        }

        // Update verification status if provided
        if (typeof isVerified === "boolean") {
          updateData.is_verified = isVerified;
        }

        // Update user profile
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("user_id", userId);

        if (updateError) {
          errors.push({ userId, error: "Failed to update user" });
          continue;
        }

        results.push({ userId, success: true, newRole: role });
      } catch (error) {
        errors.push({ userId, error: "Internal error" });
      }
    }

    // Log bulk activity
    if (results.length > 0) {
      try {
        await supabase.from("activity_logs").insert({
          user_id: auth.userId,
          action: "bulk_user_role_update",
          entity_type: "user",
          entity_id: null,
          metadata: {
            updated_count: results.length,
            failed_count: errors.length,
            updates: results,
          },
        });
      } catch (logError) {
        console.warn("Failed to log bulk activity:", logError);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: updates.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error("Bulk user role update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

