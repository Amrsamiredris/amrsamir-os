import { guard, json, readJson } from "@/lib/admin/api";
import { hashPassword, verifyPassword } from "@/lib/admin/crypto";
import { alert } from "@/lib/admin/notify";
import { limited } from "@/lib/admin/ratelimit";
import { audit, clientInfo, getSession } from "@/lib/admin/session";
import { invalidateResetTokens } from "@/lib/admin/reset";
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
  // A passkey sign-in in the last 15 minutes is enough proof; no old password needed.
  const s = await getSession();
  const freshPasskey = s?.method === "passkey" && Date.now() - s.createdAt < 15 * 60_000;
  if (!freshPasskey && !(await verifyPassword(current, await store().get<string>("admin:password")))) {
    return json(401, { error: current ? "Current password is wrong." : "Enter your current password, or sign in again with Touch ID first." });
  }
  if (next.length < 12) return json(400, { error: "Use at least 12 characters." });
  await store().set("admin:password", await hashPassword(next));
  await invalidateResetTokens();
  await audit("Password changed", info);
  await alert("Admin password changed", `The admin password was changed from IP ${info.ip}.`);
  return json(200, { ok: true });
}
