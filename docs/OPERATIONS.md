# Operations handoff

Status and next steps for whoever (human or agent) picks this up next.

## Live setup (as of 2026-10-08)

| Item | Value |
|---|---|
| Domain | amrsamir.me → Vercel project `amrsamir-os` (moved from `amrsamir-me-final`) |
| Repo | github.com/Amrsamiredris/amrsamir-os (public; may go private later) |
| Deploys | Every push to `main` deploys to production automatically |
| DNS | Cloudflare. Vercel shows "DNS Change Recommended" for the apex (works, but update records to Vercel's recommended values) |

## Platform access plan

Agent terminals were blocked from `api.vercel.com` and `api.cloudflare.com` by an org network policy (lifted 2026-10-08, takes effect in new sessions).
In a new session, first run:

```bash
for u in https://api.vercel.com/v2/user https://api.cloudflare.com/client/v4/; do echo "$u $(curl -s -o /dev/null -w '%{http_code}' --max-time 10 $u)"; done
```

`000` = still blocked. Any HTTP code (e.g. 403) = reachable. Then:

| Platform | How | Owner action |
|---|---|---|
| GitHub | Claude GitHub App (all repos) — already installed | none |
| Vercel | `npx vercel login` (device flow) | approve in browser |
| Cloudflare | `npx wrangler login` (OAuth) | approve in browser |
| Microsoft Clarity | Dashboard only (no CLI). Site reads `NEXT_PUBLIC_CLARITY_ID` | give project ID |
| Google Analytics 4 | Dashboard only. Site reads `NEXT_PUBLIC_GA_ID` | give measurement ID (G-…) |

Never store tokens in the repo. CLI logins may be per-session; re-run login if a command says unauthenticated.

## Open items

1. Delete old Vercel project `amrsamir-me-final` (still serves an insecure `/dashboard` at its .vercel.app URL; holds unused subdomains). Needs owner OK.
2. Replace placeholders in `content/` (`[Your role]`, `YYYY`, "Placeholder") and upload CV PDFs per door.
3. Keystatic GitHub mode for editing on the live site (see README).
4. Phase 3: tracked personalised links `/for/<code>` + secured dashboard.
5. Analytics: Clarity + GA4 with a short privacy note.

## Versions and rollback

| Version | Where | How to go back to it |
|---|---|---|
| v1 (original design, 2026-10-08) | branch `release/v1` | Vercel → Deployments → pick the last `main` deployment before v2 → "Instant Rollback" (seconds). Permanent: merge `release/v1` back into `main`. |
| v2 (finishing pass) | branch `v2` → preview URL | Merged to `main` only after approval |

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Purpose | Where it comes from |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | Analytics (primary) | PostHog → Project settings → Project API key (`phc_…`, public by design) |
| `POSTHOG_REGION` | `eu` (default) or `us`, must match the PostHog project | |
| `NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_GA_ID` | Optional extra analytics | Clarity / GA4 dashboards |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Contact form anti-bot | Cloudflare → Turnstile → Add site (amrsamir.me) |
| `RESEND_API_KEY` | Sends contact form mail | Resend → API keys (sending access only) |
| `CONTACT_TO` | Inbox for form messages (comma-separated) | e.g. `contact@amrsamir.me` |
| `CONTACT_FROM` | Optional sender, default `amrsamir.me <website@amrsamir.me>` | Domain must be verified in Resend |

Secrets (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`) are set as Sensitive in Vercel and never committed.

## Security notes

- CSP, HSTS, frame-deny, COOP and a tight Permissions-Policy are set in `next.config.ts`. Adding a new third-party script or embed means adding its origin to the CSP there.
- `npm audit` reports a high-severity `braces` advisory via `@keystatic/next` → `chokidar`. It affects the local dev file-watcher only, not the deployed site. Revisit when Keystatic updates.
- Contact form: same-origin check, size cap, honeypot, minimum fill time, per-IP rate limit (best effort), Turnstile, strict validation, HTML-escaped mail.

## Admin area (`/admin`)

One owner, signed in with a passkey (Touch ID / Face ID) or a password. Same login protects the content editor at `/keystatic`.

| Piece | How it works |
|---|---|
| Storage | Upstash Redis (Vercel → Storage → Upstash for Redis). Holds the password hash, passkey public keys, sessions, rate-limit counters, audit log, contact messages |
| Sign-in | Passkey (WebAuthn, user verification required) or password (scrypt). 5 password tries / 15 min per IP, 20 / hour site-wide |
| Session | HMAC-signed cookie `__Host-amr_admin`, HttpOnly, Secure, SameSite=Lax, 12 h; server checks it against Redis on every request; "Sign out everywhere" invalidates all |
| Gates | `src/proxy.ts` blocks `/admin/*` and `/keystatic/*` without a valid cookie; every admin page and API route re-checks the session |
| Alerts | Email on every sign-in, password change and new passkey (via Resend, to `ADMIN_ALERT_TO` or `CONTACT_TO`) |
| Analytics | `/admin` reads PostHog's query API server-side |

Env vars (Vercel):

| Variable | Notes |
|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Added automatically when the Upstash integration is connected |
| `ADMIN_SESSION_SECRET` | 48+ random chars (`openssl rand -base64 48`). Rotating it signs everyone out |
| `ADMIN_SETUP_TOKEN` | One-time code for `/admin/setup`. Delete it from Vercel after setup |
| `ADMIN_RP_ID` | `amrsamir.me` (passkeys are bound to this domain) |
| `ADMIN_ALERT_TO` | Optional, defaults to `CONTACT_TO` |
| `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID` | PostHog → Settings → Personal API keys (scope: Query read only) / Project ID |
| `NEXT_PUBLIC_KEYSTATIC_STORAGE=github` + Keystatic GitHub app vars | Turns on the editor in production |

Lost access: delete the `admin:password` key in Upstash and set a new `ADMIN_SETUP_TOKEN`, then run `/admin/setup` again. Passkeys stay registered.
