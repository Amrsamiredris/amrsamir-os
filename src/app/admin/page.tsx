import type { Metadata } from "next";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { DailyBars } from "@/components/admin/DailyBars";
import { analyticsConfigured, getDashboard, posthogAppUrl, type Dashboard } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/admin/session";
import { store } from "@/lib/admin/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Overview" };

const RANGES = [7, 30, 90];
const num = (n: number) => n.toLocaleString("en-GB");
const countSince = (items: { at: number }[], days: number) => items.filter((m) => m.at > Date.now() - days * 86400_000).length;

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="admin-tile">
      <p className="subtle text-[12px]">{label}</p>
      <p className="mt-1 text-[30px] leading-none font-bold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      {note ? <p className="subtle mt-1.5 text-[12px]">{note}</p> : null}
    </div>
  );
}

function TopList({ title, rows, unit }: { title: string; rows: { label: string; value: number }[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="admin-card" aria-label={title}>
      <h2 className="h3">{title}</h2>
      {rows.length ? (
        <ul className="mt-3 grid gap-1.5">
          {rows.map((r) => (
            <li key={r.label} className="relative flex items-center justify-between gap-3 rounded-[6px] px-2 py-1 text-[13px]">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 rounded-[6px]" style={{ width: `${(r.value / max) * 100}%`, background: "var(--chart-wash)" }} />
              <span className="relative min-w-0 truncate">{r.label}</span>
              <span className="relative tabular-nums">
                {num(r.value)}
                <span className="sr-only"> {unit}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="subtle mt-3 text-[13px]">No data yet.</p>
      )}
    </section>
  );
}

export default async function Overview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdmin();
  const { range } = await searchParams;
  const days = RANGES.includes(Number(range)) ? Number(range) : 30;
  const messages = await store().lrange<{ at: number }>("contact:messages", 500);
  const recentMessages = countSince(messages, days);

  let data: Dashboard | null = null;
  let failed = false;
  if (analyticsConfigured) {
    try {
      data = await getDashboard(days);
    } catch {
      failed = true;
    }
  }

  return (
    <AdminFrame active="overview">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[clamp(40px,5vw,64px)]">Overview</h1>
        <nav aria-label="Time range" className="flex gap-1">
          {RANGES.map((r) => (
            <Link key={r} href={`/admin?range=${r}`} className="btn !h-8" aria-current={r === days ? "page" : undefined} style={r === days ? { background: "var(--chart-ink)", color: "var(--paper)" } : undefined}>
              {r} days
            </Link>
          ))}
        </nav>
      </div>

      {!analyticsConfigured ? (
        <div className="admin-card mt-8">
          <h2 className="h3">Connect analytics</h2>
          <p className="muted mt-2 max-w-[62ch] text-[14px]">
            Visitor numbers appear here once PostHog is connected: add <code>POSTHOG_PERSONAL_API_KEY</code> and <code>POSTHOG_PROJECT_ID</code> in Vercel. Messages from the contact form already
            work: {num(recentMessages)} in the last {days} days.
          </p>
        </div>
      ) : failed || !data ? (
        <div className="admin-card mt-8">
          <h2 className="h3">Couldn&apos;t load analytics</h2>
          <p className="muted mt-2 text-[14px]">PostHog didn&apos;t answer. Check the API key in Vercel, or open PostHog directly.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile label="Visitors" value={num(data.visitors)} />
            <Tile label="Page views" value={num(data.pageviews)} />
            <Tile label="Visits" value={num(data.sessions)} />
            <Tile label="Messages" value={num(recentMessages)} note="From the contact form" />
          </div>

          <section className="admin-card mt-4" aria-labelledby="daily">
            <h2 id="daily" className="h3">
              Visitors per day
            </h2>
            <DailyBars data={data.daily} />
          </section>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile label="CV downloads" value={num(data.goals.cv)} />
            <Tile label="Forms sent" value={num(data.goals.contact)} />
            <Tile label="Company site clicks" value={num(data.goals.companies)} note="Eventechs, Games for Brands" />
            <Tile label="Contact cards saved" value={num(data.goals.vcard)} />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <TopList title="Top pages" unit="views" rows={data.pages.map((p) => ({ label: p.label, value: p.views }))} />
            <TopList title="Where visitors come from" unit="visitors" rows={data.sources.map((p) => ({ label: p.label, value: p.visitors }))} />
            <TopList title="Countries" unit="visitors" rows={data.countries.map((p) => ({ label: p.label, value: p.visitors }))} />
            <TopList title="Devices" unit="visitors" rows={data.devices.map((p) => ({ label: p.label, value: p.visitors }))} />
          </div>

          <section className="admin-card mt-4" aria-labelledby="recent">
            <h2 id="recent" className="h3">
              Latest page views
            </h2>
            <div className="mt-3 overflow-x-auto">
            <table className="finder-list min-w-[520px]">
              <thead>
                <tr>
                  <th scope="col">When (UAE)</th>
                  <th scope="col">Page</th>
                  <th scope="col">Country</th>
                  <th scope="col">From</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r, i) => (
                  <tr key={i}>
                    <td className="whitespace-nowrap">
                      {new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Dubai" }).format(new Date(r.at.replace(" ", "T") + (r.at.endsWith("Z") ? "" : "Z")))}
                    </td>
                    <td>{r.path}</td>
                    <td>{r.country}</td>
                    <td>{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
        </>
      )}

      <section className="mt-10" aria-labelledby="tools">
        <h2 id="tools" className="h2">
          Go deeper
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          <li>
            <a className="btn" href={`${posthogAppUrl}/replay/home`} target="_blank" rel="noopener">
              Session recordings
            </a>
          </li>
          <li>
            <a className="btn" href={`${posthogAppUrl}/heatmaps`} target="_blank" rel="noopener">
              Heatmaps
            </a>
          </li>
          <li>
            <a className="btn" href={`${posthogAppUrl}/web`} target="_blank" rel="noopener">
              PostHog web analytics
            </a>
          </li>
          {process.env.NEXT_PUBLIC_CLARITY_ID ? (
            <li>
              <a className="btn" href={`https://clarity.microsoft.com/projects/view/${process.env.NEXT_PUBLIC_CLARITY_ID}/dashboard`} target="_blank" rel="noopener">
                Clarity
              </a>
            </li>
          ) : null}
          {process.env.NEXT_PUBLIC_GA_ID ? (
            <li>
              <a className="btn" href="https://analytics.google.com/" target="_blank" rel="noopener">
                Google Analytics
              </a>
            </li>
          ) : null}
          <li>
            <a className="btn" href="https://vercel.com/amr-samir-s-projects/amrsamir-os" target="_blank" rel="noopener">
              Vercel deployments
            </a>
          </li>
        </ul>
      </section>
    </AdminFrame>
  );
}
