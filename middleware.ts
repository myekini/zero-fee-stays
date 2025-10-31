import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight in-memory rate limiter for auth routes (per IP)
const __authRate = new Map<string, { count: number; reset: number }>();
function allowAuthRequest(ip: string, max = 60, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const entry = __authRate.get(ip);
  if (!entry || now > entry.reset) {
    __authRate.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

// Profile cache: userId -> { role, is_host, timestamp }
interface CachedProfile {
  role: string;
  is_host: boolean;
  timestamp: number;
}

const __profileCache = new Map<string, CachedProfile>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedProfile(userId: string): CachedProfile | null {
  const cached = __profileCache.get(userId);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    __profileCache.delete(userId);
    return null;
  }

  return cached;
}

function setCachedProfile(userId: string, role: string, is_host: boolean): void {
  __profileCache.set(userId, {
    role,
    is_host,
    timestamp: Date.now(),
  });
}

function invalidateProfileCache(userId: string): void {
  __profileCache.delete(userId);
}

// Export for use by API routes
export { invalidateProfileCache };

// Auto-cleanup of expired cache entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [userId, cached] of __profileCache.entries()) {
      if (now - cached.timestamp > CACHE_TTL) {
        __profileCache.delete(userId);
      }
    }
  }, 10 * 60 * 1000);
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Skip auth check for API routes and static files (performance optimization)
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return res;
  }

  // Public pages that don't require authentication
  const publicPaths = ["/", "/properties", "/property"];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isAuthPath = pathname.startsWith("/auth");

  // Basic rate limiting for auth-related pages to mitigate abuse
  if (isAuthPath) {
    const ip = (
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown"
    ).trim();
    if (!allowAuthRequest(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "content-type": "application/json" } }
      );
    }
  }

  // Role-protected routes
  const adminPaths = ["/admin"];
  const hostPaths = ["/host-dashboard"];
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  const isHostPath = hostPaths.some(path => pathname.startsWith(path));

  // Quick check: if accessing public page, skip Supabase call (big performance boost)
  if (isPublicPath && !isAuthPath) {
    return res;
  }

  // Only create Supabase client when needed for auth-related routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          req.cookies.set({
            name,
            value: "",
            ...options,
          });
          res.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If accessing auth page and already authenticated, redirect to home
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If accessing protected page without authentication, redirect to auth
  if (!session && !isPublicPath && !isAuthPath) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  // Role-based access control for admin and host routes
  if (session && (isAdminPath || isHostPath)) {
    try {
      // Try to get profile from cache first
      let profile = getCachedProfile(session.user.id);

      if (!profile) {
        // Cache miss - fetch from database
        const { data: dbProfile, error } = await supabase
          .from("profiles")
          .select("role, is_host")
          .eq("user_id", session.user.id)
          .single();

        if (error || !dbProfile) {
          console.warn(`No profile found for user ${session.user.email}, attempting to create...`);

          // Try to create missing profile by calling the function
          const { error: createError } = await supabase.rpc('create_missing_profile', {
            user_uuid: session.user.id
          });

          if (createError) {
            console.error("Error creating missing profile:", createError);
            return NextResponse.redirect(new URL("/auth?error=profile_missing", req.url));
          }

          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from("profiles")
            .select("role, is_host")
            .eq("user_id", session.user.id)
            .single();

          if (fetchError || !newProfile) {
            console.error("Failed to fetch newly created profile:", fetchError);
            return NextResponse.redirect(new URL("/auth?error=profile_creation_failed", req.url));
          }

          // Cache the newly created profile
          setCachedProfile(session.user.id, newProfile.role, newProfile.is_host);
          profile = { role: newProfile.role, is_host: newProfile.is_host, timestamp: Date.now() };
        } else {
          // Cache the fetched profile
          setCachedProfile(session.user.id, dbProfile.role, dbProfile.is_host);
          profile = { role: dbProfile.role, is_host: dbProfile.is_host, timestamp: Date.now() };
        }
      }

      // Check admin access
      if (isAdminPath && profile.role !== "admin") {
        console.warn(
          `Unauthorized admin access attempt by user ${session.user.email} (role: ${profile.role})`
        );
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Check host access (hosts or admins can access)
      if (isHostPath && profile.role !== "host" && profile.role !== "admin") {
        console.warn(
          `Unauthorized host dashboard access attempt by user ${session.user.email} (role: ${profile.role})`
        );
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Error in role-based access control:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
