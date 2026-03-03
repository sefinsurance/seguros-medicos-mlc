import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://obamacarelocal.com',
  integrations: [
    sitemap({
      // Prefer clean trailing slashes to match your routes.
      // (Astro will still include both in canonical/hreflang when relevant.)
      filter: (page) => !page.pathname.includes('/images/'),
    }),
  ],
});
