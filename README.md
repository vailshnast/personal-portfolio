# Portfolio

A fast, static **developer portfolio** inspired by the Steam store. It leads with
projects: visitors see everything at a glance, preview videos on hover, and open a full
detail modal on click. Built with Astro, hosted free on GitHub Pages.

- **Capsule grid** of projects, with **category filter tabs**.
- **Hover** → in-card video preview.
- **Click** → in-page modal with the full video, description, and repo links.
- **Theming**: you pick a color **family** (Steam or Original); visitors toggle **dark / light**.

> Building or modifying the code? See [`project-specification.md`](./project-specification.md)
> for the full implementation brief. This README covers running, managing, and deploying it.

---

## How it works

- **Static site.** Astro builds plain HTML/CSS with a tiny bit of vanilla JS (filtering,
  hover preview, modal, theme toggle). No backend, no database.
- **One Markdown file per project.** Each lives in `src/content/projects/`. Its frontmatter
  defines the card; its body is the long description shown in the modal. Add a file → a new
  card appears. Delete it → it's gone.
- **Assets per project** (videos + images) live in their own folder so projects stay
  self-contained.
- **Theme** is two independent axes: the **family** (set once by you in config) and the
  **dark/light mode** (chosen by each visitor, remembered in their browser).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Astro (v5+), static output |
| Language | TypeScript (strict) |
| Content | Astro Content Collections (1 Markdown file per project), Zod-validated |
| Styling | Plain CSS + custom properties (no Tailwind) |
| Images | `astro:assets` (`<Image>`, Sharp) |
| Video | YouTube embed (`youtube:`), injected on demand; nothing committed (no Git LFS) |
| Hosting | GitHub Pages via GitHub Actions |

---

## Quick start (local development)

**Prerequisites:** Node.js 20+ and npm.

```bash
npm install        # install dependencies
npm run dev        # local dev server at http://localhost:4321
npm run build      # production build → ./dist
npm run preview    # preview the production build locally
```

Recommended editor: **WebStorm** or **IntelliJ IDEA Ultimate** with the Astro plugin
(Settings → Plugins → "Astro"), or VS Code with the official Astro extension. Node.js
must be installed for editor language support to work.

---

## Configuration

All owner-facing settings live in **`src/config/site.ts`**:

| Setting | What it does |
|---|---|
| `name`, `role` | The identity bar at the top |
| `links` | Header buttons (GitHub, GitLab, CV…) — each has `label`, `href`, `icon` |
| `themeFamily` | `'steam'` or `'original'` — the active color family |
| `defaultMode` | `'dark'` or `'light'` — initial mode before a visitor sets their own |
| `categories` | Filter tab order, e.g. `['Game dev', 'Backend', 'Tooling']` (`All` is automatic) |
| `metaTitle`, `metaDescription` | SEO / browser tab |

To **rebrand**, edit this one file. To **switch theme family**, change `themeFamily` and
rebuild.

---

## Managing projects

### Add a project

1. Create `src/content/projects/<your-project-id>.md`. The filename (the `id`) is used for
   the media folder.
2. Add its assets under the media folder for that id (see **Where assets go** below).
3. Fill in the frontmatter (see **Project fields**) and write the long description in the
   body.
4. Run `npm run dev` to preview. Commit and push to publish.

### Remove a project

Delete its `.md` file (and optionally its media folder). That's it.

### Reorder projects

Set the `order` number in each project's frontmatter (lower = earlier). Cards appear in
that order in the grid; ties break alphabetically by title.

### Project fields

```md
---
title: "Trawler's Wake"           # required — card + modal title
blurb: "PC horror fishing game"   # required — one line on the card
summary: "Longer teaser…"         # optional — lead line shown in the modal under the title
category: "Game dev"              # required — MUST match a category in site.ts
tags: ["Unity", "URP", "C#"]      # required — tech pills
status: "Shipped"                 # optional — badge text
statusTone: "green"               # optional — green | blue | neutral (default neutral)
platform: "PC"                    # optional — PC | Mobile | VR (icon badge on the card)
order: 1                          # optional — sort key, ascending (default 999)
orientation: "landscape"          # optional — "landscape" (default) or "portrait" (9:16)
thumb: "…/banner.jpg"            # required — card capsule / initial image
youtube: "https://youtu.be/ID"   # optional — YouTube URL or bare id; powers hover preview + modal
links:                            # required — at least one
  - { label: "Source", href: "https://github.com/…", type: "github" }
  - { label: "View on Steam", href: "https://…", type: "steam" }
---

The Markdown body here becomes the full description shown in the modal.
```

> If a typo or a missing required field sneaks in (e.g. a `category` that isn't in
> `site.ts`), **the build fails with a clear error** instead of silently shipping a broken
> card. That's intentional.

A project with **no `youtube`** still works — the card shows the static image and the modal
shows it as a still.

### Where assets go

- **Image** (the card/modal `thumb`) → `src/assets/media/<id>/` (e.g. a Steam
  `banner.jpg`), so Astro's `<Image>` can optimize it. Reference it in frontmatter by a path
  relative to the `.md` file, e.g. `thumb: "../../assets/media/<id>/banner.jpg"`. (Images
  under `public/` are *not* processed by `<Image>`; that's why sources live in `src/`.)
- **Video** is embedded from YouTube via the `youtube` field — nothing is committed.

The folder is named after the project `id` (the Markdown filename).

---

## Media standard

**Video is YouTube.** Set `youtube` to a watch/share URL (or bare 11-char id) and the same
video drives both roles:

- **Card hover preview** — muted, looping, no controls (a silent loop). The iframe is
  injected only when you hover and removed when you leave, so the page never loads a player
  up front and only the hovered card ever plays.
- **Modal** — opens muted with controls, so a visitor can unmute, seek, and go fullscreen.
  The iframe is torn down on close, which stops playback and any audio immediately.

`prefers-reduced-motion` suppresses autoplay in both. This offloads all video bandwidth to
YouTube — there are no media files in the repo and no size budget to manage.

### Image

Each project needs one **`thumb`** image — the card capsule / initial frame, also the modal
still when there's no `youtube`. A Steam **header/`banner.jpg`** works well. It goes in
`src/assets/media/<id>/` so Astro's `<Image>` optimizes it (16:9 `cover`; ~460×215 Steam
headers crop slightly, which is fine). For a portrait card set `orientation: "portrait"` —
the image renders `contain` over a blurred backdrop instead of cropping.

---

## Theming

- **Pick the family** in `site.ts` (`themeFamily: 'steam' | 'original'`). This is fixed at
  build time.
- **Visitors toggle dark/light** with the sun/moon button in the header. Their choice is
  remembered (localStorage) and defaults to their OS preference; there's no flash of the
  wrong mode on load.
- All four palettes (Steam-dark, Steam-light, Original-dark, Original-light) live as CSS
  variables in `src/styles/themes.css`. To **tweak colors**, edit the relevant block. To
  **add a new family**, copy a pair of blocks, rename the `[data-theme="…"]` selector, and
  add the name to the `ThemeFamily` type — components reference semantic tokens only, so no
  component edits are needed.

---

## Deploying to GitHub Pages

### This repo's configuration

`astro.config.mjs` is already set up as a **project site**:

```js
site: 'https://vailshnast.github.io',
base: '/personal-portfolio',
```

→ live URL: **`https://vailshnast.github.io/personal-portfolio/`**

If you fork/rename this, pick your URL type and update `astro.config.mjs` accordingly:

- **User/org site** — repo named exactly `USERNAME.github.io` → `site: 'https://USERNAME.github.io'`,
  `base: '/'`.
- **Project site** — any repo name → `site: 'https://USERNAME.github.io'`,
  `base: '/REPO_NAME'`.

### First-time setup

1. On GitHub: **Settings → Pages → Build and deployment → Source = GitHub Actions.**
2. Push to `main`. The included workflow (`.github/workflows/deploy.yml`) builds and
   publishes automatically (`actions/checkout@v6` → `withastro/action@v6` →
   `actions/deploy-pages@v5`). The Actions tab shows progress; the live URL appears in the
   workflow's "deploy" step.

### Push the project the first time

The repo is already initialised on the `main` branch. Link the remote and push:

```bash
git remote add origin https://github.com/vailshnast/personal-portfolio.git
git push -u origin main
```

### Update the live site (the normal flow)

```bash
# edit content/config/assets…
git add .
git commit -m "Add project X / update theme / new video"
git push
```

Every push to `main` triggers a rebuild and redeploy — usually live within a minute or two.

---

## Troubleshooting

- **Styles/images/videos 404 on the live site but work locally** → `base` is wrong in
  `astro.config.mjs`. A project site needs `base: '/REPO_NAME'`; reference `public/` assets
  with the base prefix.
- **Build fails after adding a project** → check the frontmatter against **Project fields**;
  the error message names the offending field. Common culprit: a `category` not listed in
  `site.ts`.
- **Flash of the wrong color mode on load** → the inline no-flash script in the `<head>`
  must run before the stylesheet; don't move it into a deferred bundle.
- **Hover preview doesn't play** → confirm `youtube` is a valid watch/share URL or 11-char
  id, and that you're testing with a real pointer (hover preview is gated to `hover: hover`
  / `pointer: fine`; on touch, a tap opens the modal instead).
- **Video doesn't load** → check the id resolves on youtube.com and the video allows
  embedding (some are owner-restricted).

---

## Project structure (reference)

```
src/
  config/site.ts              # your settings
  content/projects/*.md       # one file per project
  content.config.ts           # schema (validates frontmatter)
  styles/themes.css           # the four palettes
  components/                 # Header, FilterTabs, ProjectCard, ProjectGrid, modal…
  layouts/BaseLayout.astro
  pages/index.astro
public/
  media/<id>/                 # per-project videos
  cv.pdf
.github/workflows/deploy.yml  # GitHub Pages CI
astro.config.mjs              # site + base
```
