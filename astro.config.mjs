// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Mount Keystatic and Node server adapter only in local development server.
// For static production builds and preview, strictly use output: 'static' and trailingSlash: 'always'.
const isBuild = process.argv.includes('build') || process.argv.includes('preview') || process.env.SKIP_KEYSTATIC === 'true';

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
      },
      serialize: (item) => {
        const url = item.url;
        const lastmod = new Date().toISOString().split('T')[0];
        const highPriorityPl = [
          'https://grafmen.com/strony-www/',
          'https://grafmen.com/branding/',
          'https://grafmen.com/modernizacja/',
          'https://grafmen.com/oferta/',
          'https://grafmen.com/portfolio/',
          'https://grafmen.com/o-mnie/',
          'https://grafmen.com/kontakt/',
        ];
        if (url === 'https://grafmen.com/') {
          return { ...item, lastmod, priority: 1.0 };
        }
        if (highPriorityPl.includes(url)) {
          return { ...item, lastmod, priority: 0.9 };
        }
        if (!url.includes('/en/')) {
          return { ...item, lastmod, priority: 0.8 };
        }
        return { ...item, lastmod, priority: 0.6 };
      }
    }),
    {
      name: 'sort-sitemap-pl-first',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const sitemapPath = path.join(fileURLToPath(dir), 'sitemap-0.xml');
          if (!fs.existsSync(sitemapPath)) return;
          const xml = fs.readFileSync(sitemapPath, 'utf8');
          const urlRegex = /<url>[\s\S]*?<\/url>/g;
          const urls = xml.match(urlRegex);
          if (!urls || urls.length === 0) return;

          const tier1Order = [
            'https://grafmen.com/',
            'https://grafmen.com/strony-www/',
            'https://grafmen.com/branding/',
            'https://grafmen.com/modernizacja/',
            'https://grafmen.com/oferta/',
            'https://grafmen.com/portfolio/',
            'https://grafmen.com/o-mnie/',
            'https://grafmen.com/kontakt/',
            'https://grafmen.com/brief-strony-www/',
            'https://grafmen.com/brief-branding/',
            'https://grafmen.com/blog/',
          ];

          const getLoc = (block) => {
            const m = block.match(/<loc>(.*?)<\/loc>/);
            return m ? m[1] : '';
          };

          const getRank = (loc) => {
            const t1 = tier1Order.indexOf(loc);
            if (t1 !== -1) return t1;
            if (!loc.includes('/en/')) {
              if (loc.startsWith('https://grafmen.com/portfolio/')) return 100;
              if (loc.startsWith('https://grafmen.com/blog/')) return 200;
              return 300;
            }
            return 1000;
          };

          urls.sort((a, b) => {
            const locA = getLoc(a);
            const locB = getLoc(b);
            const rankA = getRank(locA);
            const rankB = getRank(locB);
            if (rankA !== rankB) return rankA - rankB;
            return locA.localeCompare(locB);
          });

          const sortedXml = xml.replace(/(<urlset[^>]*>)[\s\S]*?(<\/urlset>)/, `$1${urls.join('')}$2`);
          fs.writeFileSync(sitemapPath, sortedXml, 'utf8');
        }
      }
    }
  ],
  trailingSlash: isBuild ? 'always' : 'ignore',
  devToolbar: {
    enabled: false,
  },
  build: {
    format: 'directory',
  },
});
