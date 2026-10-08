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

export const DOORS: Record<DoorSlug, Door> = {
  events: { slug: "events", label: "Events", color: "#EE6A1F", ink: "#B14700", inkDark: "#FF9A5C" },
  marketing: { slug: "marketing", label: "Marketing", color: "#D6247A", ink: "#A8155F", inkDark: "#FF7AB6" },
  tech: { slug: "tech", label: "Tech", color: "#3550FF", ink: "#2238D4", inkDark: "#8C9CFF" },
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
