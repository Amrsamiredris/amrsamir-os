"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "./PostHogInit";

const TOPICS = ["Event project", "Marketing", "Tech & AI", "Job or role", "Something else"];

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string; field?: string };

export function ContactForm({ siteKey, email }: { siteKey?: string; email: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [token, setToken] = useState("");
  const startedAt = useRef(0);
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!siteKey) return;
    const render = () => {
      if (!widget.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(widget.current, {
        sitekey: siteKey,
        theme: "auto",
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    if (window.turnstile) return render();
    window.onTurnstileLoad = render;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit";
    s.async = true;
    document.head.appendChild(s);
  }, [siteKey]);

  if (!siteKey) {
    return (
      <p className="muted text-[14px]">
        The form is being set up. Email <a className="underline underline-offset-4" href={`mailto:${email}`}>{email}</a> in the meantime.
      </p>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(f), token, startedAt: startedAt.current }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) {
      setState({ kind: "sent" });
      track("contact_form_sent", { topic: f.get("topic") });
      return;
    }
    setState({ kind: "error", message: body.error ?? `Your message didn't send. Email ${email} instead.`, field: body.field });
    window.turnstile?.reset(widgetId.current);
    setToken("");
  }

  if (state.kind === "sent") {
    return (
      <div role="status" className="rounded-[var(--radius-inner)] p-5" style={{ background: "var(--glass-strong)", boxShadow: "0 0 0 0.5px var(--hairline-strong)" }}>
        <p className="h3">Message sent.</p>
        <p className="muted mt-1 text-[14px]">I reply within two working days, usually sooner.</p>
      </div>
    );
  }

  const invalid = (name: string) => (state.kind === "error" && state.field === name ? true : undefined);

  return (
    <form onSubmit={onSubmit} className="contact-form" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field">
          <span>Name</span>
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" aria-invalid={invalid("name")} />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" aria-invalid={invalid("email")} />
        </label>
        <label className="field">
          <span>Company (optional)</span>
          <input name="company" maxLength={120} autoComplete="organization" />
        </label>
        <label className="field">
          <span>About</span>
          <select name="topic" defaultValue={TOPICS[0]}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field mt-4">
        <span>Message</span>
        <textarea name="message" required minLength={10} maxLength={4000} rows={6} aria-invalid={invalid("message")} />
      </label>
      {/* Honeypot: hidden from people, filled by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div ref={widget} className="mt-4 min-h-[65px]" />
      {state.kind === "error" ? (
        <p role="alert" className="mt-3 text-[14px] font-medium" style={{ color: "var(--danger)" }}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary mt-4" disabled={state.kind === "sending" || !token} aria-disabled={state.kind === "sending" || !token}>
        {state.kind === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
