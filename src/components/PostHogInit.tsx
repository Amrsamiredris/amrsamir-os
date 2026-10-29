"use client";

import { useEffect } from "react";
import type { PostHog } from "posthog-js";

/**
 * PostHog: visitors, sources, pages, clicks/downloads (autocapture), session recordings and heatmaps.
 * Traffic goes through /ingest on this domain (see next.config.ts) so ad blockers and the CSP stay simple.
 *
 * The SDK (~90 KB gzipped with recordings) is loaded after the page is idle, not in the first bundle,
 * so it never delays the first tap. Events tracked before it loads are queued and sent once it's ready.
 */
let ph: PostHog | null = null;
const queue: [string, Record<string, unknown> | undefined][] = [];

export function PostHogInit({ apiKey }: { apiKey: string }) {
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/admin") || path.startsWith("/keystatic")) return;
    let cancelled = false;

    const load = async () => {
      if (cancelled || ph) return;
      const { default: posthog } = await import("posthog-js");
      if (cancelled || posthog.__loaded) return;
      let isOwner = false;
      try {
        isOwner = localStorage.getItem("amr_owner") === "1";
      } catch {}
      posthog.init(apiKey, {
        api_host: "/ingest",
        ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST ?? "https://eu.posthog.com",
        defaults: "2025-05-24",
        capture_pageview: "history_change",
        person_profiles: "identified_only",
        session_recording: { maskAllInputs: true },
      });
      // Don't count the site owner's own visits (set when signing in to /admin).
      if (isOwner) posthog.opt_out_capturing();
      ph = posthog;
      for (const [event, props] of queue.splice(0)) posthog.capture(event, props);
    };

    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const start = () => (w.requestIdleCallback ? w.requestIdleCallback(() => void load(), { timeout: 4000 }) : window.setTimeout(load, 2500));
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
    };
  }, [apiKey]);
  return null;
}

/** Fire a named event. Queued until PostHog has loaded; never throws. */
export function track(event: string, props?: Record<string, unknown>) {
  try {
    if (ph) ph.capture(event, props);
    else if (queue.length < 20) queue.push([event, props]);
  } catch {
    /* analytics must never break the page */
  }
}
