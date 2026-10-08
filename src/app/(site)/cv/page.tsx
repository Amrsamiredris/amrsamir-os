import type { Metadata } from "next";
import Link from "next/link";
import { Window } from "@/components/Window";
import { AppIcon } from "@/components/AppIcon";
import { getDoor } from "@/lib/content";
import { DOOR_SLUGS, DOORS } from "@/lib/doors";

export const metadata: Metadata = { title: "CV", alternates: { canonical: "/cv" } };

export default async function CvChooser() {
  const doors = await Promise.all(DOOR_SLUGS.map(async (d) => ({ d, c: await getDoor(d) })));
  return (
    <div className="door-stage">
      <Window title="CV" className="door-win" closeHref="/" closeLabel="Close CV and go back to the desktop">
        <div className="door-content">
          <h1 className="display text-[clamp(44px,6vw,80px)]">Pick a CV</h1>
          <p className="muted mt-3 max-w-[56ch]">Each track has its own CV, focused on the work that matters for it.</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {doors.map(({ d, c }) => (
              <li key={d}>
                <Link href={`/${d}/cv`} className="tile flex-row items-center gap-4 p-4">
                  <AppIcon app="cv" size={48} />
                  <span className="min-w-0">
                    <span className="block font-semibold" style={{ color: DOORS[d].ink }}>
                      {DOORS[d].label} CV
                    </span>
                    <span className="subtle block text-[12px] leading-snug">{c.tagline}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Window>
    </div>
  );
}
