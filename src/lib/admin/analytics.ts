import "server-only";

/**
 * Reads analytics from PostHog's query API (server-side, personal API key with read-only scope).
 * Env: POSTHOG_PERSONAL_API_KEY (phx_…), POSTHOG_PROJECT_ID, POSTHOG_REGION (eu|us).
 */
const KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PROJECT = process.env.POSTHOG_PROJECT_ID;
const HOST = process.env.POSTHOG_REGION === "us" ? "https://us.posthog.com" : "https://eu.posthog.com";

/** Local preview only: ADMIN_ANALYTICS_MOCK=1 fills the dashboard with sample numbers. Never used in production. */
const MOCK = process.env.NODE_ENV !== "production" && process.env.ADMIN_ANALYTICS_MOCK === "1";

export const analyticsConfigured = Boolean(KEY && PROJECT) || MOCK;
export const posthogAppUrl = PROJECT ? `${HOST}/project/${PROJECT}` : HOST;

type Row = (string | number | null)[];

async function hogql(query: string): Promise<Row[]> {
  const res = await fetch(`${HOST}/api/projects/${encodeURIComponent(PROJECT!)}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PostHog ${res.status}`);
  const data = (await res.json()) as { results?: Row[] };
  return data.results ?? [];
}

export type Dashboard = {
  days: number;
  visitors: number;
  pageviews: number;
  sessions: number;
  goals: { cv: number; contact: number; companies: number; vcard: number };
  daily: { date: string; visitors: number; pageviews: number }[];
  pages: { label: string; views: number; visitors: number }[];
  sources: { label: string; visitors: number }[];
  countries: { label: string; visitors: number }[];
  devices: { label: string; visitors: number }[];
  recent: { at: string; path: string; country: string; source: string }[];
};

export async function getDashboard(days: number): Promise<Dashboard> {
  const d = Math.max(1, Math.min(365, Math.floor(days)));
  if (MOCK) return mock(d);
  const since = `timestamp > now() - INTERVAL ${d} DAY`;
  const pv = `event = '$pageview' AND ${since}`;
  const top = (expr: string, empty: string) =>
    hogql(`SELECT coalesce(nullIf(toString(${expr}), ''), '${empty}') AS k, uniq(distinct_id) AS v FROM events WHERE ${pv} GROUP BY k ORDER BY v DESC LIMIT 8`);

  const [kpi, goals, daily, pages, sources, countries, devices, recent] = await Promise.all([
    hogql(`SELECT uniq(distinct_id), count(), uniq(properties.$session_id) FROM events WHERE ${pv}`),
    hogql(
      `SELECT countIf(event = 'cv_download'), countIf(event = 'contact_form_sent'), countIf(event = 'company_click'), countIf(event = 'vcard_download') FROM events WHERE ${since}`,
    ),
    hogql(`SELECT toString(toDate(timestamp)) AS day, uniq(distinct_id), count() FROM events WHERE ${pv} GROUP BY day ORDER BY day`),
    hogql(`SELECT properties.$pathname AS p, count() AS c, uniq(distinct_id) FROM events WHERE ${pv} GROUP BY p ORDER BY c DESC LIMIT 10`),
    top("properties.$referring_domain", "Direct"),
    top("properties.$geoip_country_name", "Unknown"),
    top("properties.$device_type", "Unknown"),
    hogql(
      `SELECT toString(timestamp), properties.$pathname, properties.$geoip_country_name, properties.$referring_domain FROM events WHERE ${pv} ORDER BY timestamp DESC LIMIT 15`,
    ),
  ]);

  const n = (v: unknown) => Number(v ?? 0);
  const s = (v: unknown, f = "") => (v === null || v === undefined || v === "" ? f : String(v));
  const pairs = (rows: Row[]) => rows.map((r) => ({ label: s(r[0], "Unknown").replace("$direct", "Direct"), visitors: n(r[1]) }));

  // Fill missing days so the chart has one bar per day.
  const byDay = new Map(daily.map((r) => [s(r[0]), { visitors: n(r[1]), pageviews: n(r[2]) }]));
  const series: Dashboard["daily"] = [];
  for (let i = d - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
    series.push({ date, ...(byDay.get(date) ?? { visitors: 0, pageviews: 0 }) });
  }

  return {
    days: d,
    visitors: n(kpi[0]?.[0]),
    pageviews: n(kpi[0]?.[1]),
    sessions: n(kpi[0]?.[2]),
    goals: { cv: n(goals[0]?.[0]), contact: n(goals[0]?.[1]), companies: n(goals[0]?.[2]), vcard: n(goals[0]?.[3]) },
    daily: series,
    pages: pages.map((r) => ({ label: s(r[0], "/"), views: n(r[1]), visitors: n(r[2]) })),
    sources: pairs(sources),
    countries: pairs(countries),
    devices: pairs(devices),
    recent: recent.map((r) => ({ at: s(r[0]), path: s(r[1], "/"), country: s(r[2], "Unknown"), source: s(r[3], "Direct").replace("$direct", "Direct") })),
  };
}

function mock(d: number): Dashboard {
  const daily = Array.from({ length: d }, (_, i) => {
    const v = Math.round(18 + 14 * Math.sin(i / 3) + (i % 7 === 5 ? 25 : 0) + i * 0.4);
    return { date: new Date(Date.now() - (d - 1 - i) * 86400_000).toISOString().slice(0, 10), visitors: v, pageviews: v * 3 };
  });
  const visitors = daily.reduce((a, b) => a + b.visitors, 0);
  return {
    days: d,
    visitors,
    pageviews: visitors * 3,
    sessions: Math.round(visitors * 1.3),
    goals: { cv: 41, contact: 6, companies: 23, vcard: 9 },
    daily,
    pages: ["/", "/events", "/cv", "/lab", "/marketing", "/lab/eventechs", "/contact"].map((p, i) => ({ label: p, views: 400 - i * 50, visitors: 200 - i * 25 })),
    sources: [["linkedin.com", 210], ["Direct", 160], ["google.com", 70], ["eventechs.vercel.app", 18]].map(([l, v]) => ({ label: String(l), visitors: Number(v) })),
    countries: [["United Arab Emirates", 260], ["Egypt", 90], ["Saudi Arabia", 40], ["United Kingdom", 12]].map(([l, v]) => ({ label: String(l), visitors: Number(v) })),
    devices: [["Mobile", 280], ["Desktop", 160]].map(([l, v]) => ({ label: String(l), visitors: Number(v) })),
    recent: [["/cv", "United Arab Emirates", "linkedin.com"], ["/events", "Egypt", "Direct"], ["/lab/eventechs", "Saudi Arabia", "google.com"]].map(([path, country, source], i) => ({
      at: new Date(Date.now() - i * 900_000).toISOString(),
      path,
      country,
      source,
    })),
  };
}
