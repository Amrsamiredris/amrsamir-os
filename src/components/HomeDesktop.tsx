"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useDragControls, useReducedMotion } from "motion/react";
import { Window, ClassicWindow } from "./Window";
import { AppIcon, type AppKey } from "./AppIcon";
import { useNow } from "@/lib/useNow";
import { DOORS, type DoorSlug } from "@/lib/doors";

export type FeaturedItem = { slug: string; title: string; year: string; track: DoorSlug; tracks: DoorSlug[] };

type Props = {
  name: string;
  headline: string;
  about: string;
  location: string;
  languages: string;
  now: string;
  featured: FeaturedItem[];
};

type WinId = "about" | "featured" | "now" | "clock";

export function HomeDesktop(props: Props) {
  const area = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<WinId[]>(["clock", "now", "featured", "about"]);
  const front = (id: WinId) => setOrder((o) => [...o.filter((x) => x !== id), id]);
  const z = (id: WinId) => 10 + order.indexOf(id);

  return (
    <div ref={area} className="absolute inset-0 overflow-hidden" style={{ bottom: "var(--dock-space)" }}>
      <DesktopIcons />

      <Draggable
        id="about"
        area={area}
        z={z("about")}
        onFocus={front}
        delay={0}
        style={{ left: "4vw", top: "6vh", width: "clamp(420px, 38vw, 560px)" }}
        render={(barProps) => (
          <Window title="About Amr" barProps={barProps} headingId="about-title">
            <AboutBody {...props} />
          </Window>
        )}
      />

      <Draggable
        id="featured"
        area={area}
        z={z("featured")}
        onFocus={front}
        delay={0.08}
        style={{
          left: "calc(4vw + clamp(420px, 38vw, 560px) + 28px)",
          top: "4vh",
          width: "clamp(400px, 38vw, 580px)",
        }}
        render={(barProps) => (
          <Window title="Featured work" barProps={barProps} headingId="featured-title">
            <FeaturedList items={props.featured} />
          </Window>
        )}
      />

      <Draggable
        id="now"
        area={area}
        z={z("now")}
        onFocus={front}
        delay={0.16}
        style={{
          left: "calc(4vw + clamp(420px, 38vw, 560px) + 60px)",
          top: "calc(4vh + 330px)",
          width: 300,
        }}
        render={(barProps) => (
          <ClassicWindow title="Now" barProps={barProps}>
            <p className="px-3 py-3 text-[13px] leading-snug">{props.now}</p>
          </ClassicWindow>
        )}
      />

      <Draggable
        id="clock"
        area={area}
        z={z("clock")}
        onFocus={front}
        delay={0.24}
        style={{ left: "2.4vw", bottom: 24, width: 220 }}
        render={(barProps) => (
          <ClassicWindow title="Clock 1.0" barProps={barProps}>
            <ClassicClock />
          </ClassicWindow>
        )}
      />
    </div>
  );
}

/* ---------------- Draggable window wrapper ---------------- */

function Draggable({
  id,
  area,
  z,
  onFocus,
  style,
  delay,
  render,
}: {
  id: WinId;
  area: React.RefObject<HTMLDivElement | null>;
  z: number;
  onFocus: (id: WinId) => void;
  style: CSSProperties;
  delay: number;
  render: (barProps: Record<string, unknown>) => ReactNode;
}) {
  const controls = useDragControls();
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="absolute"
      style={{ ...style, zIndex: z }}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.08}
      dragConstraints={area}
      onPointerDownCapture={() => onFocus(id)}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={reduce ? { duration: 0.2 } : { type: "spring", bounce: 0, duration: 0.6, delay }}
    >
      {render({
        "data-draggable": "true",
        onPointerDown: (e: React.PointerEvent) => controls.start(e),
        style: { touchAction: "none" },
      })}
    </motion.div>
  );
}

/* ---------------- Window bodies ---------------- */

function AboutBody({ name, headline, about, location, languages }: Props) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="px-7 pt-7 pb-6">
      <div className="flex items-start gap-5">
        <div
          aria-hidden="true"
          className="grid h-[72px] w-[72px] flex-none place-items-center rounded-full text-[22px] font-bold text-white"
          style={{ background: "var(--wall-ink)", fontFamily: "var(--font-display)" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="display text-[clamp(40px,4.4vw,60px)]">{name}</h1>
        </div>
      </div>
      <p className="mt-5 text-[19px] leading-[1.35] font-medium tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)" }}>
        {headline}
      </p>
      <p className="muted mt-3 text-[14px]">{about}</p>

      <dl className="mt-5 grid grid-cols-[110px_1fr] gap-y-1.5 text-[13px]">
        <dt className="subtle">Based in</dt>
        <dd>{location}</dd>
        <dt className="subtle">Works across</dt>
        <dd className="flex flex-wrap gap-x-3">
          {(Object.keys(DOORS) as DoorSlug[]).map((d) => (
            <Link key={d} href={`/${d}`} className="underline decoration-[var(--hairline-strong)] underline-offset-[3px] hover:decoration-current">
              {DOORS[d].label}
            </Link>
          ))}
        </dd>
        <dt className="subtle">Languages</dt>
        <dd>{languages}</dd>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/contact" className="btn btn-primary">
          Get in touch
        </Link>
        <Link href="/cv" className="btn">
          Open CV
        </Link>
      </div>
    </div>
  );
}

function FeaturedList({ items }: { items: FeaturedItem[] }) {
  if (!items.length) {
    return <p className="subtle px-4 py-6 text-[13px]">No featured projects yet. Tick “Featured” on a project in the content editor.</p>;
  }
  return (
    <table className="finder-list">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Track</th>
          <th scope="col" className="text-right">
            Year
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.slug}>
            <td>
              <Link href={`/${p.track}/work/${p.slug}`}>{p.title}</Link>
            </td>
            <td className="whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5">
                {p.tracks.map((t) => (
                  <span key={t} className="inline-block h-2 w-2 rounded-full" style={{ background: DOORS[t].color }} aria-hidden="true" />
                ))}
                {p.tracks.map((t) => DOORS[t].label).join(" + ")}
              </span>
            </td>
            <td className="text-right tabular-nums">{p.year}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ClassicClock() {
  const now = useNow(1000);
  const fmt = (o: Intl.DateTimeFormatOptions) => (now ? new Intl.DateTimeFormat("en-GB", { ...o, timeZone: "Asia/Dubai" }).format(now) : "");
  return (
    <div className="px-3 py-3">
      <p className="pixel text-[28px] leading-none tabular-nums" aria-live="off">
        {fmt({ hour: "2-digit", minute: "2-digit", second: "2-digit" }) || "--:--:--"}
      </p>
      <p className="pixel mt-2 text-[10px]">{fmt({ weekday: "long", day: "numeric", month: "short" })}</p>
      <p className="pixel text-[10px]">Abu Dhabi, UAE</p>
    </div>
  );
}

const ICONS: { app: AppKey; label: string; href: string; download?: boolean }[] = [
  { app: "lab", label: "Lab", href: "/lab" },
  { app: "film", label: "Film", href: "/film" },
  { app: "cv", label: "CV", href: "/cv" },
  { app: "contact", label: "Contact card", href: "/contact/vcard", download: true },
];

function DesktopIcons() {
  return (
    <nav aria-label="Desktop" className="absolute top-5 right-4 z-[5] flex flex-col gap-3">
      {ICONS.map((i) =>
        i.download ? (
          <a key={i.label} href={i.href} className="desk-icon" download>
            <AppIcon app={i.app} size={52} />
            <span>{i.label}</span>
          </a>
        ) : (
          <Link key={i.label} href={i.href} className="desk-icon">
            <AppIcon app={i.app} size={52} />
            <span>{i.label}</span>
          </Link>
        ),
      )}
    </nav>
  );
}
