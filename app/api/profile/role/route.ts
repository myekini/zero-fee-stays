import { createClient } from "@/integrations/supabase/server";
import { NextResponse } from "next/server";

/**
 * Update user role (become a host)
 * POST /api/profile/role
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role } = await request.json();

    // Validate role
    if (!["user", "host"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Only 'user' and 'host' are allowed." },
        { status: 400 }
      );
    }

    // Users cannot make themselves admin through this endpoint
    if (role === "admin") {
      return NextResponse.json(
        { error: "Cannot assign admin role through this endpoint" },
        { status: 403 }
      );
    }

    // Get current role for logging
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const oldRole = currentProfile?.role || "user";

    // STEP 1: Update user metadata
    const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
      data: {
        role: role,
        is_host: role === "host",
      },
    });

    if (updateError) {
      console.error("Error updating user role metadata:", updateError);
      return NextResponse.json(
        { error: "Failed to update role in user metadata" },
        { status: 500 }
      );
    }

    // STEP 2: Update profiles table (critical for middleware and role checks)
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        role: role,
        is_host: role === "host",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (profileUpdateError) {
      console.error("Error updating profile role:", profileUpdateError);
      // Try to rollback metadata update
      await supabase.auth.updateUser({
        data: {
          role: oldRole,
          is_host: oldRole === "host",
        },
      });
      return NextResponse.json(
        { error: "Failed to update role in profile. Changes rolled back." },
        { status: 500 }
      );
    }

    // STEP 3: Log the activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "self_role_update",
      entity_type: "user",
      entity_id: user.id,
      metadata: {
        old_role: oldRole,
        new_role: role,
        method: "self_service",
      },
    });

    // STEP 4: Invalidate cache (call the database function)
    await supabase.rpc("invalidate_profile_cache", {
      target_user_id: user.id,
    });

    console.log(`✅ User ${user.id} role updated from ${oldRole} to ${role} (both metadata and profile)`);

    return NextResponse.json({
      success: true,
      role: role,
      user: {
        id: updatedUser.user?.id,
        email: updatedUser.user?.email,
        role: role,
      },
      message: `Successfully updated role to ${role}`,
    });
  } catch (error) {
    console.error("Error in role update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get current user role
 * GET /api/profile/role
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get role from profiles table as source of truth
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_host")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      // Fallback to metadata if profile doesn't exist
      const role = user.user_metadata?.role || "user";
      const isHost = user.user_metadata?.is_host || role === "host";

      return NextResponse.json({
        role: role,
        isHost: isHost,
        user: {
          id: user.id,
          email: user.email,
        },
        warning: "Profile not found, using metadata",
      });
    }

    return NextResponse.json({
      role: profile.role,
      isHost: profile.is_host,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
