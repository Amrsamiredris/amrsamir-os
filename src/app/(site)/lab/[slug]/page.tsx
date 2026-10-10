import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Window } from "@/components/Window";
import { Prose } from "@/components/Prose";
import { getLab, getLabItem } from "@/lib/content";

export const dynamicParams = false;
export async function generateStaticParams() {
  return (await getLab()).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/lab/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const i = await getLabItem(slug);
  return i ? { title: i.title, description: i.summary, alternates: { canonical: `/lab/${slug}` } } : {};
}

export default async function LabItem({ params }: PageProps<"/lab/[slug]">) {
  const { slug } = await params;
  const i = await getLabItem(slug);
  if (!i) notFound();
  return (
    <div className="door-stage">
      <Window title={`Lab / ${i.title}`} className="door-win" closeHref="/lab" closeLabel="Close and go back to Lab">
        <div className="door-scroll h-full">
          <article className="door-content">
            <Link href="/lab" className="subtle text-[13px] hover:underline">
              ‹ Lab
            </Link>
            <h1 className="display mt-3 text-[clamp(38px,5vw,68px)]">{i.title}</h1>
            {i.summary ? <p className="mt-4 max-w-[60ch] text-[18px] leading-[1.4]">{i.summary}</p> : null}
            {i.url ? (
              <a href={i.url} className="btn btn-primary mt-6" target="_blank" rel="noopener noreferrer">
                Open {i.title}
              </a>
            ) : (
              <p className="subtle mt-6 text-[13px]">Not deployed yet.</p>
            )}
            {i.cover ? (
              <figure className="mt-8 max-w-[880px]">
                {i.url ? (
                  <a href={i.url} target="_blank" rel="noopener" className="block overflow-hidden rounded-[var(--radius-inner)] shadow-[var(--shadow-chip)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.cover} alt={`${i.title} website, home page`} className="block w-full" loading="lazy" />
                  </a>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.cover} alt={`${i.title}`} className="block w-full rounded-[var(--radius-inner)]" loading="lazy" />
                )}
                {i.url ? <figcaption className="subtle mt-2 text-[12px]">{i.url.replace(/^https?:\/\//, "")}</figcaption> : null}
              </figure>
            ) : null}
            <div className="mt-10">
              <Prose node={i.body.node} />
            </div>
          </article>
        </div>
      </Window>
    </div>
  );
}
