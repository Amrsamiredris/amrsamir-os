import type { Metadata } from "next";
import { ProjectTile, trackColor } from "@/components/ProjectTile";
import { getDoor, getProjects } from "@/lib/content";
import { DOORS, type DoorSlug } from "@/lib/doors";

export async function generateMetadata({ params }: PageProps<"/[door]/work">): Promise<Metadata> {
  const { door } = (await params) as { door: DoorSlug };
  const content = await getDoor(door);
  return { title: `${DOORS[door].label} work`, description: content.tagline, alternates: { canonical: `/${door}/work` } };
}

export default async function DoorWork({ params }: PageProps<"/[door]/work">) {
  const { door } = (await params) as { door: DoorSlug };
  const projects = await getProjects(door);
  return (
    <>
      <h1 className="display text-[clamp(40px,5vw,64px)]">Work</h1>
      <p className="muted mt-2">
        {projects.length} {projects.length === 1 ? "project" : "projects"} in {DOORS[door].label}.
      </p>
      <div className="tile-grid mt-8">
        {projects.map((p) => (
          <ProjectTile
            key={p.slug}
            href={`/${door}/work/${p.slug}`}
            title={p.entry.title}
            summary={p.entry.summary}
            meta={[p.entry.year, p.entry.client].filter(Boolean).join(", ")}
            cover={p.entry.cover}
            color={trackColor(p.entry.tracks, door)}
          />
        ))}
      </div>
    </>
  );
}
