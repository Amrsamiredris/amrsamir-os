"use client";

import { useEffect } from "react";

/** Marks this browser as the owner's, so the public site's analytics skip your own visits. */
export function OwnerFlag() {
  useEffect(() => {
    try {
      localStorage.setItem("amr_owner", "1");
    } catch {}
  }, []);
  return null;
}
