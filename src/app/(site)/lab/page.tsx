import type { Metadata } from "next";
import { Window } from "@/components/Window";
import { ProjectTile } from "@/components/ProjectTile";
import { getLab } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lab",
  description: "Side projects, apps and experiments by Amr Samir Edris.",
  alternates: { canonical: "/lab" },
};

const STATUS = { live: "Live", wip: "In progress", archived: "Archived" } as const;

export default async function Lab() {
  const items = await getLab();
  const companies = items.filter((i) => i.entry.kind === "company");
  const projects = items.filter((i) => i.entry.kind !== "company");
  return (
    <div className="door-stage">
      <Window title="Lab" className="door-win" closeHref="/" closeLabel="Close Lab and go back to the desktop">
        <div className="door-scroll h-full">
          <div className="door-content">
            <h1 className="display text-[clamp(44px,6vw,80px)]">Lab</h1>
            <p className="muted mt-3 max-w-[56ch]">Companies I&apos;m building, plus side projects, apps and experiments. Some are live, some are half-built.</p>
            {companies.length ? (
              <section className="mt-10" aria-labelledby="companies">
                <h2 id="companies" className="h2">
                  Companies
                </h2>
                <div className="tile-grid mt-4">
                  {companies.map((i) => (
                    <ProjectTile
                      key={i.slug}
                      href={`/lab/${i.slug}`}
                      title={i.entry.title}
                      summary={i.entry.summary}
                      meta={STATUS[i.entry.status]}
                      cover={i.entry.cover}
                      color="#23262d"
                    />
                  ))}
                </div>
              </section>
            ) : null}
            {companies.length && projects.length ? (
              <h2 className="h2 mt-14">Side projects</h2>
            ) : null}
            <div className="tile-grid mt-4">
              {projects.map((i) => (
                <ProjectTile
                  key={i.slug}
                  href={`/lab/${i.slug}`}
                  title={i.entry.title}
                  summary={i.entry.summary}
                  meta={STATUS[i.entry.status]}
                  cover={i.entry.cover}
                  color="#23262d"
                />
              ))}
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
}
