import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes that never require authentication
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/set-password",
  "/reset-password",
  "/chestionar",
  "/questionnaire-runtime",
  "/termeni",
  "/confidentialitate",
  "/report",
]);

// Path prefixes that never require authentication
const PUBLIC_PREFIXES = [
  "/landing-v2",
  "/checkout",
  "/dev",
  "/api/auth",
  "/api/create-checkout",
  "/api/stripe-webhook",
  "/api/send-email",
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Protected routes: check for session cookie (fast, no DB call)
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
