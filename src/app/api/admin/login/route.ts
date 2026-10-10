import { guard, json, readJson } from "@/lib/admin/api";
import { verifyPassword } from "@/lib/admin/crypto";
import { alert } from "@/lib/admin/notify";
import { limited } from "@/lib/admin/ratelimit";
import { audit, clientInfo, createSession } from "@/lib/admin/session";
import { store } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const bad = await guard({ auth: false });
  if (bad) return bad;
  const info = await clientInfo();
  // Per-connection and site-wide limits: 5 tries per 15 min per IP, 20 per hour overall.
  if ((await limited(`login:${info.ip}`, 5, 900)) || (await limited("login:all", 20, 3600))) {
    await audit("Sign-in blocked (too many attempts)", info);
    return json(429, { error: "Too many attempts. Wait 15 minutes, or use your fingerprint." });
  }
  const body = await readJson(req);
  const ok = await verifyPassword(String(body?.password ?? ""), await store().get<string>("admin:password"));
  if (!ok) {
    await audit("Wrong password", info);
    return json(401, { error: "Wrong password." });
  }
  await createSession("password");
  await alert("New sign-in with password", `Signed in to amrsamir.me admin with the password.\nIP: ${info.ip}\nDevice: ${info.ua}\n\nNot you? Open Admin > Security and choose "Sign out everywhere", then change the password.`);
  return json(200, { ok: true });
}
