// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';
import path from 'node:path';

// Mount Keystatic and Node server adapter only in local development server.
// For static production builds, strictly use output: 'static' and trailingSlash: 'always'.
const isBuild = process.argv.includes('build') || process.env.SKIP_KEYSTATIC === 'true';

export default defineConfig({
  site: 'https://grafmen.com',
  output: isBuild ? 'static' : 'server',
  adapter: isBuild ? undefined : node({ mode: 'standalone' }),
  vite: {
    resolve: {
      alias: isBuild ? {} : {
        '@keystatic/core/api/generic': path.resolve('node_modules/@keystatic/core/dist/keystatic-core-api-generic.node.js'),
      },
    },
  },
  integrations: [
    react(),
    markdoc(),
    ...(isBuild ? [] : [keystatic()]),
    sitemap({
      filter: (page) => {
        const excludedErrorPaths = [
          'https://grafmen.com/404/',
          'https://grafmen.com/404.html',
          'https://grafmen.com/en/404/',
          'https://grafmen.com/en/404.html',
          'https://grafmen.com/keystatic/',
          'https://grafmen.com/keystatic',
          'https://grafmen.com/api/keystatic/'
        ];
        return !excludedErrorPaths.some((p) => page === p || page.startsWith(p));
      }
    })
  ],
  trailingSlash: isBuild ? 'always' : 'ignore',
  devToolbar: {
    enabled: false,
  },
  build: {
    format: 'directory',
  },
});
