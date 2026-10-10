import { guard, json, readJson } from "@/lib/admin/api";
import { hashPassword, verifyPassword } from "@/lib/admin/crypto";
import { alert } from "@/lib/admin/notify";
import { limited } from "@/lib/admin/ratelimit";
import { audit, clientInfo } from "@/lib/admin/session";
import { store } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const bad = await guard({ auth: true });
  if (bad) return bad;
  const info = await clientInfo();
  if (await limited(`pwchange:${info.ip}`, 5, 900)) return json(429, { error: "Too many attempts. Try again later." });
  const body = await readJson(req);
  const current = String(body?.current ?? "");
  const next = String(body?.next ?? "");
  if (!(await verifyPassword(current, await store().get<string>("admin:password")))) return json(401, { error: "Current password is wrong." });
  if (next.length < 12) return json(400, { error: "Use at least 12 characters." });
  await store().set("admin:password", await hashPassword(next));
  await audit("Password changed", info);
  await alert("Admin password changed", `The admin password was changed from IP ${info.ip}.`);
  return json(200, { ok: true });
}
