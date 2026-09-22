import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const portfolioDir = './src/content/portfolio';
const publicDir = './public';
const dataDir = './src/data';

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Usuń stare błędne warianty jeśli istnieją
const badOldFiles = [
  'public/assets/portfolio/ja-i-moj-biznes/site-4-480w.webp'
];
for (const b of badOldFiles) {
  if (fs.existsSync(b)) {
    fs.unlinkSync(b);
    console.log(`Usunięto stary nieprawidłowy wariant: ${b}`);
  }
}

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

console.log(`Znaleziono ${imagesToProcess.size} unikalnych obrazów do zbadania i wygenerowania wariantów.`);

const candidateWidths = [360, 480, 800, 1200];
const manifest = {};
const auditReport = [];

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
  const origMeta = await sharp(absPath).metadata();
  const origWidth = origMeta.width;
  const origHeight = origMeta.height;
  const origAspectRatio = (origWidth / origHeight).toFixed(4);

  // Zoptymalizowana jakość stratna WebP (88 dla logotypów/brandingu, 84 dla pozostałych)
  const isLogoOrBranding = /logo|brand|ksiega|sign|znak/i.test(baseName);
  const webpQuality = isLogoOrBranding ? 88 : 84;

  const variantsList = [];

  for (const w of candidateWidths) {
    // Generujemy wariant TYLKO, gdy oryginał jest większy od wariantu o co najmniej 40 px
    // Zapobiega to powiększaniu małych oryginałów (np. 476 px nie może generować 480w!)
    if (origWidth >= w + 40) {
      const outRel = path.join(dirName, `${baseName}-${w}w.webp`).replace(/\\/g, '/');
      const outAbs = path.resolve(publicDir, outRel);

      await sharp(absPath)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: webpQuality, effort: 4 })
        .toFile(outAbs);

      const newStat = fs.statSync(outAbs);
      const newMeta = await sharp(outAbs).metadata();

      variantsList.push({
        width: newMeta.width, // RZECZYWISTA szerokość z metadanych wygenerowanego pliku
        height: newMeta.height,
        src: `/${outRel}`,
        sizeKb: Math.round(newStat.size / 1024),
        format: 'webp'
      });
    }
  }

  // Budujemy prawidłowy srcset z unikalnymi i posortowanymi rosnąco deskryptorami
  // Oryginał dodajemy z jego RZECZYWISTĄ fizyczną szerokością origWidth
  const allCandidates = [
    ...variantsList,
    {
      width: origWidth,
      height: origHeight,
      src: `/${relPath.replace(/\\/g, '/')}`,
      sizeKb: Math.round(origStat.size / 1024),
      format: origMeta.format
    }
  ];

  // Usunięcie powtórzonych szerokości i sortowanie po szerokości rosnąco
  const uniqueWidthsMap = new Map();
  for (const cand of allCandidates) {
    // Jeśli jest już wariant o tej samej szerokości, preferujemy WebP
    if (!uniqueWidthsMap.has(cand.width) || cand.format === 'webp') {
      uniqueWidthsMap.set(cand.width, cand);
    }
  }

  const sortedCandidates = Array.from(uniqueWidthsMap.values()).sort((a, b) => a.width - b.width);
  const srcset = sortedCandidates.map(c => `${encodeURI(c.src)} ${c.width}w`).join(', ');

  const normalizedKey = relPath.replace(/\\/g, '/');
  manifest[normalizedKey] = {
    src: `/${normalizedKey}`,
    width: origWidth,
    height: origHeight,
    aspectRatio: Number(origAspectRatio),
    isVertical: origHeight > origWidth * 1.25,
    sizeKb: Math.round(origStat.size / 1024),
    variants: variantsList,
    srcset
  };

  auditReport.push({
    file: baseName,
    origDimensions: `${origWidth}×${origHeight}`,
    variantsCount: variantsList.length,
    descriptors: sortedCandidates.map(c => `${c.width}w`).join(', ')
  });
}

// Zapisz manifest do pliku JSON
const manifestPath = path.resolve(dataDir, 'image-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`✅ Zapisano manifest metadanych do: ${manifestPath}`);

console.log('=== RAPORT METADANYCH I DESKRYPTORÓW SRCSET ===');
console.table(auditReport.slice(0, 15));
console.table(auditReport.slice(15, 30));
console.table(auditReport.slice(30));
