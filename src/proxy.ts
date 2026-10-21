// Next.js 16 "proxy" (formerly middleware): send visitors without a session
// cookie to the login page. This is only a convenience redirect; the Go API
// verifies the session on every request.

import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "utd_session";

// Open without a session: the landing page and the login page.
const PUBLIC_PATHS = new Set(["/", "/login"]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && !PUBLIC_PATHS.has(pathname)) {
    const url = new URL("/login", request.url);
    if (pathname !== "/app") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except the API (proxied to Go), Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
