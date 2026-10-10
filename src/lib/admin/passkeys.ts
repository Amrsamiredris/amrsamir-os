import "server-only";
import { headers } from "next/headers";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { store } from "./store";

export type StoredPasskey = {
  id: string;
  publicKey: string; // base64url
  counter: number;
  transports?: AuthenticatorTransportFuture[];
  name: string;
  createdAt: number;
  lastUsedAt?: number;
};

export async function rp() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "localhost").split(",")[0].trim();
  const hostname = host.split(":")[0];
  const proto = hostname === "localhost" || hostname === "127.0.0.1" ? "http" : "https";
  const fixed = process.env.ADMIN_RP_ID;
  // Passkeys belong to one domain. On preview URLs (different domain) use that host; password sign-in still works there.
  const rpID = fixed && (hostname === fixed || hostname.endsWith(`.${fixed}`)) ? fixed : hostname;
  return { rpID, origin: `${proto}://${host}`, rpName: "amrsamir.me admin" };
}

export async function listPasskeys() {
  return (await store().get<StoredPasskey[]>("admin:passkeys")) ?? [];
}

export async function savePasskeys(list: StoredPasskey[]) {
  await store().set("admin:passkeys", list);
}
