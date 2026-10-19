import type { CSSProperties, ReactNode } from "react";
import { DOORS } from "@/lib/doors";

export type AppKey = "events" | "marketing" | "tech" | "lab" | "film" | "cv" | "contact" | "eventechs" | "g4b" | "layerwise";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const GLYPHS: Record<AppKey, ReactNode> = {
  // Company marks, taken from each company's own favicon
  eventechs: (
    <svg viewBox="0 0 40 40" className="app-icon-full">
      <path d="M8 14V8h6M26 8h6v6M32 26v6h-6M14 32H8v-6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="square" />
      <rect x="12.5" y="13" width="15" height="4.2" fill="#fff" />
      <rect x="17.9" y="13" width="4.2" height="15" fill="#fff" />
      <rect x="25" y="23.5" width="4" height="4" fill="#FF6B1A" />
    </svg>
  ),
  g4b: (
    <svg viewBox="0 0 40 40" className="app-icon-full">
      <rect x="15.5" y="7" width="9" height="26" rx="3" fill="#ffe45c" />
      <rect x="7" y="15.5" width="26" height="9" rx="3" fill="#ffe45c" />
      <circle cx="20" cy="20" r="2.6" fill="#ff8fd0" />
    </svg>
  ),
  layerwise: (
    <svg viewBox="0 0 40 40" className="app-icon-full">
      <rect x="6" y="25" width="22" height="7" fill="#0a0a0a" />
      <rect x="10" y="16.5" width="22" height="7" fill="#f1e3b5" />
      <rect x="14" y="8" width="22" height="7" fill="#b0298f" />
    </svg>
  ),
  // spotlight on a stage
  events: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M7 3.5 9.5 6" />
      <rect x="2.6" y="1.8" width="5" height="3.2" rx="1" transform="rotate(35 5 3.4)" />
      <path d="M9 6.6 4 19h16L11.4 5.2" fill="currentColor" fillOpacity="0.28" stroke="none" />
      <path d="M2.5 20.5h19" />
    </svg>
  ),
  // broadcast / signal
  marketing: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4" />
      <path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
    </svg>
  ),
  // prompt
  tech: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="m5 7 5 5-5 5" />
      <path d="M12.5 17.5H19" />
    </svg>
  ),
  // flask
  lab: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M9.5 3h5M10 3v6.2L5 18.4A1.8 1.8 0 0 0 6.6 21h10.8a1.8 1.8 0 0 0 1.6-2.6L14 9.2V3" />
      <path d="M7.4 15h9.2" />
    </svg>
  ),
  // film frame
  film: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <rect x="3.5" y="4" width="17" height="16" rx="2" />
      <path d="M7.5 4v16M16.5 4v16M3.5 8h4M3.5 12h4M3.5 16h4M16.5 8h4M16.5 12h4M16.5 16h4" />
    </svg>
  ),
  // document
  cv: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M6 2.8h8.5L19 7.3V20a1.2 1.2 0 0 1-1.2 1.2H6A1.2 1.2 0 0 1 4.8 20V4A1.2 1.2 0 0 1 6 2.8Z" />
      <path d="M14.3 2.9v4.6H19M8 12h8M8 15.5h8M8 9h3" />
    </svg>
  ),
  // envelope
  contact: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.6 6.5 8.4 6.6 8.4-6.6" />
    </svg>
  ),
};

/**
 * v2 icon system: one tile family.
 * Doors (Events, Marketing, Tech) carry their accent; every utility app is the same slate tile.
 * Colour therefore always means "this is a door", never decoration.
 */
const TILE = { bg: "var(--tile)", fg: "var(--tile-fg)" };

export const APPS: Record<AppKey, { label: string; href: string; bg: string; fg: string; door?: boolean; external?: boolean }> = {
  eventechs: { label: "Eventechs", href: "https://eventechs.vercel.app", bg: "#2340FF", fg: "#fff", door: true, external: true },
  g4b: { label: "Games for Brands", href: "https://games-for-brands.vercel.app", bg: "#3a2bf5", fg: "#ffe45c", door: true, external: true },
  layerwise: { label: "Layerwise", href: "https://layerwise-website.vercel.app", bg: "#cbe4f2", fg: "#0a0a0a", door: true, external: true },
  events: { label: "Events", href: "/events", bg: DOORS.events.color, fg: "#fff", door: true },
  marketing: { label: "Marketing", href: "/marketing", bg: DOORS.marketing.color, fg: "#fff", door: true },
  tech: { label: "Tech", href: "/tech", bg: DOORS.tech.color, fg: "#fff", door: true },
  lab: { label: "Lab", href: "/lab", ...TILE },
  film: { label: "Film", href: "/film", ...TILE },
  cv: { label: "CV", href: "/cv", ...TILE },
  contact: { label: "Contact", href: "/contact", ...TILE },
};

export function AppIcon({ app, size = 54 }: { app: AppKey; size?: number }) {
  const a = APPS[app];
  return (
    <span
      className="app-icon"
      data-door={a.door ? "true" : undefined}
      aria-hidden="true"
      style={{ "--icon": `${size}px`, "--icon-bg": a.bg, "--icon-fg": a.fg } as CSSProperties}
    >
      {GLYPHS[app]}
    </span>
  );
}
