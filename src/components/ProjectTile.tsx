import Link from "next/link";
import { DOORS, type DoorSlug } from "@/lib/doors";

type Tile = {
  href: string;
  title: string;
  summary?: string;
  meta?: string;
  cover?: string | null;
  color?: string;
};

export function ProjectTile({ href, title, summary, meta, cover, color }: Tile) {
  return (
    <article className="tile">
      <div className="tile-cover" style={color ? { background: color } : undefined}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" loading="lazy" />
        ) : (
          <div className="tile-cover-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="tile-body">
        <h3 className="h3">
          <Link href={href}>{title}</Link>
        </h3>
        {meta ? <p className="subtle mt-0.5 text-[12px]">{meta}</p> : null}
        {summary ? <p className="muted mt-1.5 text-[13px] leading-snug">{summary}</p> : null}
      </div>
    </article>
  );
}

export function trackColor(tracks: readonly string[], current?: DoorSlug) {
  const t = (current && tracks.includes(current) ? current : tracks[0]) as DoorSlug | undefined;
  return t ? DOORS[t].color : undefined;
}
