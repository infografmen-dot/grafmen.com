import fs from 'node:fs';
import path from 'node:path';

const distDir = './dist/portfolio';
const htmlFiles = fs.readdirSync(distDir, { recursive: true }).filter(f => f.endsWith('index.html'));

let totalImgTags = 0;
let missingFiles = 0;
const checkedPaths = new Set();
const stats = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(distDir, file), 'utf8');
  const imgMatches = content.matchAll(/<img[^>]+srcset="([^"]+)"[^>]*>/g);
  for (const match of imgMatches) {
    totalImgTags++;
    const srcset = match[1];
    const entries = srcset.split(',').map(s => s.trim().split(' ')[0]);
    for (const src of entries) {
      const decodedSrc = decodeURI(src);
      const cleanSrc = decodedSrc.startsWith('/') ? decodedSrc.slice(1) : decodedSrc;
      const pubPath = path.resolve('./public', cleanSrc);
      if (!fs.existsSync(pubPath)) {
        console.error('BŁĄD: Brakujący plik:', pubPath, 'na podstronie:', file);
        missingFiles++;
      } else if (!checkedPaths.has(pubPath)) {
        checkedPaths.add(pubPath);
        const st = fs.statSync(pubPath);
        stats.push({ path: cleanSrc, sizeKb: Math.round(st.size / 1024) });
      }
    }
  }
}

console.log('=== WERYFIKACJA ZGODNOŚCI PLIKÓW SRCSET ===');
console.log(`Liczba sprawdzonych tagów <img> z srcset: ${totalImgTags}`);
console.log(`Liczba unikalnych plików wariantów/oryginałów: ${checkedPaths.size}`);
console.log(`Liczba brakujących plików: ${missingFiles}`);

if (missingFiles === 0) {
  console.log('✔ WSZYSTKIE pliki zdefiniowane w srcset ISTNIEJĄ i są poprawne!');
}
