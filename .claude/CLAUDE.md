# CLAUDE.md

Project rules and conventions for AI agents working in this repo. Read this first, every
session. For full build detail see **`project-specification.md`**; for human usage see
**`README.md`**. Keep all three in sync when behavior changes.

## What this is

A static, Steam-store-inspired developer portfolio. Projects-first: featured hero +
capsule grid + category filter tabs; hover shows an in-card video preview;
click opens an in-page modal with the full video, description, and repo links. Two-axis
theming (owner picks a color **family**; visitor toggles **dark/light**). Deployed to
GitHub Pages.

## Use the Astro Docs MCP — always

This project is configured for the Astro Docs MCP server. **Query it to confirm current
APIs before writing or changing Astro code** — especially Content Collections
(`content.config.ts`, `glob()` loader), `astro:assets` `<Image>`, and the GitHub Pages
deploy action versions. If the spec and the live docs disagree, **the live docs win** —
note the deviation in your summary.

```bash
# one-time, if not already set:
claude mcp add --transport http astro-docs https://mcp.docs.astro.build/mcp
```

## Commands

```bash
npm install        # deps
npm run dev        # dev server (http://localhost:4321)
npm run build      # production build → ./dist  (must pass with zero TS/Zod errors)
npm run preview    # preview the build
npx prettier . --write   # format (uses prettier-plugin-astro)
```

- Add integrations with `astro add <name>`; install packages with `npm install <pkg>`.
- **Do not hand-edit `package.json`** to add deps. **Do not edit `dist/`** (generated).

## Stack constraints (do not violate)

- **Astro v5+, `output: 'static'`.** No SSR, no adapters, no server endpoints.
- **TypeScript, strict.** No `any` escape hatches without a comment justifying it.
- **No CSS framework.** Plain CSS + custom properties only. No Tailwind.
- **No UI framework.** No React/Vue/Svelte/Solid. Interactivity is vanilla TS in Astro
  `<script>` tags. Ship as little JS as possible.
- **No Git LFS.** GitHub Pages won't serve it. Videos are committed plainly in `public/`.
- **No backend, no database, no CMS, no auth, no i18n, no blog.** Out of scope.
- **No per-project routes / deep-links.** Detail is a modal, not a page. (May come later.)

## Repo map

```
src/config/site.ts        # OWNER config: name, role, links, themeFamily, defaultMode, categories
src/content.config.ts     # Content Collection + Zod schema (validates project frontmatter)
src/content/projects/*.md # one file per project; body = long description (modal)
src/styles/themes.css     # all four palettes as CSS variables (semantic tokens)
src/lib/                   # projects.ts (load/sort/filter), theme.ts (no-flash + toggle)
src/components/            # Header, ThemeToggle, FilterTabs, FeaturedHero, ProjectCard,
                           # ProjectGrid, ProjectModal, StatusBadge
src/layouts/BaseLayout.astro
src/pages/index.astro      # the only page
public/media/<id>/         # per-project videos (preview.*, full.*) + posters per spec
.github/workflows/deploy.yml
astro.config.mjs           # site + base (GitHub Pages)
```

## Hard rules

**Theming**
- Components reference **semantic tokens only** (`var(--accent)`, `var(--bg-surface)`, …).
  Never hardcode a hex/raw color in a component. Raw colors live only in `themes.css`.
- `<html>` carries `data-theme` (family, from `site.themeFamily`, build-time) and
  `data-mode` (dark/light, runtime). Adding a theme = add value blocks in `themes.css` only.
- The **no-flash inline script stays inline in `<head>`**, before the stylesheet. Do not
  move it into a deferred/bundled script — that reintroduces the flash.
- Every change must look correct in **all four** palettes; light modes must pass WCAG AA.

**Content / data**
- Adding a project = drop one `.md` file (+ assets). **No code changes required.** If a
  change forces editing components to add a project, the design is wrong — fix the data
  layer instead.
- The Zod schema must **fail the build** on bad/missing frontmatter (e.g. a `category` not
  in `site.ts`). Don't make fields silently optional to dodge errors.

**Behavior**
- **Projects-first, no endless scroll.** Default ("All") view must show projects **with
  JavaScript disabled.** JS only enhances (filter, hero recompute, hover preview, modal, toggle).
- **Hover depends on a pointer.** Gate the in-card video preview behind
  `(hover: hover)` / `(pointer: fine)`. On touch, a tap opens the modal directly.
- **Modal**: focus trap, `Esc`/backdrop/✕ to close, return focus to the trigger, lock body
  scroll, pause/reset video on close. (Standard fixed/overlay modal is fine here — this is
  a real site, not a sandboxed iframe.)
- Honor `prefers-reduced-motion` (no autoplay, no scale animations) and
  `prefers-color-scheme` (initial mode).

**Media**
- Hover/modal videos: `<video muted loop playsinline>` with **MP4 + WebM** sources,
  `preload="none"` (hover) / `"metadata"` (modal), `poster` set. **Never autoplay on load;
  never play more than the hovered one.** Play on `mouseenter`, pause+reset on `mouseleave`.
- Thumbnails/posters go through `astro:assets` `<Image>` with real `alt` text.
- Keep total media lean (target < ~50 MB). Recording/encoding standard is in README.

**GitHub Pages**
- `astro.config.mjs` `base` must match the repo type: `'/'` for a `USERNAME.github.io`
  user-site, `'/REPO_NAME'` for a project repo. Reference `public/` assets respecting
  `base` (use `import.meta.env.BASE_URL` / Astro path helpers for internal links).

## Definition of done (per change)

- `npm run build` passes clean (TS + Zod).
- Works in all four palettes; AA contrast holds.
- Keyboard-accessible; reduced-motion respected; touch path works.
- No new framework runtime or LFS; no hardcoded colors in components.
- README / spec / this file updated if behavior or conventions changed.
