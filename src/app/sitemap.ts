import type { MetadataRoute } from "next";
import { getFilms, getLab, getProjects } from "@/lib/content";
import { DOOR_SLUGS } from "@/lib/doors";

const BASE = "https://amrsamir.me";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls = ["", "/cv", "/contact", "/lab", "/film"];
  for (const d of DOOR_SLUGS) {
    urls.push(`/${d}`, `/${d}/work`, `/${d}/cv`);
    for (const p of await getProjects(d)) urls.push(`/${d}/work/${p.slug}`);
  }
  for (const l of await getLab()) urls.push(`/lab/${l.slug}`);
  for (const f of await getFilms()) urls.push(`/film/${f.slug}`);
  return urls.map((u) => ({ url: `${BASE}${u}` }));
}
