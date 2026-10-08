import type { Metadata } from "next";
import Link from "next/link";
import { ProjectTile, trackColor } from "@/components/ProjectTile";
import { getDoor, getProjects } from "@/lib/content";
import { DOORS, type DoorSlug } from "@/lib/doors";

export async function generateMetadata({ params }: PageProps<"/[door]">): Promise<Metadata> {
  const { door } = (await params) as { door: DoorSlug };
  const content = await getDoor(door);
  return {
    title: content.title,
    description: content.tagline,
    openGraph: { title: `${content.title} · Amr Samir Edris`, description: content.tagline, url: `/${door}` },
    alternates: { canonical: `/${door}` },
  };
}

export default async function DoorOverview({ params }: PageProps<"/[door]">) {
  const { door } = (await params) as { door: DoorSlug };
  const [content, projects] = await Promise.all([getDoor(door), getProjects(door)]);
  const work = projects.slice(0, 6);

  return (
    <>
      <header className="measure">
        <h1 className="display accent-ink text-[clamp(52px,8vw,104px)]">{content.title}</h1>
        <p className="mt-4 text-[22px] leading-[1.25] font-semibold tracking-[-0.015em]" style={{ fontFamily: "var(--font-display)" }}>
          {content.tagline}
        </p>
        {content.intro ? <p className="muted mt-4 text-[16px]">{content.intro}</p> : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/${door}/work`} className="btn btn-primary">
            See the work
          </Link>
          <Link href={`/${door}/cv`} className="btn">
            {DOORS[door].label} CV
          </Link>
        </div>
      </header>

      {content.capabilities.length ? (
        <section className="mt-14" aria-labelledby="caps">
          <h2 id="caps" className="h2">
            What I do
          </h2>
          <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {content.capabilities.map((c) => (
              <li key={c} className="flex gap-3 text-[15px]">
                <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--accent)" }} aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-14" aria-labelledby="work">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="work" className="h2">
            Selected work
          </h2>
          {projects.length > work.length ? (
            <Link href={`/${door}/work`} className="accent-ink text-[13px] font-medium">
              All {projects.length} projects
            </Link>
          ) : null}
        </div>
        {work.length ? (
          <div className="tile-grid mt-5">
            {work.map((p) => (
              <ProjectTile
                key={p.slug}
                href={`/${door}/work/${p.slug}`}
                title={p.entry.title}
                summary={p.entry.summary}
                meta={[p.entry.year, p.entry.role].filter(Boolean).join(", ")}
                cover={p.entry.cover}
                color={trackColor(p.entry.tracks, door)}
              />
            ))}
          </div>
        ) : (
          <p className="subtle mt-4">No projects in this track yet. Add one in the content editor and tick “{DOORS[door].label}”.</p>
        )}
      </section>
    </>
  );
}
