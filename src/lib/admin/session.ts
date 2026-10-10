import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomId, sign, unsign } from "./crypto";
import { store } from "./store";

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-amr_admin" : "amr_admin";
export const SESSION_HOURS = 12;

export type SessionToken = { sid: string; exp: number; ep: number };
type SessionRecord = { createdAt: number; method: "password" | "passkey" | "setup"; ip: string; ua: string };

async function epoch() {
  return Number((await store().get("admin:epoch")) ?? 0);
}

export async function clientInfo() {
  const h = await headers();
  return {
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown",
    ua: (h.get("user-agent") ?? "").slice(0, 200),
  };
}

export async function createSession(method: SessionRecord["method"]) {
  const sid = randomId();
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  const info = await clientInfo();
  await store().set(`admin:session:${sid}`, { createdAt: Date.now(), method, ...info } satisfies SessionRecord, SESSION_HOURS * 3600);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sign({ sid, exp, ep: await epoch() } satisfies SessionToken), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax, not Strict: the GitHub sign-in for the editor returns via a cross-site redirect.
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  await audit(`Signed in (${method})`, info);
}

/** Full check: signature, expiry, not revoked. Use in every admin page, route and action. */
export async function getSession() {
  const jar = await cookies();
  const tok = unsign<SessionToken>(jar.get(SESSION_COOKIE)?.value);
  if (!tok || tok.exp < Date.now()) return null;
  if (tok.ep !== (await epoch())) return null;
  const rec = await store().get<SessionRecord>(`admin:session:${tok.sid}`);
  return rec ? { ...rec, sid: tok.sid } : null;
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

export async function destroySession() {
  const jar = await cookies();
  const tok = unsign<SessionToken>(jar.get(SESSION_COOKIE)?.value);
  if (tok) await store().del(`admin:session:${tok.sid}`);
  jar.delete(SESSION_COOKIE);
}

/** Signs out every device, including this one. */
export async function revokeAll() {
  await store().set("admin:epoch", (await epoch()) + 1);
  await audit("Signed out everywhere", await clientInfo());
}

export async function audit(event: string, info?: { ip: string; ua: string }) {
  await store().lpush("admin:audit", { at: Date.now(), event, ip: info?.ip, ua: info?.ua }, 200);
}

/** Same-origin check for state-changing requests. */
export async function sameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");
  return Boolean(origin && host && new URL(origin).host === host);
}
