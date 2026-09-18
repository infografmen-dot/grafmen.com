// Package the existing static site. No framework compilation or dependencies.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import './build-projects.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const folders = ['assets', 'strony-www', 'modernizacja', 'branding', 'portfolio', 'o-mnie', 'blog', 'kontakt'];
const files = ['index.html', 'site-base.css', 'site-pages.css', 'portfolio.css',
  'home-sections.css', 'language-preview.css', 'language-preview.js',
  'site-navigation.js', 'portfolio-motion.js', 'portfolio-motion.css', 'contact.js', 'scroll-reveal.js', 'fluid-glass-menu.css', 'fluid-glass-menu.js', 'grafmen-motion.js', 'sitemap.xml', 'robots.txt',
  'favicon.ico', 'favicon.svg', 'apple-touch-icon.png'];

for (const name of [...files, ...folders]) {
  if (!existsSync(join(root, name))) throw new Error(`Missing site input: ${name}`);
}
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const name of files) cpSync(join(root, name), join(output, name));
for (const name of folders) cpSync(join(root, name), join(output, name), { recursive: true });
console.log(`Static site ready in dist/: ${readdirSync(output).length} top-level entries.`);
