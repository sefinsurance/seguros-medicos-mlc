import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://obamacarelocal.com/',
  // sitemap() generates /sitemap-index.xml + /sitemap-0.xml at build time
  // (public/robots.txt already points crawlers there).
  integrations: [react(), tailwind({ applyBaseStyles: false }), sitemap()],
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'react-router-dom': fileURLToPath(new URL('./src/shims/react-router-dom.js', import.meta.url))
      }
    }
  }
});
