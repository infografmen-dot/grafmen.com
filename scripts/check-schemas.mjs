import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const files = [
  'index.html',
  'en/index.html',
  'strony-www/index.html',
  'en/websites/index.html',
  'branding/index.html',
  'en/branding/index.html',
  'modernizacja/index.html',
  'en/redesign/index.html',
  'o-mnie/index.html',
  'en/about/index.html',
  'kontakt/index.html',
  'en/contact/index.html',
  'portfolio/index.html',
  'en/portfolio/index.html',
  'portfolio/drewmax/index.html',
  'en/portfolio/drewmax/index.html',
  'blog/samo-logo-czy-identyfikacja-wizualna/index.html',
  'en/blog/logo-only-or-visual-identity/index.html',
  'brief-strony-www/index.html',
  'brief-branding/index.html',
  'en/brief-website/index.html',
  'en/brief-branding/index.html'
];

for (const f of files) {
  const p = path.join(distDir, f);
  if (!fs.existsSync(p)) continue;
  const html = fs.readFileSync(p, 'utf8');
  const matches = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  console.log(`\n=== PAGE: ${f} ===`);
  if (matches) {
    matches.forEach((m, idx) => {
      const raw = m.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
      try {
        const obj = JSON.parse(raw);
        console.log(`  Schema #${idx + 1} [@type: ${obj['@type']}]:`, JSON.stringify(obj, null, 2));
      } catch (e) {
        console.log(`  INVALID JSON:`, e.message);
      }
    });
  } else {
    console.log('  NO SCHEMA FOUND');
  }
}
