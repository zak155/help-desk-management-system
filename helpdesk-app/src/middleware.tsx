// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

// Public routes accessible without logging in
const PUBLIC_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session")?.value;
  const session = sessionToken ? await verifySession(sessionToken) : null;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 1. Unauthenticated user trying to access protected route -> redirect to /login
  if (!session && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Authenticated user trying to access /login or /register -> redirect to /dashboard
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure matcher to skip static assets and images
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};