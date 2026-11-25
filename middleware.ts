import { NextResponse, type NextRequest } from "next/server";

// Keeps portal sign-ins alive: when the short-lived access token is missing
// or about to expire, trade the refresh token for a new pair before the
// page runs. Pages still verify the user with Supabase on every request.

const ACCESS_COOKIE = "bl_portal_at";
const REFRESH_COOKIE = "bl_portal_rt";

function tokenExpiresSoon(token: string | undefined) {
  if (!token) return true;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    return !payload.exp || payload.exp * 1000 - Date.now() < 60_000;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const access = request.cookies.get(ACCESS_COOKIE)?.value;

  if (!url || !anon || !refresh || !tokenExpiresSoon(access)) {
    return NextResponse.next();
  }

  const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: anon, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  }).catch(() => null);

  if (!res || !res.ok) {
    const out = NextResponse.next();
    out.cookies.delete(ACCESS_COOKIE);
    out.cookies.delete(REFRESH_COOKIE);
    return out;
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  // Pass the new tokens to this request's page and save them in the browser.
  request.cookies.set(ACCESS_COOKIE, data.access_token);
  request.cookies.set(REFRESH_COOKIE, data.refresh_token);
  const out = NextResponse.next({ request: { headers: request.headers } });
  const secure = process.env.NODE_ENV === "production";
  out.cookies.set(ACCESS_COOKIE, data.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(60, data.expires_in),
  });
  out.cookies.set(REFRESH_COOKIE, data.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return out;
}

export const config = {
  matcher: ["/portal/:path*"],
};
