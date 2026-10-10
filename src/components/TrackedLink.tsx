"use client";

import type { AnchorHTMLAttributes } from "react";
import { track } from "./PostHogInit";

/** A plain <a> that records a named analytics event on click. */
export function TrackedLink({ event, props, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { event: string; props?: Record<string, unknown> }) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        track(event, props);
        onClick?.(e);
      }}
    />
  );
}
