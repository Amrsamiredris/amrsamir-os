import { NextResponse, type NextRequest } from "next/server";
import { unsign } from "@/lib/admin/crypto";

/**
 * First lock on the admin area and the content editor: a valid, unexpired, signed session cookie.
 * Every admin page and API route checks the session again on the server (revocation, expiry),
 * so this is a fast outer gate, not the only one.
 */
const COOKIE = process.env.NODE_ENV === "production" ? "__Host-amr_admin" : "amr_admin";
const PUBLIC_ADMIN = ["/admin/login", "/admin/setup"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isEditor = pathname.startsWith("/keystatic") || pathname.startsWith("/api/keystatic");
  // Locally the editor stays open so it can be used without the admin login.
  if (isEditor && process.env.NODE_ENV !== "production") return withNoIndex(NextResponse.next());
  if (PUBLIC_ADMIN.some((p) => pathname === p)) return withNoIndex(NextResponse.next());

  let tok: { exp: number } | null = null;
  try {
    tok = unsign<{ exp: number }>(req.cookies.get(COOKIE)?.value);
  } catch {
    tok = null; // secret missing: treat as signed out
  }
  if (tok && tok.exp > Date.now()) return withNoIndex(NextResponse.next());

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Sign in again." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

function withNoIndex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/keystatic", "/keystatic/:path*", "/api/keystatic/:path*"],
};
