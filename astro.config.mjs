// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// Project repo: served from https://vailshnast.github.io/personal-portfolio/
// `base` is the repo name; all internal links/assets resolve through
// import.meta.env.BASE_URL so they stay correct under this subpath.
// https://astro.build/config
export default defineConfig({
  site: 'https://vailshnast.github.io',
  base: '/personal-portfolio',
  output: 'static',
  integrations: [sitemap()],
});