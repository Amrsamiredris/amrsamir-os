/**
 * Contact form endpoint.
 *
 * Defences, in order: same-origin check, body size cap, honeypot field, minimum fill time,
 * per-IP rate limit (best effort, per server instance), Cloudflare Turnstile verification,
 * strict field validation. Mail is sent with Resend; the visitor's address goes in Reply-To,
 * never in From, so replies work and the domain's SPF/DKIM stay valid.
 *
 * Env (Vercel): RESEND_API_KEY, TURNSTILE_SECRET_KEY, CONTACT_TO, CONTACT_FROM (optional)
 */

import { store, storeConfigured } from "@/lib/admin/store";
import { limited } from "@/lib/admin/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOPICS = ["Event project", "Marketing", "Tech & AI", "Job or role", "Something else"] as const;
const MAX_BODY = 16_000;
const MIN_FILL_MS = 3_000;
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r/g, "").trim().slice(0, max) : "");
const oneLine = (s: string) => s.replace(/[\n\t]+/g, " ");

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) return json(403, { error: "Forbidden." });

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BODY) return json(413, { error: "Message is too long." });

  const { RESEND_API_KEY, TURNSTILE_SECRET_KEY, CONTACT_TO } = process.env;
  const from = process.env.CONTACT_FROM ?? "amrsamir.me <website@amrsamir.me>";
  if (!RESEND_API_KEY || !TURNSTILE_SECRET_KEY || !CONTACT_TO) {
    return json(503, { error: "The form isn't switched on yet. Use the email link below instead." });
  }

  let data: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) return json(413, { error: "Message is too long." });
    data = JSON.parse(raw);
  } catch {
    return json(400, { error: "Couldn't read the form. Refresh the page and try again." });
  }

  // Bots: honeypot filled or submitted faster than a human can type. Pretend success.
  const startedAt = Number(data.startedAt);
  if (clean(data.website, 200) || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return json(200, { ok: true });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const over = storeConfigured ? await limited(`contact:${ip}`, MAX_PER_WINDOW, WINDOW_MS / 1000).catch(() => rateLimited(ip)) : rateLimited(ip);
  if (over) return json(429, { error: "Too many messages from your connection. Try again in a few minutes." });

  const name = oneLine(clean(data.name, 100));
  const email = oneLine(clean(data.email, 200));
  const company = oneLine(clean(data.company, 120));
  const topic = TOPICS.find((t) => t === data.topic) ?? "Something else";
  const message = clean(data.message, 4_000);
  const token = clean(data.token, 2_048);

  if (name.length < 2) return json(400, { error: "Add your name.", field: "name" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(400, { error: "Check your email address.", field: "email" });
  if (message.length < 10) return json(400, { error: "Add a few more words to your message.", field: "message" });
  if (!token) return json(400, { error: "Complete the security check." });

  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
  })
    .then((r) => r.json() as Promise<{ success: boolean; hostname?: string }>)
    .catch(() => ({ success: false }));
  if (!verify.success) return json(400, { error: "The security check failed. Refresh the page and try again." });

  const subject = `[amrsamir.me] ${topic}: ${name}${company ? `, ${company}` : ""}`.slice(0, 180);
  const text = `${message}\n\n--\n${name}${company ? ` (${company})` : ""}\n${email}\nTopic: ${topic}\nSent from the amrsamir.me contact form`;
  const html = `<p style="white-space:pre-wrap;font:15px/1.5 system-ui,sans-serif">${esc(message)}</p><hr><p style="font:13px/1.5 system-ui,sans-serif;color:#555">${esc(name)}${company ? ` (${esc(company)})` : ""}<br>${esc(email)}<br>Topic: ${esc(topic)}<br>Sent from the amrsamir.me contact form</p>`;

  // Keep a copy in the admin inbox (works even if email delivery fails).
  if (storeConfigured) {
    await store()
      .lpush("contact:messages", { at: Date.now(), name, email, company, topic, message, ip }, 500)
      .catch(() => null);
  }

  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: CONTACT_TO.split(",").map((s) => s.trim()), reply_to: email, subject, text, html }),
  }).catch(() => null);

  if (!sent || !sent.ok) {
    return json(502, { error: "Your message didn't send. Use the email link below instead." });
  }
  return json(200, { ok: true });
}
