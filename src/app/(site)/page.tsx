import { HomeDesktop, type FeaturedItem } from "@/components/HomeDesktop";
import { MobileHome } from "@/components/MobileHome";
import { getProjects, getSite } from "@/lib/content";
import type { DoorSlug } from "@/lib/doors";

export default async function Home() {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);
  const featured: FeaturedItem[] = projects
    .filter((p) => p.entry.featured && p.entry.tracks.length)
    .slice(0, 8)
    .map((p) => ({
      slug: p.slug,
      title: p.entry.title,
      year: p.entry.year,
      track: p.entry.tracks[0] as DoorSlug,
      tracks: [...p.entry.tracks] as DoorSlug[],
    }));

  return (
    <>
      <div className="home-desktop">
        <HomeDesktop
          name={site.name}
          headline={site.headline}
          about={site.about}
          location={site.location}
          languages={site.languages}
          now={site.now}
          featured={featured}
        />
      </div>
      <div className="home-mobile">
        <MobileHome name={site.name} headline={site.headline} now={site.now} />
      </div>
    </>
  );
}
