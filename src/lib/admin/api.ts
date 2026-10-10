import "server-only";
import { cookies } from "next/headers";
import { randomId } from "./crypto";
import { getSession, sameOrigin } from "./session";
import { store, storeConfigured } from "./store";

export function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Common guard for admin API routes. Returns an error Response, or null when OK. */
export async function guard({ auth }: { auth: boolean }) {
  if (!storeConfigured) return json(503, { error: "Admin storage isn't set up yet." });
  if (!(await sameOrigin())) return json(403, { error: "Forbidden." });
  if (auth && !(await getSession())) return json(401, { error: "Sign in again." });
  return null;
}

export async function readJson(req: Request, max = 20_000): Promise<Record<string, unknown> | null> {
  const raw = await req.text();
  if (raw.length > max) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const CHAL = "amr_chal";
export async function saveChallenge(challenge: string) {
  const cid = randomId(16);
  await store().set(`admin:chal:${cid}`, challenge, 300);
  (await cookies()).set(CHAL, cid, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/admin", maxAge: 300 });
}
export async function takeChallenge() {
  const jar = await cookies();
  const cid = jar.get(CHAL)?.value;
  jar.delete(CHAL);
  if (!cid) return null;
  const c = await store().get<string>(`admin:chal:${cid}`);
  await store().del(`admin:chal:${cid}`);
  return c;
}
