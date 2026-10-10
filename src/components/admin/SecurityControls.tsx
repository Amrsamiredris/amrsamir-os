"use client";

import { useState, type FormEvent } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { post } from "./post";

type Key = { id: string; name: string; createdAt: number; lastUsedAt: number | null };
const date = (t: number | null) => (t ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(t) : "Never");

function Msg({ text, error }: { text: string; error?: boolean }) {
  if (!text) return null;
  return (
    <p role={error ? "alert" : "status"} className="mt-3 text-[14px] font-medium" style={error ? { color: "var(--danger)" } : undefined}>
      {text}
    </p>
  );
}

export function PasskeyManager({ keys }: { keys: Key[] }) {
  const [msg, setMsg] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");

  async function add() {
    setBusy(true);
    setMsg({ text: "", error: false });
    const o = await post("/api/admin/passkey/register-options");
    if (!o.ok) {
      setBusy(false);
      return setMsg({ text: o.error ?? "", error: true });
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await startRegistration({ optionsJSON: o.options as any });
      const v = await post("/api/admin/passkey/register-verify", { response, name: name || guessName() });
      if (v.ok) return window.location.reload();
      setMsg({ text: v.error ?? "", error: true });
    } catch {
      setMsg({ text: "Cancelled. Nothing was saved.", error: true });
    }
    setBusy(false);
  }

  async function remove(id: string, label: string) {
    if (!window.confirm(`Remove "${label}"? You won't be able to sign in with it any more.`)) return;
    const r = await post("/api/admin/passkey/delete", { id });
    if (r.ok) window.location.reload();
    else setMsg({ text: r.error ?? "", error: true });
  }

  return (
    <div className="mt-4">
      {keys.length ? (
        <table className="finder-list">
          <thead>
            <tr>
              <th scope="col">Device</th>
              <th scope="col">Added</th>
              <th scope="col">Last used</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id}>
                <td>{k.name}</td>
                <td>{date(k.createdAt)}</td>
                <td>{date(k.lastUsedAt)}</td>
                <td className="text-right">
                  <button type="button" className="text-[13px] underline underline-offset-4" style={{ color: "var(--danger)" }} onClick={() => remove(k.id, k.name)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="subtle text-[14px]">No devices yet.</p>
      )}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="field w-[240px]">
          <span>Name this device</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={guessName()} maxLength={40} />
        </label>
        <button type="button" className="btn btn-primary" onClick={add} disabled={busy}>
          Add this device
        </button>
      </div>
      <Msg {...msg} />
    </div>
  );
}

function guessName() {
  if (typeof navigator === "undefined") return "My device";
  const ua = navigator.userAgent;
  return /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Mac/.test(ua) ? "MacBook" : /Android/.test(ua) ? "Android phone" : "My device";
}

export function PasswordChange() {
  const [msg, setMsg] = useState({ text: "", error: false });
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get("next") !== f.get("confirm")) return setMsg({ text: "The new passwords don't match.", error: true });
    const r = await post("/api/admin/password", { current: f.get("current"), next: f.get("next") });
    if (r.ok) {
      form.reset();
      setMsg({ text: "Password changed.", error: false });
    } else setMsg({ text: r.error ?? "", error: true });
  }
  return (
    <form onSubmit={submit} className="mt-4 grid max-w-[720px] gap-4 sm:grid-cols-3">
      <label className="field">
        <span>Current</span>
        <input name="current" type="password" required autoComplete="current-password" />
      </label>
      <label className="field">
        <span>New (12+ characters)</span>
        <input name="next" type="password" minLength={12} required autoComplete="new-password" />
      </label>
      <label className="field">
        <span>Repeat new</span>
        <input name="confirm" type="password" minLength={12} required autoComplete="new-password" />
      </label>
      <div className="sm:col-span-3">
        <button type="submit" className="btn">
          Change password
        </button>
        <Msg {...msg} />
      </div>
    </form>
  );
}

export function RevokeAll() {
  return (
    <button
      type="button"
      className="btn mt-4"
      onClick={async () => {
        if (!window.confirm("Sign out of the admin on every device, including this one?")) return;
        await post("/api/admin/revoke-all");
        window.location.assign("/admin/login");
      }}
    >
      Sign out everywhere
    </button>
  );
}
