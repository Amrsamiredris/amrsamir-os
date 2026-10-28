"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { post } from "./post";

export function ResetForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  // Keep the one-time token out of history and referrers once it's in memory.
  useEffect(() => {
    if (token) window.history.replaceState(null, "", "/admin/reset?link=1");
  }, [token]);

  async function request() {
    setBusy(true);
    setError("");
    const r = await post("/api/admin/reset/request");
    setBusy(false);
    if (r.ok) setSent(true);
    else setError(r.error ?? "");
  }

  async function confirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password !== String(f.get("confirm"))) return setError("The passwords don't match.");
    setBusy(true);
    setError("");
    const r = await post("/api/admin/reset/confirm", { token, password });
    if (r.ok) return window.location.assign("/admin/security?welcome=1");
    setError(r.error ?? "");
    setBusy(false);
  }

  const err = error ? (
    <p role="alert" className="text-[14px] font-medium" style={{ color: "var(--danger)" }}>
      {error}
    </p>
  ) : null;

  if (token) {
    return (
      <form onSubmit={confirm} className="mt-6 grid gap-4">
        <label className="field">
          <span>New password (12+ characters)</span>
          <input name="password" type="password" minLength={12} required autoComplete="new-password" autoFocus />
        </label>
        <label className="field">
          <span>Repeat password</span>
          <input name="confirm" type="password" minLength={12} required autoComplete="new-password" />
        </label>
        {err}
        <button type="submit" className="btn btn-primary justify-center" disabled={busy}>
          Save new password
        </button>
        <p className="muted text-[13px]">Saving signs out every other device.</p>
      </form>
    );
  }

  if (sent) {
    return (
      <p role="status" className="mt-6 text-[15px]">
        Reset link sent to the admin inbox. It works once, for 20 minutes. Open it on this device or any other.
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      <p className="muted text-[14px]">We&apos;ll email a one-time reset link to the admin inbox on file. No address to type: the link only ever goes to you.</p>
      {err}
      <button type="button" className="btn btn-primary justify-center !h-11" onClick={request} disabled={busy}>
        {busy ? "Sending…" : "Email me a reset link"}
      </button>
      <Link href="/admin/login" className="subtle text-center text-[13px] underline underline-offset-4">
        Back to sign in
      </Link>
    </div>
  );
}
