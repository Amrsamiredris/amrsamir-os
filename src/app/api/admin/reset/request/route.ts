import { guard, json } from "@/lib/admin/api";
import { mailConfigured, sendAdminMail } from "@/lib/admin/notify";
import { limited } from "@/lib/admin/ratelimit";
import { RESET_MINUTES, createResetToken, siteOrigin } from "@/lib/admin/reset";
import { audit, clientInfo } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

/**
 * Emails a one-time reset link to the owner inbox (ADMIN_ALERT_TO or CONTACT_TO).
 * Nobody can choose the recipient, so requesting a link only ever helps the owner.
 */
export async function POST() {
  const bad = await guard({ auth: false });
  if (bad) return bad;
  const info = await clientInfo();
  if ((await limited(`reset:${info.ip}`, 3, 3600)) || (await limited("reset:all", 6, 3600))) {
    return json(429, { error: "Too many reset requests. Try again in an hour." });
  }
  if (!mailConfigured()) return json(503, { error: "Email isn't configured on the server, so a reset link can't be sent." });

  const token = await createResetToken(info.ip);
  const link = `${siteOrigin()}/admin/reset?token=${token}`;
  const sent = await sendAdminMail(
    "Reset your admin password",
    `Someone asked to reset the amrsamir.me admin password.\n\nSet a new password (link works once, for ${RESET_MINUTES} minutes):\n${link}\n\nRequested from IP ${info.ip}\nDevice: ${info.ua}\n\nNot you? Ignore this email. Your password stays the same.`,
  );
  await audit(sent ? "Password reset link sent" : "Password reset email failed", info);
  if (!sent) return json(502, { error: "The email couldn't be sent. Try again in a minute." });
  return json(200, { ok: true });
}
