"use client";

import type { AnchorHTMLAttributes, Ref } from "react";
import { track } from "./PostHogInit";

/** A plain <a> that records a named analytics event on click. */
export function TrackedLink({ event, props, onClick, ref, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { event: string; props?: Record<string, unknown>; ref?: Ref<HTMLAnchorElement> }) {
  return (
    <a
      ref={ref}
      {...rest}
      onClick={(e) => {
        track(event, props);
        onClick?.(e);
      }}
    />
  );
}
