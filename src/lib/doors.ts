export const DOOR_SLUGS = ["events", "marketing", "tech"] as const;
export type DoorSlug = (typeof DOOR_SLUGS)[number];

export type Door = {
  slug: DoorSlug;
  label: string;
  /** Fill / large-type accent */
  color: string;
  /** Text-safe accent (≥4.5:1 on light glass) */
  ink: string;
  /** Text-safe accent for dark mode */
  inkDark: string;
};

/**
 * v2 palette: the three accents share one OKLCH lightness (0.57) and chroma (0.19),
 * so they read as one family against the slate desktop. White on each fill is >= 4.5:1.
 */
export const DOORS: Record<DoorSlug, Door> = {
  events: { slug: "events", label: "Events", color: "#C05100", ink: "#9E4500", inkDark: "#FA9D6B" },
  marketing: { slug: "marketing", label: "Marketing", color: "#C7367B", ink: "#A72A68", inkDark: "#F893BC" },
  tech: { slug: "tech", label: "Tech", color: "#486BE5", ink: "#3A58C3", inkDark: "#99B5FF" },
};

export function isDoor(value: string): value is DoorSlug {
  return (DOOR_SLUGS as readonly string[]).includes(value);
}

/** Accent used by the wallpaper and chrome for a given pathname. */
export function accentForPath(pathname: string): { color: string; key: string } {
  const first = pathname.split("/")[1] ?? "";
  if (isDoor(first)) return { color: DOORS[first].color, key: first };
  return { color: "var(--wall-ink)", key: "home" };
}
