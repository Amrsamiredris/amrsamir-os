import "server-only";
import { createHash } from "node:crypto";
import { randomId } from "./crypto";
import { store } from "./store";

/** Password reset links: single use, 20 minutes, only the SHA-256 of the token is stored. */
export const RESET_MINUTES = 20;
const key = (token: string) => `admin:reset:${createHash("sha256").update(token).digest("base64url")}`;

export async function createResetToken(ip: string) {
  const token = randomId(32);
  await store().set(key(token), { createdAt: Date.now(), ip }, RESET_MINUTES * 60);
  return token;
}

/** Returns true once per valid token, then the token is gone. */
export async function consumeResetToken(token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return false;
  const k = key(token);
  const rec = await store().get(k);
  if (!rec) return false;
  await store().del(k);
  return true;
}

/** Fixed origin for links in emails. Never built from the request's Host header. */
export function siteOrigin() {
  if (process.env.ADMIN_ORIGIN) return process.env.ADMIN_ORIGIN.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:3000";
  return `https://${process.env.ADMIN_RP_ID ?? "amrsamir.me"}`;
}
