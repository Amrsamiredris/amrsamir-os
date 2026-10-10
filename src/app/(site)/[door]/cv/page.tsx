import type { Metadata } from "next";
import { getCvExtras, getDoor, getExperience, getSite } from "@/lib/content";
import { DOORS, type DoorSlug } from "@/lib/doors";
import { TrackedLink } from "@/components/TrackedLink";

export async function generateMetadata({ params }: PageProps<"/[door]/cv">): Promise<Metadata> {
  const { door } = (await params) as { door: DoorSlug };
  return { title: `${DOORS[door].label} CV`, alternates: { canonical: `/${door}/cv` } };
}

function period(start: string, end: string) {
  const f = (s: string) => {
    const m = /^(\d{4})-(\d{2})$/.exec(s);
    if (!m) return s;
    return new Date(Number(m[1]), Number(m[2]) - 1).toLocaleString("en-GB", { month: "short", year: "numeric" });
  };
  return start === end ? f(start) : `${f(start)} – ${f(end)}`;
}

export default async function DoorCv({ params }: PageProps<"/[door]/cv">) {
  const { door } = (await params) as { door: DoorSlug };
  const [site, content, experience, extras] = await Promise.all([getSite(), getDoor(door), getExperience(door), getCvExtras()]);
  const skills = extras?.skills.filter((s) => s.tracks.includes(door)) ?? [];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="h2">{DOORS[door].label} CV</h1>
        {content.cvPdf || site.cvPdf ? (
          <TrackedLink event="cv_download" props={{ cv: door }} href={content.cvPdf || site.cvPdf || undefined} className="btn btn-primary" download>
            {content.cvPdf ? "Download PDF" : "Download full CV (PDF)"}
          </TrackedLink>
        ) : (
          <span className="btn" aria-disabled="true" title="Upload a PDF for this track in the content editor">
            PDF not uploaded yet
          </span>
        )}
      </div>

      <div className="paper max-w-[820px]">
        <header>
          <p className="display text-[40px] text-[#17181b]">{site.name}</p>
          <p className="muted mt-2 text-[14px]">
            {[site.location, site.email, site.phone].filter(Boolean).join("  /  ")}
          </p>
          {content.cvSummary ? <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed">{content.cvSummary}</p> : null}
        </header>

        <section className="mt-9" aria-labelledby="cv-exp">
          <h2 id="cv-exp" className="border-b border-black/15 pb-1.5 text-[13px] font-semibold">
            Experience
          </h2>
          <ol className="mt-4 space-y-6">
            {experience.map((e) => (
              <li key={e.slug} className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-5">
                <p className="subtle pt-0.5 text-[13px] tabular-nums">{period(e.entry.start, e.entry.end)}</p>
                <div>
                  <h3 className="text-[15px] font-semibold">{e.entry.role}</h3>
                  <p className="muted text-[13px]">{[e.entry.organisation, e.entry.location].filter(Boolean).join(", ")}</p>
                  {e.entry.highlights.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[14px] leading-snug">
                      {e.entry.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {skills.length ? (
          <section className="mt-9" aria-labelledby="cv-skills">
            <h2 id="cv-skills" className="border-b border-black/15 pb-1.5 text-[13px] font-semibold">
              Skills
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <li key={s.name} className="rounded-md bg-black/[0.05] px-2.5 py-1 text-[13px]">
                  {s.name}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {extras?.education.length ? (
          <section className="mt-9" aria-labelledby="cv-edu">
            <h2 id="cv-edu" className="border-b border-black/15 pb-1.5 text-[13px] font-semibold">
              Education
            </h2>
            <ul className="mt-3 space-y-1 text-[14px]">
              {extras.education.map((e) => (
                <li key={e.degree}>
                  <span className="font-medium">{e.degree}</span>, {e.school}
                  {e.year ? <span className="subtle">, {e.year}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {extras?.certifications.length ? (
          <section className="mt-9" aria-labelledby="cv-cert">
            <h2 id="cv-cert" className="border-b border-black/15 pb-1.5 text-[13px] font-semibold">
              Certifications
            </h2>
            <ul className="mt-3 grid gap-x-6 gap-y-1 text-[14px] sm:grid-cols-2">
              {extras.certifications.map((c) => (
                <li key={c.name}>
                  {c.name}
                  <span className="subtle">
                    {c.issuer ? `, ${c.issuer}` : ""}
                    {c.status === "in-progress" ? " (in progress)" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
