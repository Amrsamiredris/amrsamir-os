import "server-only";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import type { DoorSlug } from "./doors";

export const reader = createReader(process.cwd(), keystaticConfig);

export async function getSite() {
  const site = await reader.singletons.site.read();
  if (!site) throw new Error("content/site.yaml is missing");
  return site;
}

export async function getDoor(slug: DoorSlug) {
  const key = { events: "doorEvents", marketing: "doorMarketing", tech: "doorTech" } as const;
  const door = await reader.singletons[key[slug]].read();
  if (!door) throw new Error(`content/doors/${slug}.yaml is missing`);
  return door;
}

export async function getProjects(track?: DoorSlug) {
  const all = await reader.collections.projects.all();
  return all
    .filter((p) => !track || p.entry.tracks.includes(track))
    .sort((a, b) => (b.entry.year ?? "").localeCompare(a.entry.year ?? ""));
}

export async function getProject(slug: string) {
  return reader.collections.projects.read(slug, { resolveLinkedFiles: true });
}

export async function getExperience(track?: DoorSlug) {
  const all = await reader.collections.experience.all();
  const key = (s: string) => (s === "Present" ? "9999" : s);
  return all
    .filter((e) => !track || e.entry.tracks.includes(track))
    .sort((a, b) => key(b.entry.end).localeCompare(key(a.entry.end)) || key(b.entry.start).localeCompare(key(a.entry.start)));
}

export async function getCvExtras() {
  return reader.singletons.cvExtras.read();
}

export async function getLab() {
  return reader.collections.lab.all();
}

export async function getLabItem(slug: string) {
  return reader.collections.lab.read(slug, { resolveLinkedFiles: true });
}

export async function getFilms() {
  return reader.collections.films.all();
}

export async function getFilm(slug: string) {
  return reader.collections.films.read(slug, { resolveLinkedFiles: true });
}

export async function getEvents() {
  const all = await reader.collections.events.all();
  return all.map((e) => ({ slug: e.slug, ...e.entry }));
}

export async function getBrands() {
  const all = await reader.collections.brands.all();
  return all
    .map((b) => ({ slug: b.slug, name: b.entry.name, sector: b.entry.sector, logo: b.entry.logo, wordmark: b.entry.logoIsWordmark, order: b.entry.order ?? 50 }))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}
