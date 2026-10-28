import "server-only";
import { createHash } from "node:crypto";
import { randomId } from "./crypto";
import { store } from "./store";

/**
 * Password reset links: single use, 20 minutes, only the SHA-256 of the token is stored.
 * Every token carries the current generation; a successful reset bumps the generation,
 * so every other outstanding link dies with it.
 */
export const RESET_MINUTES = 20;
const GEN = "admin:reset:gen";
const key = (token: string) => `admin:reset:${createHash("sha256").update(token).digest("base64url")}`;
const generation = async () => Number((await store().get(GEN)) ?? 0);

export async function createResetToken(ip: string) {
  const token = randomId(32);
  await store().set(key(token), { createdAt: Date.now(), ip, gen: await generation() }, RESET_MINUTES * 60);
  return token;
}

/** True once per valid, current-generation token. Read and delete are one atomic step. */
export async function consumeResetToken(token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return false;
  const rec = await store().getdel<{ gen?: number }>(key(token));
  return Boolean(rec) && Number(rec?.gen ?? 0) === (await generation());
}

/** Kill every outstanding reset link. Call after any successful reset or password change. */
export async function invalidateResetTokens() {
  await store().set(GEN, (await generation()) + 1);
}

/** Fixed origin for links in emails. Never built from the request's Host header. */
export function siteOrigin() {
  if (process.env.ADMIN_ORIGIN) return process.env.ADMIN_ORIGIN.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:3000";
  return `https://${process.env.ADMIN_RP_ID ?? "amrsamir.me"}`;
}
