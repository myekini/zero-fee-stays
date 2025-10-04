import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Skip auth check for API routes and static files (performance optimization)
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return res;
  }

  // Public pages that don't require authentication
  const publicPaths = ["/", "/properties", "/property"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = pathname.startsWith("/auth");

  // Role-protected routes
  const adminPaths = ["/admin"];
  const hostPaths = ["/host-dashboard"];
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
  const isHostPath = hostPaths.some((path) => pathname.startsWith(path));

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
      // Get user profile with role from database
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, is_host")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.redirect(new URL("/auth", req.url));
      }

      // Check admin access
      if (isAdminPath && profile?.role !== "admin") {
        console.warn(
          `Unauthorized admin access attempt by user ${session.user.email}`
        );
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Check host access (hosts or admins can access)
      if (
        isHostPath &&
        profile?.role !== "host" &&
        profile?.role !== "admin"
      ) {
        console.warn(
          `Unauthorized host dashboard access attempt by user ${session.user.email}`
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
