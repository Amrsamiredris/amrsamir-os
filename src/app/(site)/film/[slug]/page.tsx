import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Window } from "@/components/Window";
import { Prose } from "@/components/Prose";
import { getFilm, getFilms } from "@/lib/content";

export const dynamicParams = false;
export async function generateStaticParams() {
  return (await getFilms()).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/film/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFilm(slug);
  return f ? { title: f.title, description: f.summary, alternates: { canonical: `/film/${slug}` } } : {};
}

function embedUrl(url: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean).pop()}?dnt=1`;
  } catch {
    return null;
  }
  return null;
}

export default async function FilmPage({ params }: PageProps<"/film/[slug]">) {
  const { slug } = await params;
  const f = await getFilm(slug);
  if (!f) notFound();
  const embed = embedUrl(f.videoUrl);
  return (
    <div className="door-stage">
      <Window title={`Film / ${f.title}`} className="door-win" closeHref="/film" closeLabel="Close and go back to Film">
        <div className="door-scroll h-full">
          <article className="door-content">
            <Link href="/film" className="subtle text-[13px] hover:underline">
              ‹ Film
            </Link>
            <h1 className="display mt-3 text-[clamp(38px,5vw,68px)]">{f.title}</h1>
            <p className="muted mt-2 text-[13px]">{[f.year, f.role].filter(Boolean).join(", ")}</p>
            {embed ? (
              <div className="mt-6 aspect-video w-full max-w-[960px] overflow-hidden rounded-[var(--radius-inner)] bg-black">
                <iframe src={embed} title={f.title} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />
              </div>
            ) : (
              <div className="mt-6 grid aspect-video w-full max-w-[960px] place-items-center rounded-[var(--radius-inner)] bg-[#1b1c20] text-[13px] text-white/70">
                Video coming soon
              </div>
            )}
            {f.summary ? <p className="mt-6 max-w-[60ch] text-[17px]">{f.summary}</p> : null}
            <div className="mt-6">
              <Prose node={f.body.node} />
            </div>
          </article>
        </div>
      </Window>
    </div>
  );
}
