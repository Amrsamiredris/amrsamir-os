import { guard, json, readJson } from "@/lib/admin/api";
import { hashPassword, safeEqual } from "@/lib/admin/crypto";
import { alert } from "@/lib/admin/notify";
import { limited } from "@/lib/admin/ratelimit";
import { clientInfo, createSession } from "@/lib/admin/session";
import { store } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

/** One-time: set the admin password. Needs ADMIN_SETUP_TOKEN, and only works once. */
export async function POST(req: Request) {
  const bad = await guard({ auth: false });
  if (bad) return bad;
  const { ip } = await clientInfo();
  if (await limited(`setup:${ip}`, 5, 3600)) return json(429, { error: "Too many attempts. Try again in an hour." });
  if (await store().get("admin:password")) return json(409, { error: "Setup is already done. Sign in instead." });

  const want = process.env.ADMIN_SETUP_TOKEN;
  const body = await readJson(req);
  const token = String(body?.token ?? "");
  const password = String(body?.password ?? "");
  if (!want || want.length < 24 || !safeEqual(token, want)) return json(403, { error: "That setup code isn't right." });
  if (password.length < 12) return json(400, { error: "Use at least 12 characters." });

  await store().set("admin:password", await hashPassword(password));
  await createSession("setup");
  await alert("Admin password was set", `The admin password for amrsamir.me was set from IP ${ip}. If this wasn't you, rotate ADMIN_SESSION_SECRET in Vercel now.`);
  return json(200, { ok: true });
}
