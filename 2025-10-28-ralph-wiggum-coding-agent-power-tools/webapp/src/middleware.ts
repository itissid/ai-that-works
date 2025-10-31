import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session_token";

// Routes that should redirect to home if already authenticated
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).+)"],
};
