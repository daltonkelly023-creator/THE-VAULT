import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect all admin routes except /admin itself (the login page)
  if (path.startsWith("/admin/")) {
    const adminAuth = request.cookies.get("admin-auth")?.value;
    if (adminAuth !== "vault-admin-2024") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};