import type { Metadata } from "next";
import Link from "next/link";
import { Window } from "@/components/Window";
import { TrackedLink } from "@/components/TrackedLink";
import { getCvExtras, getExperience, getSite } from "@/lib/content";
import { DOOR_SLUGS, DOORS } from "@/lib/doors";

export const metadata: Metadata = {
  title: "CV",
  description: "CV of Amr Samir Edris: events, project management, marketing and tech. Read it here or download the PDF.",
  alternates: { canonical: "/cv" },
};

function period(start: string, end: string) {
  const f = (s: string) => {
    const m = /^(\d{4})-(\d{2})$/.exec(s);
    if (!m) return s;
    return new Date(Number(m[1]), Number(m[2]) - 1).toLocaleString("en-GB", { month: "short", year: "numeric" });
  };
  return start === end ? f(start) : `${f(start)} – ${f(end)}`;
}

export default async function Cv() {
  const [site, experience, extras] = await Promise.all([getSite(), getExperience(), getCvExtras()]);

  return (
    <div className="door-stage">
      <Window title="CV" className="door-win contact-win" closeHref="/" closeLabel="Close CV and go back to the desktop">
        <div className="door-content">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="display text-[clamp(44px,6vw,80px)]">CV</h1>
              <p className="muted mt-3 max-w-[56ch]">Read it here, or download the PDF.</p>
            </div>
            {site.cvPdf ? (
              <TrackedLink event="cv_download" props={{ cv: "main" }} href={site.cvPdf} className="btn btn-primary" download="Amr-Samir-Edris-CV.pdf">
                Download CV (PDF)
              </TrackedLink>
            ) : null}
          </div>

          <article className="paper max-w-[860px]" aria-label="CV">
            <header>
              <p className="display text-[40px] text-[#17181b]">{site.name}</p>
              {site.cvTitle ? <p className="mt-2 text-[15px] font-medium">{site.cvTitle}</p> : null}
              <p className="muted mt-1 text-[13px]">
                {[site.location, site.email, site.phone].filter(Boolean).join("  /  ")}
              </p>
              {site.cvSummary ? <p className="mt-5 max-w-[66ch] text-[15px] leading-relaxed">{site.cvSummary}</p> : null}
            </header>

            <section className="mt-9" aria-labelledby="cv-exp">
              <h2 id="cv-exp" className="border-b border-black/15 pb-1.5 text-[13px] font-semibold">
                Experience
              </h2>
              <ol className="mt-4 space-y-7">
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

            {extras?.skills.length ? (
              <section className="mt-9" aria-labelledby="cv-skills">
                <h2 id="cv-skills" className="border-b border-black/15 pb-1.5 text-[13px] font-semibold">
                  Skills
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {extras.skills.map((s) => (
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
          </article>

          <p className="subtle mt-6 text-[13px]">
            Focused versions:{" "}
            {DOOR_SLUGS.map((d, i) => (
              <span key={d}>
                {i ? ", " : ""}
                <Link href={`/${d}/cv`} className="underline underline-offset-4">
                  {DOORS[d].label}
                </Link>
              </span>
            ))}
            .
          </p>
        </div>
      </Window>
    </div>
  );
}
