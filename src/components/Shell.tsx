"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, type MotionValue } from "motion/react";
import { Wallpaper } from "./Wallpaper";
import { AppIcon, APPS, type AppKey } from "./AppIcon";
import { useNow } from "@/lib/useNow";
import { DOORS, isDoor } from "@/lib/doors";

type ShellProps = { children: ReactNode; name: string; availability?: string | null };

export function Shell({ children, name, availability }: ShellProps) {
  const pathname = usePathname() ?? "/";
  const first = pathname.split("/")[1] ?? "";
  const door = isDoor(first) ? DOORS[first] : null;

  const vars = door
    ? ({ "--accent": door.color, "--accent-ink-l": door.ink, "--accent-ink-d": door.inkDark } as CSSProperties)
    : undefined;

  return (
    <div className="shell" data-door={door?.slug ?? "home"} style={vars}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Wallpaper />
      <MenuBar name={name} availability={availability} pathname={pathname} />
      <main id="main" className="site-main">
        {children}
      </main>
      <Dock pathname={pathname} />
    </div>
  );
}

/* ---------------- Menu bar ---------------- */

const NAV: { href: string; label: string }[] = [
  { href: "/events", label: "Events" },
  { href: "/marketing", label: "Marketing" },
  { href: "/tech", label: "Tech" },
  { href: "/lab", label: "Lab" },
  { href: "/film", label: "Film" },
  { href: "/cv", label: "CV" },
  { href: "/contact", label: "Contact" },
];

function MenuBar({ name, availability, pathname }: { name: string; availability?: string | null; pathname: string }) {
  return (
    <header className="menubar">
      <Link href="/" className="menubar-name" aria-label={`${name}, home`}>
        <LogoMark />
        <span className="ml-2">{name}</span>
      </Link>
      <nav aria-label="Main" className="menubar-nav">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={pathname.startsWith(n.href) ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="menubar-spacer" />
      {availability ? (
        <span className="menubar-item menubar-status hidden sm:inline-flex">
          <span className="status-dot" aria-hidden="true" />
          {availability}
        </span>
      ) : null}
      <Clock />
    </header>
  );
}

function LogoMark() {
  // 5×5 pixel "A" — the one classic-Mac glyph in the chrome
  const on = ["01110", "10001", "11111", "10001", "10001"];
  return (
    <svg viewBox="0 0 5 5" width="13" height="13" aria-hidden="true" className="inline-block align-[-1px]" shapeRendering="crispEdges">
      {on.flatMap((row, y) =>
        row.split("").map((b, x) => (b === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null)),
      )}
    </svg>
  );
}

function Clock() {
  const now = useNow(15_000);
  const label = now
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Dubai",
      })
        .format(now)
        .replace(",", "")
    : "";
  return (
    <span className="menubar-item tabular-nums" title="Time in the UAE">
      <span className="sr-only">Time in the UAE: </span>
      {label || " "}
    </span>
  );
}

/* ---------------- Dock ---------------- */

const DOCK: (AppKey | "sep")[] = ["events", "marketing", "tech", "sep", "lab", "film", "cv", "contact"];

function Dock({ pathname }: { pathname: string }) {
  const mouseX = useMotionValue(Infinity);
  const reduce = useReducedMotion();
  const first = pathname.split("/")[1] ?? "";
  // Phones get the home-screen app grid instead of a dock.
  return (
    <div className="dock-wrap hidden lg:flex">
      <nav aria-label="Dock">
        <motion.ul
          className="dock"
          onMouseMove={(e) => !reduce && mouseX.set(e.clientX)}
          onMouseLeave={() => mouseX.set(Infinity)}
        >
          {DOCK.map((k, i) =>
            k === "sep" ? (
              <li key={`sep-${i}`} className="dock-sep" aria-hidden="true" />
            ) : (
              <DockItem key={k} app={k} mouseX={mouseX} active={APPS[k].href === `/${first}`} />
            ),
          )}
        </motion.ul>
      </nav>
    </div>
  );
}

function DockItem({ app, mouseX, active }: { app: AppKey; mouseX: MotionValue<number>; active: boolean }) {
  const a = APPS[app];
  const ref = useRef<HTMLAnchorElement>(null);
  const distance = useTransform(mouseX, (x) => {
    const el = ref.current;
    if (x === Infinity || !el) return Infinity;
    const r = el.getBoundingClientRect();
    return x - (r.left + r.width / 2);
  });
  const target = useTransform(distance, [-140, 0, 140], [48, 72, 48], { clamp: true });
  const size = useSpring(target, { stiffness: 420, damping: 34, mass: 0.6 });

  return (
    <li className="dock-item" data-active={active}>
      <Link ref={ref} href={a.href} aria-label={a.label} aria-current={active ? "page" : undefined}>
        <motion.span style={{ display: "block", width: size, height: size }} className="dock-icon">
          <AppIcon app={app} size={48} />
        </motion.span>
      </Link>
      <span className="dock-tip" aria-hidden="true">
        {a.label}
      </span>
      <span className="dock-dot" aria-hidden="true" />
    </li>
  );
}
