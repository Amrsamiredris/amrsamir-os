import { HomeDesktop } from "@/components/HomeDesktop";
import { MobileHome } from "@/components/MobileHome";
import { getBrands, getEvents, getSite } from "@/lib/content";

export default async function Home() {
  const [site, events, brands] = await Promise.all([getSite(), getEvents(), getBrands()]);
  const pool = events.filter((e) => e.onHome);
  const strip = brands.map((b) => ({ slug: b.slug, name: b.name, logo: b.logo, wordmark: b.wordmark }));

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
          events={pool}
          brands={strip}
        />
      </div>
      <div className="home-mobile">
        <MobileHome name={site.name} headline={site.headline} now={site.now} events={pool} brands={strip} />
      </div>
    </>
  );
}
