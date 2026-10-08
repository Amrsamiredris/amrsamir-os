import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prose } from "@/components/Prose";
import { getProject, getProjects } from "@/lib/content";
import { DOOR_SLUGS, DOORS, type DoorSlug } from "@/lib/doors";

export const dynamicParams = false;

export async function generateStaticParams() {
  const out: { door: string; slug: string }[] = [];
  for (const door of DOOR_SLUGS) {
    for (const p of await getProjects(door)) out.push({ door, slug: p.slug });
  }
  return out;
}

export async function generateMetadata({ params }: PageProps<"/[door]/work/[slug]">): Promise<Metadata> {
  const { door, slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/${door}/work/${slug}` },
    openGraph: p.cover ? { images: [p.cover] } : undefined,
  };
}

export default async function ProjectPage({ params }: PageProps<"/[door]/work/[slug]">) {
  const { door, slug } = (await params) as { door: DoorSlug; slug: string };
  const p = await getProject(slug);
  if (!p) notFound();

  const meta = [
    { label: "Client", value: p.client },
    { label: "Role", value: p.role },
    { label: "Year", value: p.year },
    { label: "Location", value: p.location },
  ].filter((m) => m.value);

  return (
    <article>
      <Link href={`/${door}/work`} className="subtle text-[13px] hover:underline">
        ‹ {DOORS[door].label} work
      </Link>
      <h1 className="display mt-3 text-[clamp(38px,5vw,68px)]">{p.title}</h1>
      {p.summary ? (
        <p className="mt-4 max-w-[60ch] text-[19px] leading-[1.35] font-medium" style={{ fontFamily: "var(--font-display)" }}>
          {p.summary}
        </p>
      ) : null}

      <dl className="mt-6 grid max-w-[640px] grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-4">
        {meta.map((m) => (
          <div key={m.label}>
            <dt className="subtle">{m.label}</dt>
            <dd className="mt-0.5 font-medium">{m.value}</dd>
          </div>
        ))}
      </dl>

      {p.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.cover} alt="" className="mt-8 w-full max-w-[900px] rounded-[var(--radius-inner)]" />
      ) : null}

      {p.facts.length ? (
        <section aria-label="Key facts" className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          {p.facts.map((f) => (
            <div key={f.label}>
              <p className="display accent-ink text-[40px]">{f.value}</p>
              <p className="muted mt-1 text-[13px]">{f.label}</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="mt-10">
        <Prose node={p.body.node} />
      </div>

      {p.tracks.length > 1 ? (
        <p className="subtle mt-10 text-[13px]">
          Also in:{" "}
          {p.tracks
            .filter((t) => t !== door)
            .map((t, i) => (
              <span key={t}>
                {i > 0 ? ", " : ""}
                <Link className="underline underline-offset-2" href={`/${t}/work/${slug}`}>
                  {DOORS[t as DoorSlug].label}
                </Link>
              </span>
            ))}
        </p>
      ) : null}
    </article>
  );
}
