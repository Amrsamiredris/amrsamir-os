"use client";

import { useState } from "react";

type Day = { date: string; visitors: number; pageviews: number };

const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** Visitors per day. One series, one hue; hover a bar for the exact numbers. */
export function DailyBars({ data }: { data: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.visitors));
  const W = 720;
  const H = 160;
  const gap = 2;
  const bw = Math.max(2, (W - gap * (data.length - 1)) / data.length);
  const ticks = [Math.ceil(max / 2), max];
  const h = hover !== null ? data[hover] : null;

  return (
    <figure className="relative mt-4">
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="block w-full" role="img" aria-label={`Visitors per day, last ${data.length} days`} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => {
          const y = H - (t / max) * H;
          return (
            <g key={t}>
              <line x1={0} x2={W} y1={y} y2={y} stroke="var(--hairline)" strokeWidth={1} />
              <text x={W} y={y + 12} textAnchor="end" fontSize={11} fill="var(--label-3)">
                {t}
              </text>
            </g>
          );
        })}
        <line x1={0} x2={W} y1={H} y2={H} stroke="var(--hairline-strong)" strokeWidth={1} />
        {data.map((d, i) => {
          const bh = d.visitors ? Math.max(3, (d.visitors / max) * H) : 0;
          const x = i * (bw + gap);
          const r = Math.min(4, bw / 2, bh);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)}>
              <rect x={x} y={0} width={bw + gap} height={H} fill="transparent" />
              {bh ? (
                <path
                  d={`M${x},${H} V${H - bh + r} Q${x},${H - bh} ${x + r},${H - bh} H${x + bw - r} Q${x + bw},${H - bh} ${x + bw},${H - bh + r} V${H} Z`}
                  fill="var(--chart-ink)"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              ) : null}
            </g>
          );
        })}
        <text x={0} y={H + 16} fontSize={11} fill="var(--label-3)">
          {data[0] ? fmt(data[0].date) : ""}
        </text>
        <text x={W} y={H + 16} fontSize={11} fill="var(--label-3)" textAnchor="end">
          {data.at(-1) ? fmt(data.at(-1)!.date) : ""}
        </text>
      </svg>
      {h ? (
        <div className="chart-tip" style={{ left: `${((hover! + 0.5) / data.length) * 100}%` }}>
          <strong>{fmt(h.date)}</strong>
          <br />
          {h.visitors} visitors, {h.pageviews} page views
        </div>
      ) : null}
      <table className="sr-only">
        <caption>Visitors per day</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <th scope="row">{d.date}</th>
              <td>{d.visitors}</td>
              <td>{d.pageviews}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
