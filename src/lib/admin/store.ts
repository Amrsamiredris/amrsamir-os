import "server-only";
import { Redis } from "@upstash/redis";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Tiny key-value store for the admin area and the contact inbox.
 * Production: Upstash Redis (Vercel Marketplace sets KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN).
 * Local dev only: a JSON file in .data/ so everything can be tested without an account.
 */
export interface Store {
  get<T = string>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string, ttlSeconds: number): Promise<number>;
  lpush(key: string, value: unknown, max: number): Promise<void>;
  lrange<T = unknown>(key: string, count: number): Promise<T[]>;
}

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

function redisStore(): Store {
  const r = new Redis({ url: url!, token: token! });
  return {
    get: (k) => r.get(k),
    async set(k, v, ttl) {
      if (ttl) await r.set(k, v, { ex: ttl });
      else await r.set(k, v);
    },
    async del(k) {
      await r.del(k);
    },
    async incr(k, ttl) {
      const n = await r.incr(k);
      if (n === 1) await r.expire(k, ttl);
      return n;
    },
    async lpush(k, v, max) {
      await r.lpush(k, v);
      await r.ltrim(k, 0, max - 1);
    },
    lrange: (k, n) => r.lrange(k, 0, n - 1),
  };
}

type FileData = Record<string, { v: unknown; exp?: number }>;
const FILE = path.join(process.cwd(), ".data", "admin-store.json");

function fileStore(): Store {
  const load = async (): Promise<FileData> => {
    try {
      const d = JSON.parse(await fs.readFile(FILE, "utf8")) as FileData;
      const now = Date.now();
      for (const k of Object.keys(d)) if (d[k].exp && d[k].exp! < now) delete d[k];
      return d;
    } catch {
      return {};
    }
  };
  const save = async (d: FileData) => {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(d, null, 1));
  };
  return {
    async get<T>(k: string) {
      return ((await load())[k]?.v as T) ?? null;
    },
    async set(k, v, ttl) {
      const d = await load();
      d[k] = { v, exp: ttl ? Date.now() + ttl * 1000 : undefined };
      await save(d);
    },
    async del(k) {
      const d = await load();
      delete d[k];
      await save(d);
    },
    async incr(k, ttl) {
      const d = await load();
      const n = Number(d[k]?.v ?? 0) + 1;
      d[k] = { v: n, exp: d[k]?.exp ?? Date.now() + ttl * 1000 };
      await save(d);
      return n;
    },
    async lpush(k, v, max) {
      const d = await load();
      const list = Array.isArray(d[k]?.v) ? (d[k].v as unknown[]) : [];
      d[k] = { v: [v, ...list].slice(0, max) };
      await save(d);
    },
    async lrange<T>(k: string, n: number) {
      const v = (await load())[k]?.v;
      return (Array.isArray(v) ? v.slice(0, n) : []) as T[];
    },
  };
}

export const storeConfigured = Boolean(url && token) || process.env.NODE_ENV !== "production";

let cached: Store | null = null;
export function store(): Store {
  if (cached) return cached;
  if (url && token) cached = redisStore();
  else if (process.env.NODE_ENV !== "production") cached = fileStore();
  else throw new Error("Admin storage is not configured (Upstash Redis env vars missing).");
  return cached;
}
