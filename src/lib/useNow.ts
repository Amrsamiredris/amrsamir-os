"use client";

import { useSyncExternalStore } from "react";

/** Current time, ticking every `ms`. Returns null during SSR so markup never mismatches. */
export function useNow(ms: number): Date | null {
  return useSyncExternalStore(
    (notify) => {
      const id = window.setInterval(notify, ms);
      return () => window.clearInterval(id);
    },
    () => Math.floor(Date.now() / ms),
    () => null,
  ) === null
    ? null
    : new Date();
}
