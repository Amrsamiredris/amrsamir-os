import "server-only";
import { store } from "./store";

/** Returns true when the caller is over the limit. */
export async function limited(key: string, max: number, windowSeconds: number) {
  const n = await store().incr(`rl:${key}`, windowSeconds);
  return n > max;
}
