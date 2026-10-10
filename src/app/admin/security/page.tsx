import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { PasskeyManager, PasswordChange, RevokeAll } from "@/components/admin/SecurityControls";
import { listPasskeys } from "@/lib/admin/passkeys";
import { requireAdmin } from "@/lib/admin/session";
import { store } from "@/lib/admin/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Security" };

type AuditRow = { at: number; event: string; ip?: string; ua?: string };

const when = (t: number) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" }).format(t);

function device(ua?: string) {
  if (!ua) return "";
  const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Mac OS X/.test(ua) ? "Mac" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : "Other";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "";
  return [os, br].filter(Boolean).join(", ");
}

export default async function Security({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const session = await requireAdmin();
  const { welcome } = await searchParams;
  const [keys, log] = await Promise.all([listPasskeys(), store().lrange<AuditRow>("admin:audit", 25)]);

  return (
    <AdminFrame active="security">
      <h1 className="display text-[clamp(40px,5vw,64px)]">Security</h1>
      {welcome ? (
        <p className="mt-4 max-w-[60ch] rounded-[var(--radius-inner)] p-4 text-[14px]" style={{ background: "var(--glass-strong)", boxShadow: "0 0 0 0.5px var(--hairline-strong)" }}>
          Password saved. Now add your fingerprint below, on each device you use (Mac, iPhone). Passkeys sync through iCloud Keychain.
        </p>
      ) : null}

      <section className="mt-10" aria-labelledby="pk">
        <h2 id="pk" className="h2">
          Fingerprint and Face ID
        </h2>
        <p className="muted mt-2 max-w-[60ch] text-[14px]">Each passkey lives on your device and never leaves it. The site only stores a public key.</p>
        <PasskeyManager keys={keys.map((k) => ({ id: k.id, name: k.name, createdAt: k.createdAt, lastUsedAt: k.lastUsedAt ?? null }))} />
      </section>

      <section className="mt-12" aria-labelledby="pw">
        <h2 id="pw" className="h2">
          Password
        </h2>
        <PasswordChange />
      </section>

      <section className="mt-12" aria-labelledby="ses">
        <h2 id="ses" className="h2">
          Sessions
        </h2>
        <p className="muted mt-2 text-[14px]">
          This session: signed in with {session.method} on {device(session.ua) || "this device"}, {when(session.createdAt)}. Sessions end after 12 hours.
        </p>
        <RevokeAll />
      </section>

      <section className="mt-12" aria-labelledby="log">
        <h2 id="log" className="h2">
          Recent activity
        </h2>
        <div className="mt-4 overflow-x-auto">
        <table className="finder-list min-w-[560px]">
          <thead>
            <tr>
              <th scope="col">When (UAE)</th>
              <th scope="col">What</th>
              <th scope="col">Device</th>
              <th scope="col">IP</th>
            </tr>
          </thead>
          <tbody>
            {log.map((r, i) => (
              <tr key={i}>
                <td className="whitespace-nowrap">{when(r.at)}</td>
                <td>{r.event}</td>
                <td>{device(r.ua)}</td>
                <td className="tabular-nums">{r.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </AdminFrame>
  );
}
