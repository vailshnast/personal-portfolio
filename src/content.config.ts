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
      // Richer hover-tooltip teaser; the UI falls back to `blurb` when absent.
      summary: z.string().optional(),
      category: z.enum(categories),
      tags: z.array(z.string()).min(1),
      status: z.string().optional(),
      statusTone: z.enum(["green", "blue", "neutral"]).default("neutral"),
      order: z.number().default(999),
      // Image sources live in src/assets/media/<id>/ so astro:assets can optimize them.
      thumb: image(),
      // Video paths point at public/media/<id>/ and are served as-is (plain strings).
      previewMp4: z.string().optional(),
      previewWebm: z.string().optional(),
      fullMp4: z.string().optional(),
      fullWebm: z.string().optional(),
      // Modal poster; falls back to `thumb` when absent.
      poster: image().optional(),
      links: z
        .array(
          z.object({
            label: z.string(),
            href: z.string().url(),
            type: linkType,
          }),
        )
        .min(1),
    }),
});

export const collections = { projects };
