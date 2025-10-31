import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/initialize
 * Initialize admin user and system setup
 * This endpoint should only be called once during initial setup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName = "Admin",
      lastName = "User",
      force = false,
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if admin users already exist (unless force is true)
    if (!force) {
      const { data: existingAdmins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1);

      if (existingAdmins && existingAdmins.length > 0) {
        return NextResponse.json(
          {
            error: "Admin users already exist. Use force=true to override.",
            existingAdmins: existingAdmins.length,
          },
          { status: 409 }
        );
      }
    }

    console.log(`Creating admin user: ${email}`);

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email confirmation for admin
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: "admin",
          is_host: true,
          is_verified: true,
        },
      });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return NextResponse.json(
        { error: "Failed to create auth user", details: authError.message },
        { status: 500 }
      );
    }

    // Step 2: Ensure profile has admin role
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "admin",
        is_host: true,
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", authData.user.id)
      .select()
      .single();

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return NextResponse.json(
        { error: "Failed to update profile", details: profileError.message },
        { status: 500 }
      );
    }

    // Step 3: Verify admin permissions
    const { data: roleCheck, error: roleError } = await supabase.rpc(
      "get_user_role",
      { user_uuid: authData.user.id }
    );

    if (roleError) {
      console.error("Error checking user role:", roleError);
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profileData.role,
        is_host: profileData.is_host,
        is_verified: profileData.is_verified,
        verified_role: roleCheck,
      },
    });
  } catch (error) {
    console.error("Unexpected error in admin initialization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/initialize
 * Check if admin users exist
 */
export async function GET(request: NextRequest) {
  try {
    const { data: admins, error } = await supabase
      .from("profiles")
      .select(
        "id, user_id, first_name, last_name, role, is_verified, created_at"
      )
      .eq("role", "admin")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching admins:", error);
      return NextResponse.json(
        { error: "Failed to fetch admin users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      adminCount: admins?.length || 0,
      admins: admins || [],
      isInitialized: (admins?.length || 0) > 0,
    });
  } catch (error) {
    console.error("Unexpected error checking admin status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

