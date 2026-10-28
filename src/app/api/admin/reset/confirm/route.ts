import { guard, json, readJson } from "@/lib/admin/api";
import { hashPassword } from "@/lib/admin/crypto";
import { alert } from "@/lib/admin/notify";
import { limited } from "@/lib/admin/ratelimit";
import { consumeResetToken, invalidateResetTokens } from "@/lib/admin/reset";
import { audit, clientInfo, createSession, revokeAll } from "@/lib/admin/session";
import { store } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const bad = await guard({ auth: false });
  if (bad) return bad;
  const info = await clientInfo();
  if (await limited(`resetconfirm:${info.ip}`, 10, 3600)) return json(429, { error: "Too many attempts. Try again later." });
  const body = await readJson(req);
  const token = String(body?.token ?? "");
  const password = String(body?.password ?? "");
  if (password.length < 12) return json(400, { error: "Use at least 12 characters." });
  if (!(await consumeResetToken(token))) {
    await audit("Password reset with invalid or expired link", info);
    return json(400, { error: "This reset link is invalid, expired or already used. Request a new one." });
  }

  await store().set("admin:password", await hashPassword(password));
  await invalidateResetTokens();
  // Sign out every other device, then sign this one in.
  await revokeAll();
  await createSession("password");
  await audit("Password reset by email link", info);
  await alert("Admin password was reset", `The admin password was reset with an email link from IP ${info.ip}.\nAll other devices were signed out.\n\nNot you? Request a new reset link now and add a passkey.`);
  return json(200, { ok: true });
}
