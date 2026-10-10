"use client";

import { useState, type FormEvent } from "react";
import { post } from "./post";

export function SetupForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password !== String(f.get("confirm"))) return setError("The passwords don't match.");
    setBusy(true);
    setError("");
    const r = await post("/api/admin/setup", { token: f.get("token"), password });
    if (r.ok) return window.location.assign("/admin/security?welcome=1");
    setError(r.error ?? "");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <label className="field">
        <span>Setup code</span>
        <input name="token" required autoComplete="off" spellCheck={false} />
      </label>
      <label className="field">
        <span>New password (12+ characters)</span>
        <input name="password" type="password" minLength={12} required autoComplete="new-password" />
      </label>
      <label className="field">
        <span>Repeat password</span>
        <input name="confirm" type="password" minLength={12} required autoComplete="new-password" />
      </label>
      {error ? (
        <p role="alert" className="text-[14px] font-medium" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary justify-center" disabled={busy}>
        Save password
      </button>
    </form>
  );
}
