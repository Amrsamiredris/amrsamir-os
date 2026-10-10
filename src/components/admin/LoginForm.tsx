"use client";

import { useState, type FormEvent } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { post } from "./post";

export function LoginForm({ next, hasPasskeys }: { next: string; hasPasskeys: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(!hasPasskeys);

  const go = () => window.location.assign(next);

  async function fingerprint() {
    setError("");
    setBusy(true);
    const o = await post("/api/admin/passkey/login-options");
    if (!o.ok) {
      setBusy(false);
      return setError(o.error ?? "");
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await startAuthentication({ optionsJSON: o.options as any });
      const v = await post("/api/admin/passkey/login-verify", { response });
      if (v.ok) return go();
      setError(v.error ?? "");
    } catch {
      setError("Fingerprint sign-in was cancelled.");
    }
    setBusy(false);
  }

  async function password(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const r = await post("/api/admin/login", { password: new FormData(e.currentTarget).get("password") });
    if (r.ok) return go();
    setError(r.error ?? "");
    setBusy(false);
  }

  return (
    <div className="mt-6">
      {hasPasskeys ? (
        <button type="button" className="btn btn-primary w-full justify-center !h-11 !text-[15px]" onClick={fingerprint} disabled={busy}>
          Sign in with Touch ID or Face ID
        </button>
      ) : null}

      {showPassword ? (
        <form onSubmit={password} className={hasPasskeys ? "mt-6 border-t border-[var(--hairline)] pt-6" : ""}>
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required autoFocus={!hasPasskeys} />
          </label>
          <button type="submit" className={`btn mt-4 w-full justify-center ${hasPasskeys ? "" : "btn-primary"}`} disabled={busy}>
            Sign in with password
          </button>
        </form>
      ) : (
        <button type="button" className="subtle mt-4 text-[13px] underline underline-offset-4" onClick={() => setShowPassword(true)}>
          Use password instead
        </button>
      )}

      {error ? (
        <p role="alert" className="mt-4 text-[14px] font-medium" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
