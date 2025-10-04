import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthenticatedUser {
  id: string;
  email: string;
  profile_id: string;
}

export async function authenticateUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    // Get the profile ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
      profile_id: profile.id,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function authorizePropertyAccess(
  user: AuthenticatedUser,
  propertyId: string
): Promise<boolean> {
  try {
    const { data: property } = await supabase
      .from("properties")
      .select("host_id")
      .eq("id", propertyId)
      .single();

    if (!property) {
      return false;
    }

    return property.host_id === user.profile_id;
  } catch (error) {
    console.error("Authorization error:", error);
    return false;
  }
}

export function createAuthResponse(message: string, status: number = 401) {
  return NextResponse.json({ error: message }, { status });
}
