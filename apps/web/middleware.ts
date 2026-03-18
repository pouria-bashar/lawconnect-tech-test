import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = [
  "/api/synthetic-test/run",
];

const CHAT_ROUTES = [
  "/lead-capture",
  "/generative-ui",
  "/blogs",
  "/synthetic-test",
  "/immigration",
  "/fullstack-apps",
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect signup to login (signup is disabled)
  if (pathname.startsWith("/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allow public routes (no auth required)
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return supabaseResponse;
  }

  // Allow auth routes and auth callback
  if (pathname.startsWith("/login") || pathname.startsWith("/auth")) {
    if (user) {
      // Already logged in, redirect to home
      const url = request.nextUrl.clone();
      url.pathname = "/lead-capture";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Protect all other routes
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Assign a thread ID to chat routes that don't have one yet.
  // Placed after auth so unauthenticated users redirect straight to /login
  // without an unnecessary intermediate redirect.
  if (
    CHAT_ROUTES.includes(pathname) &&
    !request.nextUrl.searchParams.has("thread")
  ) {
    const url = request.nextUrl.clone();
    url.searchParams.set("thread", crypto.randomUUID());
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};
