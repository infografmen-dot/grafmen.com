import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve('.');
const pages = [
  { name: 'Homepage (/)', file: 'index.html' },
  { name: '/o-mnie/', file: 'o-mnie/index.html' },
  { name: '/strony-www/', file: 'strony-www/index.html' },
  { name: '/modernizacja/', file: 'modernizacja/index.html' },
  { name: '/branding/', file: 'branding/index.html' },
  { name: '/portfolio/', file: 'portfolio/index.html' },
  { name: '/blog/', file: 'blog/index.html' },
  { name: '/kontakt/', file: 'kontakt/index.html' },
  { name: 'Case Study (hiker)', file: 'portfolio/hiker/index.html' },
  { name: 'Case Study (drewmax)', file: 'portfolio/drewmax/index.html' }
];

console.log('=== AUDYT NUMERACJI SEKCJI ===\n');

for (const p of pages) {
  const content = readFileSync(join(root, p.file), 'utf8');
  console.log(`--- ${p.name} ---`);
  
  // Znajdź wszystkie kickery: home-kicker, section-kicker
  const regex = /<p[^>]*class="[^"]*(?:home-kicker|section-kicker)[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  const kickers = [];
  while ((match = regex.exec(content)) !== null) {
    const raw = match[1].replace(/\s+/g, ' ').trim();
    const hasSpan = /<span class="section-index">([\s\S]*?)<\/span>/i.test(raw);
    const cleanText = raw.replace(/<[^>]+>/g, '').trim();
    kickers.push({ cleanText, hasSpan, raw });
  }

  for (const k of kickers) {
    const isNumbered = /^\d{2}\s*[·/]/.test(k.cleanText);
    console.log(`  [${isNumbered ? 'NUMEROWANA' : 'NIENUMEROWANA'}] ${k.cleanText} (span: ${k.hasSpan})`);
  }
  console.log('');
}
