import "server-only";

/** Security alerts by email (Resend). Silent no-op when email isn't configured. */
export async function alert(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_ALERT_TO ?? process.env.CONTACT_TO;
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "amrsamir.me <website@amrsamir.me>",
      to: to.split(",").map((s) => s.trim()),
      subject: `[amrsamir.me admin] ${subject}`,
      text,
    }),
  }).catch(() => null);
}
