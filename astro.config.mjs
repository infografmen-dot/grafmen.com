// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://grafmen.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => {
        const excludedErrorPaths = [
          'https://grafmen.com/404/',
          'https://grafmen.com/404.html',
          'https://grafmen.com/en/404/',
          'https://grafmen.com/en/404.html'
        ];
        return !excludedErrorPaths.includes(page);
      }
    })
  ],
  trailingSlash: 'always',
  devToolbar: {
    enabled: false,
  },
  build: {
    format: 'directory',
  },
});
