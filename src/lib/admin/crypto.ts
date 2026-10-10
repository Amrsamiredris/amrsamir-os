import { createHmac, randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const randomId = (bytes = 24) => randomBytes(bytes).toString("base64url");

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scrypt(pw.normalize("NFKC"), salt, 64, PARAMS);
  return `scrypt$${PARAMS.N}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(pw: string, stored: string | null) {
  // Always do the work, so a missing password and a wrong one take the same time.
  const [, n, s, k] = (stored ?? "scrypt$32768$AAAAAAAAAAAAAAAAAAAAAA$AAAA").split("$");
  const key = await scrypt(pw.normalize("NFKC"), Buffer.from(s, "base64url"), 64, { ...PARAMS, N: Number(n) });
  const want = Buffer.from(k, "base64url");
  return Boolean(stored) && want.length === key.length && timingSafeEqual(want, key);
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV !== "production") return "dev-only-secret-dev-only-secret-dev-only";
  throw new Error("ADMIN_SESSION_SECRET must be set (32+ chars).");
}

/** token = base64url(json).sig */
export function sign(payload: object) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function unsign<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const want = createHmac("sha256", secret()).update(body).digest("base64url");
  if (!safeEqual(sig, want)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as T;
  } catch {
    return null;
  }
}
