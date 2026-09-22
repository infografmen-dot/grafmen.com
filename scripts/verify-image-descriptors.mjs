import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const distDir = './dist/portfolio';
const htmlFiles = fs.readdirSync(distDir, { recursive: true }).filter(f => f.endsWith('index.html'));

let totalImgTags = 0;
let totalDescriptors = 0;
let errorsCount = 0;
const verifiedFiles = new Map();

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(distDir, file), 'utf8');
  // Szukamy tagów img w sekcjach project-cover i project-gallery
  const coverMatch = content.match(/<figure class="project-cover[^"]*">\s*(<img\s+[^>]+>)/);
  const galleryMatches = Array.from(content.matchAll(/<div class="project-gallery">([\s\S]*?)<\/div>/g));

  const portfolioImgs = [];
  if (coverMatch) portfolioImgs.push(coverMatch[1]);

  for (const gm of galleryMatches) {
    const imgs = gm[1].matchAll(/<img\s+([^>]+)>/g);
    for (const im of imgs) {
      portfolioImgs.push(im[0]);
    }
  }

  for (const imgTag of portfolioImgs) {
    const srcMatch = imgTag.match(/src="([^"]+)"/);
    const widthMatch = imgTag.match(/width="(\d+)"/);
    const heightMatch = imgTag.match(/height="(\d+)"/);
    const srcsetMatch = imgTag.match(/srcset="([^"]+)"/);

    if (!srcMatch) continue;
    totalImgTags++;

    const rawSrc = srcMatch[1];
    const decodedSrc = decodeURI(rawSrc).replace(/^\//, '');
    const absPath = path.resolve('./public', decodedSrc);

    if (!fs.existsSync(absPath)) {
      console.error(`❌ [${file}] BŁĄD: Plik w 'src' nie istnieje na dysku: ${absPath}`);
      errorsCount++;
      continue;
    }

    // 1. Sprawdzenie zgodności atrybutów width i height z fizycznym plikiem
    let meta = verifiedFiles.get(absPath);
    if (!meta) {
      meta = await sharp(absPath).metadata();
      verifiedFiles.set(absPath, meta);
    }

    const declaredWidth = widthMatch ? parseInt(widthMatch[1], 10) : null;
    const declaredHeight = heightMatch ? parseInt(heightMatch[1], 10) : null;

    if (declaredWidth && declaredWidth !== meta.width) {
      console.error(`❌ [${file}] BŁĄD: Niezgodność 'width' w HTML (${declaredWidth}px) z fizycznym plikiem ${path.basename(absPath)} (${meta.width}px)!`);
      errorsCount++;
    }
    if (declaredHeight && declaredHeight !== meta.height) {
      console.error(`❌ [${file}] BŁĄD: Niezgodność 'height' w HTML (${declaredHeight}px) z fizycznym plikiem ${path.basename(absPath)} (${meta.height}px)!`);
      errorsCount++;
    }

    // 2. Sprawdzenie deskryptorów srcset
    if (srcsetMatch) {
      const entries = srcsetMatch[1].split(',').map(s => s.trim());
      for (const entry of entries) {
        totalDescriptors++;
        const parts = entry.split(/\s+/);
        if (parts.length !== 2 || !parts[1].endsWith('w')) {
          console.error(`❌ [${file}] BŁĄD: Nieprawidłowa składnia srcset '${entry}'`);
          errorsCount++;
          continue;
        }

        const candidateUrl = decodeURI(parts[0]).replace(/^\//, '');
        const candidateWidthDeclared = parseInt(parts[1].replace('w', ''), 10);
        const candidateAbs = path.resolve('./public', candidateUrl);

        if (!fs.existsSync(candidateAbs)) {
          console.error(`❌ [${file}] BŁĄD: Plik z wariantu srcset nie istnieje: ${candidateAbs}`);
          errorsCount++;
          continue;
        }

        let candMeta = verifiedFiles.get(candidateAbs);
        if (!candMeta) {
          candMeta = await sharp(candidateAbs).metadata();
          verifiedFiles.set(candidateAbs, candMeta);
        }

        if (candMeta.width !== candidateWidthDeclared) {
          console.error(`❌ [${file}] BŁĄD: Deskryptor ${candidateWidthDeclared}w różni się od fizycznej szerokości pliku ${path.basename(candidateAbs)} (${candMeta.width}px)!`);
          errorsCount++;
        }
      }
    }
  }
}

console.log('=== RAPORT WERYFIKACJI WYMIARÓW I DESKRYPTORÓW SRCSET ===');
console.log(`Liczba sprawdzonych tagów <img>: ${totalImgTags}`);
console.log(`Liczba unikalnych plików na dysku: ${verifiedFiles.size}`);
console.log(`Liczba sprawdzonych deskryptorów srcset: ${totalDescriptors}`);
console.log(`Liczba wykrytych błędów: ${errorsCount}`);

if (errorsCount === 0) {
  console.log('✅ WSZYSTKIE atrybuty width/height i deskryptory srcset są w 100% zgodne z fizycznymi plikami!');
} else {
  process.exit(1);
}
