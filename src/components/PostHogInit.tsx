"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * PostHog: visitors, sources, pages, clicks/downloads (autocapture), session recordings and heatmaps.
 * Traffic goes through /ingest on this domain (see next.config.ts) so ad blockers and the CSP stay simple.
 */
export function PostHogInit({ apiKey }: { apiKey: string }) {
  useEffect(() => {
    if (posthog.__loaded) return;
    const path = window.location.pathname;
    if (path.startsWith("/admin") || path.startsWith("/keystatic")) return;
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
  }, [apiKey]);
  return null;
}

/** Fire a named event if PostHog is running; no-op otherwise. */
export function track(event: string, props?: Record<string, unknown>) {
  try {
    if (posthog.__loaded) posthog.capture(event, props);
  } catch {
    /* analytics must never break the page */
  }
}
