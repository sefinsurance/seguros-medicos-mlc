import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://obamacarelocal.com',
  integrations: [sitemap()],
});
