import Link from "next/link";
import { AppIcon, APPS, type AppKey } from "./AppIcon";
import { EventPool } from "./EventPool";
import { TrackedLink } from "./TrackedLink";
import { BrandStrip } from "./BrandStrip";
import type { PoolEvent } from "@/lib/pool";

const GRID: AppKey[] = ["events", "marketing", "tech", "lab", "film", "cv", "contact"];

export function MobileHome({
  name,
  headline,
  now,
  events,
  brands,
  companies,
}: {
  name: string;
  headline: string;
  now: string;
  events: PoolEvent[];
  brands: { slug: string; name: string; logo: string | null; wordmark?: boolean }[];
  companies: { slug: string; title: string; url: string }[];
}) {
  return (
    <div className="mx-auto max-w-[520px] px-5 pt-[calc(var(--menubar-h)+22px)] pb-16 lg:pb-32">
      <section className="widget px-5 pt-5 pb-6" aria-labelledby="m-name">
        <h1 id="m-name" className="display text-[44px]">
          {name}
        </h1>
        <p className="mt-3 text-[17px] leading-[1.35] font-medium" style={{ fontFamily: "var(--font-display)" }}>
          {headline}
        </p>
        <div className="mt-5 flex gap-2">
          <Link href="/contact" className="btn btn-primary">
            Get in touch
          </Link>
          <Link href="/cv" className="btn">
            Open CV
          </Link>
        </div>
        {companies.length ? (
          <p className="mt-5 text-[14px]">
            <span className="subtle">My companies: </span>
            {companies.map((c, i) => (
              <span key={c.slug}>
                {i ? ", " : ""}
                <TrackedLink event="company_click" props={{ company: c.title, from: "mobile" }} href={c.url} target="_blank" rel="noopener" className="font-medium underline decoration-[var(--hairline-strong)] underline-offset-[3px]">
                  {c.title}
                </TrackedLink>
              </span>
            ))}
          </p>
        ) : null}
      </section>

      <div className="widget mt-5 overflow-hidden px-1">
        <BrandStrip brands={brands} />
      </div>

      <section className="win-classic mt-5" aria-label="Now">
        <div className="classic-bar">
          <span className="classic-box" aria-hidden="true" />
          <span className="classic-title">Now</span>
          <span className="w-[11px]" aria-hidden="true" />
        </div>
        <p className="px-3 py-3 text-[14px] leading-snug">{now}</p>
      </section>

      <nav aria-label="Apps" className="mt-8 lg:hidden">
        <ul className="ios-grid">
          {GRID.map((k) => (
            <li key={k}>
              <Link href={APPS[k].href} className="ios-app">
                <AppIcon app={k} size={60} />
                <span>{APPS[k].label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="widget mt-8 overflow-hidden" aria-labelledby="m-events">
        <h2 id="m-events" className="h3 px-4 pt-4 pb-1">
          Events I&apos;ve delivered
        </h2>
        <EventPool events={events} limit={8} />
      </section>
    </div>
  );
}
