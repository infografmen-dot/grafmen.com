import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const portfolioDir = './src/content/portfolio';
const publicDir = './public';

const files = fs.readdirSync(portfolioDir).filter(f => f.endsWith('.json'));

const imagesToProcess = new Set();

files.forEach(f => {
  const data = JSON.parse(fs.readFileSync(path.join(portfolioDir, f), 'utf8'));
  if (data.cover && !data.cover.endsWith('.svg') && !data.cover.endsWith('.mp4')) {
    imagesToProcess.add(data.cover.replace(/^\//, ''));
  }
  (data.gallery || []).forEach(item => {
    if (item.src && !item.src.endsWith('.svg') && !item.src.endsWith('.mp4')) {
      imagesToProcess.add(item.src.replace(/^\//, ''));
    }
  });
});

console.log(`Znaleziono ${imagesToProcess.size} unikalnych obrazów do wygenerowania wariantów responsywnych.`);

const widths = [480, 800, 1200];
const results = [];

for (const relPath of imagesToProcess) {
  const absPath = path.resolve(publicDir, relPath);
  if (!fs.existsSync(absPath)) {
    console.warn(`Plik nie istnieje: ${absPath}`);
    continue;
  }

  const ext = path.extname(relPath);
  const baseName = path.basename(relPath, ext);
  const dirName = path.dirname(relPath);

  const origStat = fs.statSync(absPath);
  const metadata = await sharp(absPath).metadata();
  const origWidth = metadata.width || 1400;

  const generated = [];

  for (const w of widths) {
    if (origWidth >= w * 0.85) {
      const outRel = path.join(dirName, `${baseName}-${w}w.webp`).replace(/\\/g, '/');
      const outAbs = path.resolve(publicDir, outRel);

      await sharp(absPath)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(outAbs);

      const newStat = fs.statSync(outAbs);
      generated.push({ width: w, path: outRel, size: newStat.size });
    }
  }

  results.push({
    file: relPath,
    origSize: origStat.size,
    origWidth,
    generatedCount: generated.length,
    variants: generated.map(g => `${g.width}w (${Math.round(g.size/1024)}KB)`).join(', ')
  });
}

console.log('=== RAPORT GENEROWANIA WARIANTÓW RESP Shadow/Srcset ===');
console.table(results);
console.log('Wszystkie warianty zostały pomyślnie wygenerowane w public/assets/portfolio/...');
