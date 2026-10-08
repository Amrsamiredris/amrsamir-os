import type { Metadata } from "next";
import { Window } from "@/components/Window";
import { ProjectTile } from "@/components/ProjectTile";
import { getFilms } from "@/lib/content";

export const metadata: Metadata = {
  title: "Film",
  description: "Short films, timelapses and video work by Amr Samir Edris.",
  alternates: { canonical: "/film" },
};

export default async function Film() {
  const films = await getFilms();
  return (
    <div className="door-stage">
      <Window title="Film" className="door-win" closeHref="/" closeLabel="Close Film and go back to the desktop">
        <div className="door-scroll h-full">
          <div className="door-content">
            <h1 className="display text-[clamp(44px,6vw,80px)]">Film</h1>
            <p className="muted mt-3 max-w-[56ch]">Short films, timelapses and things shot for the love of it.</p>
            <div className="tile-grid mt-8">
              {films.map((f) => (
                <ProjectTile
                  key={f.slug}
                  href={`/film/${f.slug}`}
                  title={f.entry.title}
                  summary={f.entry.summary}
                  meta={[f.entry.year, f.entry.role].filter(Boolean).join(", ")}
                  cover={f.entry.cover}
                  color="#1b1c20"
                />
              ))}
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
}
