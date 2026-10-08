import Link from "next/link";
import { AppIcon, APPS, type AppKey } from "./AppIcon";

const GRID: AppKey[] = ["events", "marketing", "tech", "lab", "film", "cv", "contact"];

export function MobileHome({ name, headline, now }: { name: string; headline: string; now: string }) {
  return (
    <div className="mx-auto max-w-[520px] px-5 pt-[calc(var(--menubar-h)+22px)] pb-16">
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
      </section>

      <section className="win-classic mt-5" aria-label="Now">
        <div className="classic-bar">
          <span className="classic-box" aria-hidden="true" />
          <span className="classic-title">Now</span>
          <span className="w-[11px]" aria-hidden="true" />
        </div>
        <p className="px-3 py-3 text-[14px] leading-snug">{now}</p>
      </section>

      <nav aria-label="Apps" className="mt-8">
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
    </div>
  );
}
