import fs from 'node:fs';
import path from 'node:path';

function checkFileImages(filePath, baseDir) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imgRegex = /src=["']([^"']+)["']/g;
  let match;
  let missing = [];
  while ((match = imgRegex.exec(content)) !== null) {
    let src = match[1];
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) continue;
    let resolved = path.resolve(baseDir, src);
    if (!fs.existsSync(resolved)) {
      missing.push(src + ' (resolved: ' + resolved + ')');
    }
  }
  return missing;
}

let totalMissing = 0;
const pages = [
  'index.html',
  'portfolio/index.html',
  'strony-www/index.html',
  'branding/index.html',
  'o-mnie/index.html',
  'blog/index.html',
  'kontakt/index.html',
  'modernizacja/index.html'
];

const slugs = fs.readdirSync('content/portfolio')
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace('.json', ''));

for (const slug of slugs) {
  pages.push('portfolio/' + slug + '/index.html');
}

for (const p of pages) {
  const dir = path.dirname(p);
  const m = checkFileImages(p, dir);
  if (m.length > 0) {
    console.error('Missing in', p, m);
    totalMissing += m.length;
  }
}

console.log('Checked', pages.length, 'pages. Total missing images:', totalMissing);
