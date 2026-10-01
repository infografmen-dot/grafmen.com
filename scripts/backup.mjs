import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Parsowanie parametrów wejściowych
const defaultSourceDir = path.resolve(__dirname, '..');
const defaultBackupBase = path.resolve(defaultSourceDir, '..', 'backups');

let sourceDir = defaultSourceDir;
let backupBaseDir = defaultBackupBase;

if (process.argv[2] && process.argv[3]) {
  sourceDir = path.resolve(process.argv[2]);
  backupBaseDir = path.resolve(process.argv[3]);
} else if (process.argv[2]) {
  const arg = path.resolve(process.argv[2]);
  if (fs.existsSync(path.join(arg, 'package.json'))) {
    sourceDir = arg;
  } else {
    backupBaseDir = arg;
  }
}

console.log('==========================================================');
console.log('  GRAFMEN.COM - PROCEDURA BEZPIECZNEGO BACKUPU PROJEKTU');
console.log('==========================================================');
console.log('Katalog źródłowy:        ', sourceDir);
console.log('Katalog docelowy bazowy: ', backupBaseDir);

// 2. Walidacja katalogu źródłowego
if (!fs.existsSync(path.join(sourceDir, 'package.json')) || !fs.existsSync(path.join(sourceDir, '.git'))) {
  console.error('\n[BŁĄD KRYTYCZNY] Wskazany katalog źródłowy nie jest poprawnym repozytorium projektu Grafmen!');
  process.exit(1);
}

// 3. Blokada zapisu wewnątrz katalogu źródłowego (zapobieganie pętli kopii w kopii)
const relToSource = path.relative(sourceDir, backupBaseDir);
if (!relToSource.startsWith('..') && !path.isAbsolute(relToSource)) {
  console.error('\n[BŁĄD BEZPIECZEŃSTWA] Katalog kopii nie może znajdować się wewnątrz katalogu źródłowego!');
  process.exit(1);
}

// 4. Utworzenie katalogu bazowego kopii, jeśli nie istnieje
if (!fs.existsSync(backupBaseDir)) {
  try {
    fs.mkdirSync(backupBaseDir, { recursive: true });
  } catch (err) {
    console.error(`\n[BŁĄD] Nie można utworzyć katalogu kopii: ${backupBaseDir}`, err.message);
    process.exit(1);
  }
}

// 5. Sprawdzenie dostępnego miejsca na dysku docelowym
try {
  const statfs = fs.statfsSync(backupBaseDir);
  const freeBytes = statfs.bavail * statfs.bsize;
  const freeMb = freeBytes / (1024 * 1024);
  const freeGb = freeBytes / (1024 * 1024 * 1024);
  console.log(`Dostępne wolne miejsce:   ${freeGb.toFixed(2)} GB (${Math.round(freeMb)} MB)`);

  const minRequiredMb = 500;
  if (freeMb < minRequiredMb) {
    console.error(`\n[BŁĄD PRZESTRZENI] Za mało wolnego miejsca na dysku docelowym! Wymagane min. ${minRequiredMb} MB, dostępne: ${Math.round(freeMb)} MB.`);
    process.exit(1);
  }
} catch (err) {
  console.warn('Ostrzeżenie: Nie udało się bezpośrednio odczytać wolnego miejsca przez statfs:', err.message);
}

// 6. Format daty i unikalny katalog dla bieżącej kopii
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
const backupDirName = `grafmen-backup-${timestamp}`;
const targetBackupDir = path.join(backupBaseDir, backupDirName);

fs.mkdirSync(targetBackupDir, { recursive: true });
console.log('Katalog bieżącej kopii:  ', targetBackupDir);

// 7. Odczyt stanu Git, gałęzi i środowiska
let gitBranch = 'unknown';
let gitCommit = 'unknown';
let gitStatusLines = [];
try {
  gitBranch = execSync('git branch --show-current', { cwd: sourceDir, encoding: 'utf-8' }).trim();
  gitCommit = execSync('git rev-parse HEAD', { cwd: sourceDir, encoding: 'utf-8' }).trim();
  const gitStatusRaw = execSync('git status --porcelain=v1', { cwd: sourceDir, encoding: 'utf-8' }).trim();
  if (gitStatusRaw) {
    gitStatusLines = gitStatusRaw.split('\n').map(l => l.trimEnd());
  }
} catch (err) {
  console.error('\n[BŁĄD] Nie można odczytać stanu Git:', err.message);
  process.exit(1);
}

const nodeVer = process.version;
let npmVer = 'unknown';
try {
  npmVer = execSync('npm -v', { cwd: sourceDir, encoding: 'utf-8' }).trim();
} catch (e) {
  // Ignoruj
}

console.log(`Bieżący stan Git:         gałąź [${gitBranch}], commit [${gitCommit.slice(0, 8)}]`);
console.log(`Zmiany niezatwierdzone:   ${gitStatusLines.length} plików`);

// 8. Wykrywanie potencjalnych plików wrażliwych / sekretów
const sensitivePatterns = ['.env', '.env.local', '.env.production', '.env.development'];
const foundSensitive = [];
for (const p of sensitivePatterns) {
  if (fs.existsSync(path.join(sourceDir, p))) {
    foundSensitive.push(p);
  }
}

if (foundSensitive.length > 0) {
  console.log(`\n⚠️  Wykryto pliki poufne w projekcie: ${foundSensitive.join(', ')}.`);
  console.log('   Zostają one bezwzględnie WYKLUCZONE ze standardowego archiwum.');
  console.log('   Wymagają one osobnego, zaszyfrowanego zabezpieczenia w sejfie haseł.');
}

// 9. Tworzenie Git Bundle (Pełna historia repozytorium Git)
console.log('\n[1/4] Tworzenie niezależnego Git Bundle (cała historia, tagi, branche)...');
const bundlePath = path.join(targetBackupDir, 'git-history.bundle');
try {
  execSync(`git bundle create "${bundlePath}" --all`, { cwd: sourceDir, stdio: 'inherit' });
} catch (err) {
  console.error('\n[BŁĄD KRYTYCZNY] Nie udało się utworzyć pliku git-history.bundle!', err.message);
  process.exit(1);
}

console.log('Weryfikacja spójności git bundle...');
try {
  execSync(`git bundle verify "${bundlePath}"`, { cwd: sourceDir, encoding: 'utf-8' });
  console.log('✓ Git bundle zweryfikowany pomyślnie.');
} catch (err) {
  console.error('\n[BŁĄD INTEGRALNOŚCI] Git bundle nie przeszedł weryfikacji spójności!', err.message);
  process.exit(1);
}

// 10. Archiwizacja aktualnych plików roboczych i szkiców (working-tree.tar.gz)
console.log('\n[2/4] Archiwizacja aktualnych plików roboczych, szkiców i zasobów (working-tree.tar.gz)...');
const archivePath = path.join(targetBackupDir, 'working-tree.tar.gz');

const excludeList = [
  'node_modules',
  '.astro',
  'dist',
  '.git',
  '.vercel',
  'scratch',
  'public/test-screenshots',
  'scripts/*.png',
  'scripts/visual-qa',
  '.env',
  '.env.*',
  '*.pem',
  '*.key'
];

const tarArgs = [
  'tar.exe',
  '-czf',
  `"${archivePath}"`,
  ...excludeList.map(e => `--exclude="${e}"`),
  '.'
].join(' ');

try {
  execSync(tarArgs, { cwd: sourceDir, stdio: 'inherit' });
} catch (err) {
  console.error('\n[BŁĄD KRYTYCZNY] Nie udało się utworzyć pliku working-tree.tar.gz!', err.message);
  process.exit(1);
}

if (!fs.existsSync(archivePath) || fs.statSync(archivePath).size === 0) {
  console.error('\n[BŁĄD] Plik working-tree.tar.gz nie istnieje lub ma 0 bajtów!');
  process.exit(1);
}

const bundleStats = fs.statSync(bundlePath);
const archiveStats = fs.statSync(archivePath);
console.log(`✓ working-tree.tar.gz utworzony pomyślnie (${(archiveStats.size / (1024 * 1024)).toFixed(2)} MB).`);

// 11. Sumy kontrolne SHA-256
console.log('\n[3/4] Obliczanie sum kontrolnych SHA-256...');
function getSha256(filePath) {
  const hash = crypto.createHash('sha256');
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest('hex');
}

const bundleHash = getSha256(bundlePath);
const archiveHash = getSha256(archivePath);

const checksumsText = `${bundleHash}  git-history.bundle\n${archiveHash}  working-tree.tar.gz\n`;
fs.writeFileSync(path.join(targetBackupDir, 'checksums.sha256'), checksumsText, 'utf-8');
console.log('✓ Sumy kontrolne SHA-256 zapisane w checksums.sha256.');

// 12. Generowanie manifestu JSON i dokumentu ODTWORZENIE.md
console.log('\n[4/4] Zapis manifestu i instrukcji odtworzenia...');

const manifest = {
  backup_id: backupDirName,
  created_at: now.toISOString(),
  local_time: now.toLocaleString('pl-PL'),
  source_directory: sourceDir,
  backup_directory: targetBackupDir,
  environment: {
    node_version: nodeVer,
    npm_version: npmVer,
    platform: process.platform,
    arch: process.arch
  },
  git: {
    branch: gitBranch,
    commit_sha: gitCommit,
    is_dirty: gitStatusLines.length > 0,
    uncommitted_files_count: gitStatusLines.length,
    uncommitted_files: gitStatusLines
  },
  sensitive_files_excluded: foundSensitive,
  exclusions: excludeList,
  artifacts: [
    {
      filename: 'git-history.bundle',
      description: 'Kompletna historia repozytorium Git (wszystkie branche, tagi i commit obiekty)',
      size_bytes: bundleStats.size,
      size_mb: parseFloat((bundleStats.size / (1024 * 1024)).toFixed(2)),
      sha256: bundleHash
    },
    {
      filename: 'working-tree.tar.gz',
      description: 'Bieżące pliki robocze: kod źródłowy, treści, szkice CMS, grafiki, wideo, fonty i konfiguracja',
      size_bytes: archiveStats.size,
      size_mb: parseFloat((archiveStats.size / (1024 * 1024)).toFixed(2)),
      sha256: archiveHash
    }
  ],
  external_services_info: {
    hosting: 'Vercel (projekt: grafmen-com, framework: Astro, build: npm run build, output: dist)',
    forms_processor: 'Web3Forms (klucz publiczny klienta w kodzie; konfiguracja e-mail w panelu web3forms.com)',
    domain_routing: 'grafmen.com / www.grafmen.com (obsługiwane w panelu Vercel; DNS u rejestratora)',
    dns_and_mail: 'Rekordy MX, SPF, DKIM i DMARC utrzymywane poza repozytorium u operatora DNS'
  },
  verification_status: 'VERIFIED_OK'
};

fs.writeFileSync(path.join(targetBackupDir, 'MANIFEST.json'), JSON.stringify(manifest, null, 2), 'utf-8');

const recoveryDoc = `# Instrukcja Odtworzenia Projektu Grafmen.com

Data sporządzenia kopii: ${now.toLocaleString('pl-PL')}
Identyfikator backupu: \`${backupDirName}\`
Commit bazowy Git: \`${gitCommit}\` (gałąź: \`${gitBranch}\`)

---

## 1. Wymagania Wstępne
* System operacyjny: Windows, macOS lub Linux
* Node.js: >= 22.12.0 (zalecana wersja z kopii: \`${nodeVer}\`)
* Menedżer pakietów: npm \`${npmVer}\`
* Git: wersja >= 2.30

---

## 2. Procedura Odtworzenia Krok po Kroku

### Krok 1: Weryfikacja Integralności Kopii
Przed rozpoczęciem upewnij się, że pliki nie uległy uszkodzeniu:
\`\`\`powershell
# Weryfikacja sum kontrolnych SHA-256:
Get-FileHash -Path git-history.bundle -Algorithm SHA256
# Oczekiwany hash: ${bundleHash}

Get-FileHash -Path working-tree.tar.gz -Algorithm SHA256
# Oczekiwany hash: ${archiveHash}
\`\`\`

### Krok 2: Przygotowanie Nowego Folderu i Odtworzenie Repozytorium Git
Utwórz nowy katalog docelowy i odtwórz historię Git z pliku bundle:
\`\`\`powershell
mkdir D:\\www\\grafmen-odtworzony
cd D:\\www\\grafmen-odtworzony

# Sklonowanie repozytorium z pliku bundle:
git clone "${bundlePath.replace(/\\/g, '/')}" .
git checkout ${gitBranch}
\`\`\`

### Krok 3: Nałożenie Bieżących Plików Roboczych i Szkiców
Archiwum \`working-tree.tar.gz\` zawiera pełny stan roboczy z momentu backupu (w tym niezacommitowane poprawki, nowe wpisy blogowe i lokalne szkice):
\`\`\`powershell
# Rozpakowanie archiwum bezpośrednio do katalogu projektu:
tar.exe -xzf "${archivePath.replace(/\\/g, '/')}" -C .
\`\`\`

### Krok 4: Czysta Instalacja Zależności
Zainstaluj zależności zgodnie z zablokowanymi wersjami w \`package-lock.json\`:
\`\`\`powershell
npm ci
\`\`\`

### Krok 5: Weryfikacja Kompilacji Produkcyjnej
Uruchom statyczny build witryny:
\`\`\`powershell
npm run build
\`\`\`
Powinieneś zobaczyć pomyślne wygenerowanie 69 podstron w katalogu \`dist/\` bez błędów.

### Krok 6: Uruchomienie Podglądu Lokalnego
* **Podgląd wersji produkcyjnej (dist):**
  \`npm run preview\` (lub dwuklik w \`podglad-dist.bat\`) -> http://localhost:4321/
* **Środowisko deweloperskie z panelem Keystatic CMS:**
  \`npm run dev\` -> http://localhost:4321/ oraz panel CMS pod adresem http://localhost:4321/keystatic/

---

## 3. Usługi Zewnętrzne i Konfiguracja Poza Repozytorium
W przypadku odtwarzania projektu w nowym środowisku pamiętaj o zewnętrznych konfiguracjach:
1. **Vercel:**
   - Framework: Astro
   - Build Command: \`npm run build\`
   - Output Directory: \`dist\`
   - Przypisanie domen: \`grafmen.com\` (główna) oraz \`www.grafmen.com\` (redirect 308).
2. **Formularze (Web3Forms):**
   - Klucz klienta znajduje się w kodzie (\`web3forms-client.js\`).
   - Adres docelowy e-mail i powiadomienia są skonfigurowane w panelu dostawcy.
3. **Poczta i DNS:**
   - Rekordy MX, SPF, DKIM i DMARC pozostają u rejestratora domeny.
`;

fs.writeFileSync(path.join(targetBackupDir, 'ODTWORZENIE.md'), recoveryDoc, 'utf-8');

console.log('\n==========================================================');
console.log('  KOPIA ZAPASOWA ZOSTAŁA POMYŚLNIE UTWORZONA I ZAPISANA');
console.log('==========================================================');
console.log('Katalog kopii:          ', targetBackupDir);
console.log('Rozmiar Git Bundle:     ', (bundleStats.size / (1024 * 1024)).toFixed(2), 'MB');
console.log('Rozmiar Working Archive:', (archiveStats.size / (1024 * 1024)).toFixed(2), 'MB');
console.log('Pliki towarzyszące:      MANIFEST.json, checksums.sha256, ODTWORZENIE.md');
console.log('Status:                 VERIFIED_OK');
console.log('==========================================================\n');
process.exit(0);
