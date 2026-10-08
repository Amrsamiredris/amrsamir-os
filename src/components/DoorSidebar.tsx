"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DoorSlug } from "@/lib/doors";

export function DoorSidebar({ door, label }: { door: DoorSlug; label: string }) {
  const pathname = usePathname();
  const items = [
    { href: `/${door}`, label: "Overview", exact: true },
    { href: `/${door}/work`, label: "Work" },
    { href: `/${door}/cv`, label: "CV" },
    { href: `/contact?from=${door}`, label: "Contact", external: true },
  ];
  return (
    <nav className="door-sidebar" aria-label={`${label} sections`}>
      <p className="sidebar-heading">{label}</p>
      {items.map((i) => {
        const active = i.external ? false : i.exact ? pathname === i.href : pathname?.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
