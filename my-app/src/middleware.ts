import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === "/login" || path === "/register";

  const token = request.cookies.get("token")?.value || "";

  if (isPublicPath && token) {
    // If user is logged in, redirect from public paths to home
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (!isPublicPath && !token) {
    // If user is not logged in and trying to access a protected path, redirect to login
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/category/:path*",
    "/recipe/:path*",
    "/profile",
    "/login",
    "/register",
  ],
};
