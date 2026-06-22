# Project Specification — Steam-Style Portfolio

> Build brief for an AI coding agent (Claude Code). This document is the source of
> truth for **what to build and how**. Read it fully before writing any code.

---

## 0. Before you start (required)

1. **Enable the Astro Docs MCP server** so you build against current APIs, not stale
   training data. Content Collections and config have changed across Astro versions.

   ```bash
   claude mcp add --transport http astro-docs https://mcp.docs.astro.build/mcp
   ```

2. **Verify current APIs** for: Content Collections (`content.config.ts` location and
   `glob()` loader), `astro:assets` `<Image>`, and the GitHub Pages deploy workflow.
   When this spec and the live docs disagree, **the live docs win** — flag the diff.

3. **Use the tooling the docs recommend**: scaffold with `npm create astro@latest`,
   add integrations with `astro add`, install packages with `npm install` (do not
   hand-edit `package.json`).

---

## 1. Summary

A single-page, static **developer portfolio** inspired by the Steam store. It leads
with projects (no hero bio, no endless scroll). Visitors see every project at a glance,
preview videos on hover, and open a full detail **modal** on click.

- **Featured hero** at the top + a **capsule grid** of the remaining projects.
- **Category filter tabs** (All / Game dev / Backend / Tooling …).
- **Hover** → in-card video preview.
- **Click** → in-page **modal overlay** with the full video, description, and repo links.
- **Two-axis theming**: the repo owner picks a color **family** (steam | original) in
  config; the visitor toggles **dark / light** mode. Four palettes total.
- **Static output**, deployed to **GitHub Pages** via GitHub Actions.

---

## 2. Goals / non-goals

**Goals**
- Projects visible immediately on load; minimum clicks to reach any project's video.
- Adding/removing a project = drop in one Markdown file + its assets. No code edits.
- Changing the theme family = change one config value.
- Cheap/free hosting on GitHub Pages.

**Non-goals (explicitly out of scope for v1)**
- Per-project routes / shareable deep-links (may be added later — do not build now).
- CMS, backend, database, contact form, auth, i18n, blog.
- Multiple **layout** variants at runtime (only multiple color **themes**).

---

## 3. Tech stack (locked)

| Layer | Choice |
|---|---|
| Framework | **Astro** (latest, v5+), `output: 'static'` |
| Language | **TypeScript**, `strict` (Astro default tsconfig) |
| Runtime | Node.js 20+ |
| Content | **Astro Content Collections** — 1 Markdown file per project |
| Schema validation | **Zod** (bundled with Astro) |
| Owner config | `src/config/site.ts` (typed) |
| Styling | **Plain CSS + custom properties** (no Tailwind) |
| Images | `astro:assets` `<Image>` (Sharp) |
| Video | Self-hosted MP4 (H.264) + WebM (VP9) in `public/`, **no Git LFS** |
| Interactivity | Vanilla TS in `<script>` tags / minimal islands. No React/Vue. |
| Formatting | Prettier + `prettier-plugin-astro` |
| CI/CD | GitHub Actions (`withastro/action`) → GitHub Pages on push to `main` |

---

## 4. Project structure

```
.
├── .github/workflows/deploy.yml      # GitHub Pages CI
├── astro.config.mjs                  # site + base config
├── tsconfig.json
├── package.json
├── README.md
├── project-specification.md
├── public/
│   ├── .nojekyll                     # (the deploy action handles this, keep anyway)
│   ├── cv.pdf                        # owner's CV (optional)
│   └── media/
│       └── <project-id>/
│           ├── preview.mp4           # hover loop (muted)
│           ├── preview.webm
│           ├── full.mp4              # modal video (muted, looped)
│           ├── full.webm
│           ├── thumb.jpg             # grid capsule poster (source for <Image>)
│           └── poster.jpg            # modal video poster
├── src/
│   ├── config/
│   │   └── site.ts                   # OWNER-FACING config (see §5)
│   ├── content.config.ts             # Content Collection + Zod schema (see §6)
│   ├── content/
│   │   └── projects/
│   │       ├── trawlers-wake.md
│   │       ├── finance-tracker-api.md
│   │       └── …
│   ├── styles/
│   │   ├── reset.css
│   │   ├── themes.css                # all 4 palettes as CSS variables (see §7)
│   │   └── global.css
│   ├── lib/
│   │   ├── projects.ts               # load + sort + filter helpers (typed)
│   │   └── theme.ts                  # no-flash + toggle logic (runs client-side)
│   ├── components/
│   │   ├── Header.astro
│   │   ├── ThemeToggle.astro
│   │   ├── FilterTabs.astro
│   │   ├── FeaturedHero.astro
│   │   ├── ProjectCard.astro
│   │   ├── ProjectGrid.astro
│   │   ├── ProjectModal.astro
│   │   └── StatusBadge.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── pages/
│       └── index.astro               # the only page
```

---

## 5. Owner configuration — `src/config/site.ts`

The single file the owner edits to rebrand. Strongly typed.

```ts
export type ThemeFamily = 'steam' | 'original';
export type ThemeMode = 'dark' | 'light';

export interface HeaderLink {
  label: string;
  href: string;
  icon: 'github' | 'gitlab' | 'cv' | 'mail' | 'external';
}

export interface SiteConfig {
  name: string;                 // "Valentyn Matvieienko"
  role: string;                 // "Unity / C# & .NET developer"
  links: HeaderLink[];          // header buttons (GitHub, GitLab, CV…)
  themeFamily: ThemeFamily;     // owner picks the palette family
  defaultMode: ThemeMode;       // initial mode before visitor preference/localStorage
  categories: string[];         // filter tab order, e.g. ['Game dev','Backend','Tooling']
  // 'All' is implicit and always first.
  metaTitle: string;
  metaDescription: string;
}

export const site: SiteConfig = {
  name: 'Valentyn Matvieienko',
  role: 'Unity / C# & .NET developer',
  links: [
    { label: 'GitHub', href: 'https://github.com/vailshnast', icon: 'github' },
    { label: 'GitLab', href: 'https://gitlab.com/…',          icon: 'gitlab' },
    { label: 'CV',     href: '/cv.pdf',                        icon: 'cv' },
  ],
  themeFamily: 'steam',
  defaultMode: 'dark',
  categories: ['Game dev', 'Backend', 'Tooling'],
  metaTitle: 'Valentyn Matvieienko — Portfolio',
  metaDescription: 'Selected Unity/C# and .NET projects.',
};
```

> **Category source of truth:** the `category` value in each project's frontmatter must
> be one of `site.categories`. The Zod schema should validate this (see §6) so a typo
> fails the build instead of producing an empty tab.

---

## 6. Data model — Content Collections

`src/content.config.ts` — define a `projects` collection with the `glob()` loader and a
Zod schema. **Confirm the exact current API via the Astro Docs MCP** before writing.

### Frontmatter schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | Card + modal title |
| `blurb` | string | ✅ | One line under the title on the card (≤ ~60 chars) |
| `summary` | string | ➖ | Richer teaser shown on the featured hero. Falls back to `blurb`. |
| `category` | enum(site.categories) | ✅ | Drives filtering. Must match a configured category. |
| `tags` | string[] | ✅ | Tech pills (cap display at ~4 on card, all in modal) |
| `status` | string | ➖ | Badge text, e.g. "Shipped", "Live demo", "Production" |
| `statusTone` | enum('green','blue','neutral') | ➖ | Badge color intent. Default 'neutral'. |
| `order` | number | ➖ | Sort key, ascending. Lower = earlier. Default 999. |
| `thumb` | image | ✅ | Grid capsule poster (use `image()` helper for `astro:assets`) |
| `previewMp4` | string | ➖ | Path under `/media/<id>/`. Hover loop. |
| `previewWebm` | string | ➖ | WebM sibling. |
| `fullMp4` | string | ➖ | Modal video. |
| `fullWebm` | string | ➖ | WebM sibling. |
| `poster` | image | ➖ | Modal video poster. Falls back to `thumb`. |
| `links` | array | ✅ | `{ label, href, type: 'github'|'gitlab'|'steam'|'itch'|'demo'|'external' }` |

- The **long description** is the Markdown **body** of the file (rendered into the modal).
- `id` (used for the media folder and modal targeting) = the file slug.
- If a project has no video fields, the card shows only the static `thumb` (no hover
  preview), and the modal shows the poster image. The site must not break.

### Example — `src/content/projects/trawlers-wake.md`

```md
---
title: "Trawler's Wake"
blurb: "PC horror fishing game"
summary: "Shipped Steam horror fishing game with ragdoll fish physics and editor automation."
category: "Game dev"
tags: ["Unity", "URP", "C#", "Steam"]
status: "Shipped"
statusTone: "green"
order: 1
thumb: "../../public/media/trawlers-wake/thumb.jpg"
previewMp4: "/media/trawlers-wake/preview.mp4"
previewWebm: "/media/trawlers-wake/preview.webm"
fullMp4: "/media/trawlers-wake/full.mp4"
fullWebm: "/media/trawlers-wake/full.webm"
poster: "../../public/media/trawlers-wake/poster.jpg"
links:
  - { label: "View on Steam", href: "https://store.steampowered.com/…", type: "steam" }
  - { label: "Source", href: "https://github.com/vailshnast/…", type: "github" }
---

A PC horror fishing game built in Unity 6 (URP). Highlights: ragdoll fish physics,
Catmull-Rom AI pathing, crack shaders, bobber spring physics, and an Odin-based
prefab automation pipeline that cut content iteration time substantially.
```

> **Image path note:** `astro:assets` `image()` schema fields resolve relative to the
> file. If thumbnails live under `public/`, they are *not* processed by `<Image>`.
> **Decision:** put thumbnail/poster **source images in `src/assets/media/<id>/`** so
> `<Image>` can optimize them, and keep **videos in `public/media/<id>/`** (videos are
> served as-is, not processed). Update the schema/paths accordingly and document the
> final convention in README §"Managing projects". Pick one convention and be consistent.

---

## 7. Theming system

Two independent axes on the `<html>` element:

- `data-theme="steam" | "original"` — the **family**, written at build time from
  `site.themeFamily`. Not visitor-switchable.
- `data-mode="dark" | "light"` — toggled at **runtime** by the visitor.

All components reference **semantic tokens only**. Raw colors live in `themes.css` and
map into semantic tokens per (family × mode). Adding a new theme = add value blocks; no
component changes.

### Semantic tokens (the contract)

```
--bg-page, --bg-surface, --bg-surface-2, --bg-elevated
--text-primary, --text-secondary, --text-muted
--accent, --accent-contrast, --accent-soft, --accent-soft-text
--border, --border-strong
--badge-green-bg, --badge-green-text
--badge-blue-bg,  --badge-blue-text
--badge-neutral-bg, --badge-neutral-text
--hover-ring                 /* capsule hover glow color */
--action-bg                  /* button background (may be a gradient) */
--action-text
--scrim                      /* gradient overlay on capsule images */
```

### `src/styles/themes.css` (author all four blocks)

```css
:root {
  --radius: 4px;
  --radius-lg: 8px;
  --ring-glow: 0 0 16px;
}

/* ---------- ORIGINAL · DARK ---------- */
[data-theme="original"][data-mode="dark"] {
  --bg-page:#0e141b; --bg-surface:#16202d; --bg-surface-2:#1b2838; --bg-elevated:#16202d;
  --text-primary:#ffffff; --text-secondary:#c7d5e0; --text-muted:#8f98a0;
  --accent:#66c0f4; --accent-contrast:#0e141b;
  --accent-soft:rgba(102,192,244,.14); --accent-soft-text:#9bcbef;
  --border:rgba(255,255,255,.07); --border-strong:rgba(255,255,255,.15);
  --badge-green-bg:#4c6b22; --badge-green-text:#beee11;
  --badge-blue-bg:#1a3a52;  --badge-blue-text:#67c1f5;
  --badge-neutral-bg:rgba(0,0,0,.45); --badge-neutral-text:#ffffff;
  --hover-ring:#66c0f4;
  --action-bg:#66c0f4; --action-text:#0e141b;
  --scrim:linear-gradient(transparent, rgba(11,17,23,.93));
}

/* ---------- ORIGINAL · LIGHT ---------- */
[data-theme="original"][data-mode="light"] {
  --bg-page:#f5f7fa; --bg-surface:#ffffff; --bg-surface-2:#e9eef3; --bg-elevated:#ffffff;
  --text-primary:#1b2838; --text-secondary:#3a4754; --text-muted:#5a6772;
  --accent:#1a6dc4; --accent-contrast:#ffffff;
  --accent-soft:rgba(26,109,196,.12); --accent-soft-text:#1a6dc4;
  --border:rgba(0,0,0,.08); --border-strong:rgba(0,0,0,.18);
  --badge-green-bg:#dff0c2; --badge-green-text:#3b6d11;
  --badge-blue-bg:#dcecfb;  --badge-blue-text:#1a6dc4;
  --badge-neutral-bg:rgba(0,0,0,.06); --badge-neutral-text:#1b2838;
  --hover-ring:#1a6dc4;
  --action-bg:#1a6dc4; --action-text:#ffffff;
  --scrim:linear-gradient(transparent, rgba(245,247,250,.95));
}

/* ---------- STEAM · DARK ---------- */
[data-theme="steam"][data-mode="dark"] {
  --bg-page:#1b2838; --bg-surface:#16202d; --bg-surface-2:#2a475e; --bg-elevated:#1b2838;
  --text-primary:#ffffff; --text-secondary:#c7d5e0; --text-muted:#8f98a0;
  --accent:#67c1f5; --accent-contrast:#0e141b;
  --accent-soft:rgba(103,193,245,.20); --accent-soft-text:#67c1f5;
  --border:rgba(0,0,0,.30); --border-strong:rgba(103,193,245,.45);
  --badge-green-bg:#4c6b22; --badge-green-text:#beee11;
  --badge-blue-bg:#1a3a52;  --badge-blue-text:#67c1f5;
  --badge-neutral-bg:rgba(0,0,0,.45); --badge-neutral-text:#ffffff;
  --hover-ring:#67c1f5;
  --action-bg:linear-gradient(90deg,#47bfff 0%,#1a44c2 100%); --action-text:#ffffff;
  --scrim:linear-gradient(transparent, rgba(11,17,23,.93));
}

/* ---------- STEAM · LIGHT ---------- */
[data-theme="steam"][data-mode="light"] {
  --bg-page:#eceff3; --bg-surface:#ffffff; --bg-surface-2:#dfe6ee; --bg-elevated:#ffffff;
  --text-primary:#1b2838; --text-secondary:#3a4754; --text-muted:#5e6b78;
  --accent:#1b6fb3; --accent-contrast:#ffffff;
  --accent-soft:rgba(27,111,179,.12); --accent-soft-text:#1b6fb3;
  --border:rgba(0,0,0,.10); --border-strong:rgba(27,111,179,.40);
  --badge-green-bg:#dff0c2; --badge-green-text:#3b6d11;
  --badge-blue-bg:#dbe9f7;  --badge-blue-text:#1b6fb3;
  --badge-neutral-bg:rgba(0,0,0,.06); --badge-neutral-text:#1b2838;
  --hover-ring:#1b6fb3;
  --action-bg:linear-gradient(90deg,#2a8fe0 0%,#1a44c2 100%); --action-text:#ffffff;
  --scrim:linear-gradient(transparent, rgba(236,239,243,.95));
}
```

### No-flash mode script (inline, in `<head>`, before stylesheet paint)

```html
<script is:inline>
  (() => {
    const KEY = 'pf-mode';
    const fallback = document.documentElement.getAttribute('data-mode') || 'dark';
    let mode = localStorage.getItem(KEY);
    if (!mode) {
      mode = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-mode', mode || fallback);
  })();
</script>
```

- `BaseLayout` renders `<html data-theme={site.themeFamily} data-mode={site.defaultMode}>`.
- The inline script then overrides `data-mode` from localStorage / OS preference.
- `ThemeToggle` flips `data-mode`, writes `localStorage['pf-mode']`, updates the icon
  (sun/moon) and `aria-pressed`.

---

## 8. Components & behavior

### BaseLayout.astro
`<head>` (meta from config, fonts, no-flash script, stylesheet links), sets `data-theme`
+ `data-mode`, renders `<slot/>`. Respect `prefers-reduced-motion` globally.

### Header.astro
Identity bar: `name` + `role` (left), `links` buttons + `ThemeToggle` (right). Links use
the configured `icon`. Sticky or static (static is fine).

### ThemeToggle.astro
Sun/moon button. Accessible (`aria-label`, `aria-pressed`). Logic in `src/lib/theme.ts`.

### FilterTabs.astro
Tabs: `All` + `site.categories`. Active tab styled with accent underline. Clicking sets
the active category and re-renders the hero + grid (client-side; no page reload). Use
`aria-selected` / a `role="tablist"`. Keyboard arrow-key navigation between tabs.

### Filtering + Featured rule (important)
- Build the ordered list = all projects sorted by `order` asc, then `title`.
- For the active category (`All` = no filter): `filtered = ordered.filter(matches)`.
- **Hero = `filtered[0]`**; **grid = `filtered.slice(1)`**.
- `filtered.length === 1` → hero only, no grid. `=== 0` → empty state message.
- All projects are rendered server-side; filtering toggles visibility via a `data-category`
  attribute + a small client script. Do **not** require JS to *see* projects — default
  (All) state must be fully visible without JS; JS only enhances filtering/hero-recompute.
  (If recomputing the hero on filter purely client-side is complex, an acceptable
  simplification: keep a fixed hero = first project overall, and the grid filters. Choose
  the approach that keeps the no-JS fallback coherent and document which you picked.)

### FeaturedHero.astro
Large capsule. Image/poster with `--scrim`; over it: `FEATURED` label, title, description
excerpt, tags, and a primary action button (uses `--action-bg`). Plays its preview video
on hover (desktop). Click → opens its modal. Subtle `--border-strong` frame.

### ProjectGrid.astro / ProjectCard.astro
Responsive grid: `repeat(auto-fit, minmax(178px, 1fr))`, gap ~14px. Card = poster image
(via `<Image>`), status badge (top-right), then title + blurb + tags. Squared corners
(`--radius`). On hover: scale ~1.04, `box-shadow: 0 0 0 1px var(--hover-ring), var(--ring-glow) color`,
swap poster → playing `<video>` preview, raise `z-index`. Click → modal.


### ProjectModal.astro  (in-page overlay — NOT a route)
One modal instance reused for all projects, populated on open from the clicked card's
data (or per-project hidden templates). Contains: looped **muted** `<video>` (with
`controls`, `poster`, MP4+WebM sources) or the poster fallback, title, status/meta line,
rendered Markdown description, full tag list, and the `links` as buttons (icon per `type`).
Behavior:
- Open on card/hero click; close on ✕, backdrop click, and `Esc`.
- **Focus trap** while open; return focus to the triggering card on close.
- Lock body scroll while open (`overflow: hidden` on `<html>`).
- Pause/reset the modal video on close. Start muted; respect reduced-motion (no autoplay).
- Implemented as an absolutely/normally-positioned overlay within the page (no `position: fixed`
  pitfalls; ensure it covers the viewport correctly and is scrollable if content is tall).

### StatusBadge.astro
Maps `statusTone` → badge tokens (`green` / `blue` / `neutral`). Renders `status` text.

---

## 9. Media handling (integration)

- **Hover preview** (`ProjectCard` / `FeaturedHero`): `<video muted loop playsinline
  preload="none">` with MP4 + WebM `<source>`s, `poster` = thumb. `play()` on `mouseenter`,
  `pause()` + reset on `mouseleave`. Never autoplay on load. Never play more than the
  hovered one.
- **Modal video**: same element type, `controls` enabled, `preload="metadata"`,
  starts when modal opens (muted), pauses on close.
- **Posters/thumbnails**: `<Image>` from `astro:assets` for responsive WebP. Always set
  meaningful `alt`.
- **Reduced motion**: if `prefers-reduced-motion: reduce`, skip all video autoplay and
  hover scaling; show poster images only.
- The **recording + encoding standard** (resolutions, length, bitrate, file-size caps,
  ffmpeg commands) lives in **README**. Cards/modals must degrade gracefully when video
  fields are absent.

---

## 10. Accessibility

- Full keyboard support: tabs (arrow keys), cards (Enter/Space to open modal), modal
  (focus trap, Esc to close, focus returns to trigger).
- All interactive elements have visible focus rings and `aria` labels/roles.
- Color contrast must pass WCAG AA in **all four** palettes (verify light modes especially).
- `alt` text on every image; decorative icons `aria-hidden`.
- Honor `prefers-reduced-motion` and `prefers-color-scheme`.

---

## 11. Performance targets

- Initial load ships posters only; videos are `preload="none"` and load on demand.
- Optimize images via `astro:assets`. Lazy-load offscreen posters (`loading="lazy"`).
- Near-zero JS: only filter, hover preview, modal, and theme toggle. No framework runtime.
- Lighthouse: Performance ≥ 95, Accessibility ≥ 95 on a mid-tier device.

---

## 12. Astro config & deploy

### `astro.config.mjs`
```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  // User/org site (repo named USERNAME.github.io): site only, base '/'.
  // Project site (repo named e.g. "portfolio"): set base to '/portfolio'.
  site: 'https://USERNAME.github.io',
  base: '/REPO_NAME',          // or '/' for a user/org site
  output: 'static',
  image: { /* defaults are fine */ },
});
```
- **Gotcha**: when `base` is set, build internal asset/links with `import.meta.env.BASE_URL`
  (or Astro's path helpers) so they resolve under the subpath. Verify videos in `public/`
  resolve correctly under `base` (reference them with the base prefix).

### `.github/workflows/deploy.yml`
Use the official Astro action. **Verify the current version via the Astro GitHub Pages
deploy guide / MCP before committing.**
```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: false }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
        # with: { node-version: 20, package-manager: npm }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
- In the repo: **Settings → Pages → Build and deployment → Source = GitHub Actions.**

---

## 13. Acceptance criteria

- [ ] `npm run dev` and `npm run build` succeed with zero TS/Zod errors.
- [ ] Adding a `.md` file under `src/content/projects/` (with assets) makes a new card
      appear with no other code changes.
- [ ] A frontmatter typo (bad `category`, missing required field) **fails the build** with
      a clear message.
- [ ] Changing `site.themeFamily` between `steam` / `original` reskins the whole site.
- [ ] Visitor dark/light toggle works, persists across reloads, and has **no flash** of the
      wrong mode on load.
- [ ] All four palettes pass AA contrast.
- [ ] Hover plays the in-card preview (desktop only).
- [ ] Click opens the modal with the full video + description + working repo links;
      Esc/backdrop/✕ close it; focus is managed.
- [ ] Touch devices: no hover dependency; tap opens the modal.
- [ ] Filter tabs filter the grid and recompute the hero (or the documented fallback).
- [ ] Projects are visible with JavaScript disabled (default "All" view).
- [ ] Builds and deploys to GitHub Pages via the Actions workflow; assets resolve under `base`.

---

## 14. Suggested build order

1. Scaffold Astro + TS; set up Prettier; wire the Astro Docs MCP.
2. `site.ts` config + `BaseLayout` + `themes.css` (all 4 palettes) + no-flash script + `ThemeToggle`. Verify theming/toggle before content.
3. Content Collection schema + 2–3 sample projects (with placeholder media).
4. `ProjectCard` + `ProjectGrid` (static, no JS) → projects visible.
5. `FeaturedHero` + filtering logic + `FilterTabs`.
6. Hover preview video (desktop only; touch falls back to tap-opens-modal).
7. `ProjectModal` (focus trap, scroll lock, video control).
8. Accessibility + reduced-motion pass; Lighthouse.
9. `astro.config.mjs` (`site`/`base`) + deploy workflow; ship to Pages.
10. Fill README gaps; confirm all acceptance criteria.

> When in doubt about an Astro API, query the Astro Docs MCP and prefer the documented
> current pattern over anything in this spec. Flag any deviation in your summary.
