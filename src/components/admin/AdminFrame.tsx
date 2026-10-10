import Link from "next/link";
import type { ReactNode } from "react";
import { Window } from "@/components/Window";
import { SignOutButton } from "./SignOutButton";

const NAV = [
  { href: "/admin", label: "Overview", key: "overview" },
  { href: "/admin/messages", label: "Messages", key: "messages" },
  { href: "/keystatic", label: "Edit website", key: "edit" },
  { href: "/admin/security", label: "Security", key: "security" },
] as const;

export function AdminFrame({ active, children }: { active: (typeof NAV)[number]["key"]; children: ReactNode }) {
  return (
    <div className="door-stage">
      <Window title="Admin · amrsamir.me" className="door-win">
        <div className="door-grid">
          <nav className="door-sidebar" aria-label="Admin">
            <p className="sidebar-heading">Admin</p>
            {NAV.map((n) =>
              n.key === "edit" ? (
                <a key={n.key} href={n.href}>
                  {n.label}
                </a>
              ) : (
                <Link key={n.key} href={n.href} aria-current={active === n.key ? "page" : undefined}>
                  {n.label}
                </Link>
              ),
            )}
            <p className="sidebar-heading">Site</p>
            <Link href="/">View site</Link>
            <SignOutButton />
          </nav>
          <div className="door-scroll">
            <div className="door-content">{children}</div>
          </div>
        </div>
      </Window>
    </div>
  );
}
