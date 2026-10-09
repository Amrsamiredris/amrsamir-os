"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FORMAT_LABEL, type PoolEvent } from "@/lib/pool";

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * A shuffled pool of delivered events, shown as a Finder list.
 * Order is randomised on every visit (and on "Shuffle"), so no single client is always on top.
 */
export function EventPool({
  events,
  limit,
  showLocation = false,
  shuffleLabel = "Shuffle",
}: {
  events: PoolEvent[];
  limit?: number;
  showLocation?: boolean;
  shuffleLabel?: string;
}) {
  const [order, setOrder] = useState(events);
  const reshuffle = useCallback(() => setOrder(shuffle(events)), [events]);
  // Shuffle after hydration so server and client HTML match.
  useEffect(() => {
    const id = requestAnimationFrame(reshuffle);
    return () => cancelAnimationFrame(id);
  }, [reshuffle]);

  const rows = typeof limit === "number" ? order.slice(0, limit) : order;

  return (
    <div>
      <table className="finder-list">
        <thead>
          <tr>
            <th scope="col">Event</th>
            <th scope="col">Client</th>
            {showLocation ? <th scope="col">City</th> : null}
            <th scope="col" className="text-right">
              Format
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.slug}>
              <td>{e.project ? <Link href={`/events/work/${e.project}`}>{e.name}</Link> : e.name}</td>
              <td>{e.client}</td>
              {showLocation ? <td className="whitespace-nowrap">{e.location}</td> : null}
              <td className="text-right whitespace-nowrap">{FORMAT_LABEL[e.format] ?? e.format}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-[12px]">
        <span className="subtle">
          {typeof limit === "number" && events.length > limit ? `${rows.length} of ${events.length} events` : `${events.length} events`}, shuffled
        </span>
        <button type="button" onClick={reshuffle} className="btn !h-7 !px-3 !text-[12px]">
          {shuffleLabel}
        </button>
      </div>
    </div>
  );
}
