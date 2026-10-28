import "server-only";

/** Owner inbox for admin mail (security alerts, password reset links). */
export const adminInbox = () => process.env.ADMIN_ALERT_TO ?? process.env.CONTACT_TO ?? "";
export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY && adminInbox());

/** Sends admin mail to the owner inbox only. Returns true when Resend accepted it. */
export async function sendAdminMail(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = adminInbox();
  if (!key || !to) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "amrsamir.me <website@amrsamir.me>",
      to: to.split(",").map((s) => s.trim()),
      subject: `[amrsamir.me admin] ${subject}`,
      text,
    }),
  }).catch(() => null);
  return Boolean(res?.ok);
}

/** Security alerts by email (Resend). Silent no-op when email isn't configured. */
export async function alert(subject: string, text: string) {
  await sendAdminMail(subject, text);
}
