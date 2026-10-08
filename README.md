# amrsamir.me

Personal platform of Amr Samir Edris. Events, marketing and tech, presented as a Mac-style desktop:
a 1-bit dithered desert wallpaper (classic Mac) under frosted-glass windows (current macOS).

- **Desktop / home** – `/`  (phones get an iPhone-style home screen)
- **Three doors** – `/events`, `/marketing`, `/tech` – each with Overview, Work, CV
- **Projects** – `/<door>/work/<project>` (one project can sit behind several doors)
- **Lab** – `/lab` (side projects and apps; full apps live on their own subdomain, e.g. `spraywall.amrsamir.me`)
- **Film** – `/film`
- **CV chooser** – `/cv`, **Contact** – `/contact`, contact card – `/contact/vcard`

## Edit content (no code)

All text, projects, CV entries, images and PDFs live in `content/` and are edited through **Keystatic**.

**On your Mac (works today):**

```bash
npm install
npm run dev
# open http://127.0.0.1:3000/keystatic
```

Save in the editor → files in `content/` change → commit and push → Vercel redeploys.

**On the live site (after one-time setup):** set these environment variables in Vercel, then open
`https://amrsamir.me/keystatic` and sign in with GitHub. Every save becomes a commit and Vercel redeploys.

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_KEYSTATIC_STORAGE` | `github` |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_OWNER` | `Amrsamiredris` |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` | this repo's name |
| `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | created by Keystatic's GitHub-app wizard (run it once locally with the storage set to `github`) |

Without these, `/keystatic` returns 404 in production, so the editor is never exposed publicly.

## Content rules

- Only verifiable numbers in "Key facts". Leave empty rather than estimate.
- Placeholders are marked `[Your role]`, `YYYY` or "Placeholder". Search for them before launch.
- Upload one CV PDF per door (Events / Marketing / Tech) in the door's settings.

## Stack

Next.js 16 (App Router, static generation) · Tailwind CSS 4 · Motion · Keystatic · Vercel.
Fonts: Schibsted Grotesk (display), system UI font (body), Silkscreen (classic-Mac widgets only).

## Design system

Tokens live at the top of `src/app/globals.css`.

| Token | Use |
|---|---|
| `--paper` / `--wall-ink` | Wallpaper base and home dither colour |
| Door accents (`src/lib/doors.ts`) | Events `#EE6A1F`, Marketing `#D6247A`, Tech `#3550FF`, each with a text-safe `ink` variant |
| `--glass*`, `--blur` | Frosted windows, menu bar, dock |
| `.win-classic` | 1-bit classic windows (Now, Clock, alerts). Use sparingly |

Respects `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast` and dark mode.

## Agent skills used to build this

Install into your coding agent with [skills.sh](https://skills.sh):

```bash
npx skills add anthropics/skills          # frontend-design
npx skills add emilkowalski/skills        # apple-design, emil-design-eng
npx skills add vercel-labs/agent-skills   # web-design-guidelines, react-best-practices
```

Plus `ui-taste` and `ios-design` from uizze.sh.

## Roadmap

1. Tracked, personalised links – `/for/<code>` per recipient (CV + portfolio + note), server-side
   event logging with bot filtering, email alert on first real open, dashboard behind proper auth.
2. Real content, cover images and CV PDFs.
3. Subdomains for standalone apps (SprayWall, event-tech toolkit).
