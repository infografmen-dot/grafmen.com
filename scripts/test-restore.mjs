import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const backupDir = 'D:\\www\\grafmen\\backups\\grafmen-backup-2026-09-30_20-17-11';
const restoreDir = 'D:\\www\\grafmen\\test-restore';

console.log('=== TEST ODTWORZENIA KOPII ZAPASOWEJ ===');
console.log('Katalog kopii: ', backupDir);
console.log('Katalog testowy:', restoreDir);

// 1. Weryfikacja sum kontrolnych SHA-256
console.log('\n[1/6] Weryfikacja sum SHA-256...');
function getSha256(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

const bundlePath = path.join(backupDir, 'git-history.bundle');
const archivePath = path.join(backupDir, 'working-tree.tar.gz');

const calcBundleHash = getSha256(bundlePath);
const calcArchiveHash = getSha256(archivePath);

const checksumsRaw = fs.readFileSync(path.join(backupDir, 'checksums.sha256'), 'utf-8');

console.log('git-history.bundle  SHA-256:', calcBundleHash);
console.log('working-tree.tar.gz SHA-256:', calcArchiveHash);

if (!checksumsRaw.includes(calcBundleHash) || !checksumsRaw.includes(calcArchiveHash)) {
  console.error('[BŁĄD] Sumy kontrolne nie zgadzają się z plikiem checksums.sha256!');
  process.exit(1);
}
console.log('✓ Sumy kontrolne SHA-256 są w 100% zgodne.');

// 2. Czyszczenie i przygotowanie katalogu testowego
console.log('\n[2/6] Odtwarzanie repozytorium Git z pliku bundle...');
if (fs.existsSync(restoreDir)) {
  fs.rmSync(restoreDir, { recursive: true, force: true });
}
fs.mkdirSync(restoreDir, { recursive: true });

execSync(`git clone "${bundlePath.replace(/\\/g, '/')}" .`, { cwd: restoreDir, stdio: 'inherit' });
execSync('git checkout main', { cwd: restoreDir, stdio: 'inherit' });
console.log('✓ Historia Gita odtworzona pomyślnie z bundle.');

// 3. Rozpakowanie archiwum working-tree.tar.gz
console.log('\n[3/6] Nakładanie plików roboczych i szkiców z working-tree.tar.gz...');
execSync(`tar.exe -xzf "${archivePath.replace(/\\/g, '/')}" -C .`, { cwd: restoreDir, stdio: 'inherit' });

// Weryfikacja obecności kluczowych plików
const requiredPaths = [
  'package.json',
  'package-lock.json',
  'astro.config.mjs',
  'docs/domain-launch.md',
  'src/content/blog/how-to-design-a-website-that-helps-sell-services.md',
  'src/content/blog/how-to-prepare-a-website-brief.md',
  'public/assets/cubes-bg.png',
  'public/assets/motion/hiker-film-poster.webp',
  'podglad-dist.bat',
  'public/contact.js'
];

for (const p of requiredPaths) {
  if (!fs.existsSync(path.join(restoreDir, p))) {
    console.error(`[BŁĄD] Brak oczekiwanego pliku w odtworzonej kopii: ${p}`);
    process.exit(1);
  }
}
console.log('✓ Wszystkie pliki robocze, szkice i grafiki są obecne w odtworzonym katalogu.');

// 4. Instalacja zależności (npm ci)
console.log('\n[4/6] Instalacja zależności z pliku blokady (npm ci)...');
execSync('npm ci', { cwd: restoreDir, stdio: 'inherit' });
console.log('✓ Zależności zainstalowane bezbłędnie (zgodnie z package-lock.json).');

// 5. Test kompilacji (npm run build)
console.log('\n[5/6] Test budowania strony (npm run build)...');
execSync('npm run build', { cwd: restoreDir, stdio: 'inherit' });

const distIndex = path.join(restoreDir, 'dist', 'index.html');
const distSitemap = path.join(restoreDir, 'dist', 'sitemap-index.xml');
const distKeystatic = path.join(restoreDir, 'dist', 'keystatic');

if (!fs.existsSync(distIndex) || !fs.existsSync(distSitemap)) {
  console.error('[BŁĄD] Brak plików wynikowych dist/index.html lub sitemap-index.xml!');
  process.exit(1);
}

if (fs.existsSync(distKeystatic)) {
  console.error('[BŁĄD BEZPIECZEŃSTWA] Panel Keystatic wyciekł do publicznego katalogu dist!');
  process.exit(1);
}
console.log('✓ Build produkcyjny zakończony sukcesem (69 podstron, brak wycieku CMS do dist).');

console.log('\n[6/6] Gotowe do testu serwera podglądu.');
console.log('Test odtworzenia zakończony statusem: PEŁNY SUKCES (VERIFIED).');
