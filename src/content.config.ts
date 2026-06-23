import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { site } from "./config/site";

// `category` must be one of the owner-configured categories (site.ts). A typo
// here fails the build instead of producing an empty filter tab. z.enum needs a
// non-empty literal tuple, hence the cast.
const categories = site.categories as [string, ...string[]];

const linkType = z.enum([
  "github",
  "gitlab",
  "steam",
  "itch",
  "demo",
  "external",
]);

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      blurb: z.string(),
      // Richer featured-hero teaser; the UI falls back to `blurb` when absent.
      summary: z.string().optional(),
      category: z.enum(categories),
      tags: z.array(z.string()).min(1),
      status: z.string().optional(),
      statusTone: z.enum(["green", "blue", "neutral"]).default("neutral"),
      // Target platform, shown as a prominent fixed-width badge on the card.
      platform: z.enum(["PC", "Mobile", "VR", "Web", "LMS"]).optional(),
      order: z.number().default(999),
      // Media orientation. "portrait" media (9:16) is shown letterboxed with a
      // blurred backdrop instead of cropped to the 16:9 frame. Default landscape.
      orientation: z.enum(["landscape", "portrait"]).default("landscape"),
      // Card capsule / initial image. Lives in src/assets/media/<id>/ so
      // astro:assets can optimize it. Also used as the modal poster / portrait
      // backdrop even when `banner` (below) renders the card itself.
      thumb: image(),
      // Optional: render the card media from a live CSS component instead of the
      // `thumb` image. Must be a registered key (see ProjectCard `BANNERS`); an
      // unknown value fails the build rather than silently falling back.
      banner: z.enum(["block-puzzle", "finance-tracker"]).optional(),
      // YouTube watch/share URL (or bare 11-char id). Powers BOTH the card hover
      // preview (muted autoplay loop) and the modal (full embed). When absent,
      // the card shows only `thumb` and the modal shows it as a still.
      youtube: z.string().optional(),
      // A project may have no external links (e.g. a closed-source LMS build);
      // the modal omits the links row entirely when empty.
      links: z
        .array(
          z.object({
            label: z.string(),
            href: z.string().url(),
            type: linkType,
          }),
        )
        .default([]),
    }),
});

export const collections = { projects };
