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
