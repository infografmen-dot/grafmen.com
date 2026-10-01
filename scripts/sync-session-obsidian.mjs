import fs from 'node:fs';
import path from 'node:path';

const now = new Date();
const dateStr = '2026-10-01';
const timeStr = '21:16';

const summaryText = `
## [Podsumowanie Sesji] Grafmen.com: Aktualizacja case study i galerii Drew-Art oraz optymalizacje kart portfolio

- **Data i godzina:** ${dateStr} ${timeStr}
- **Projekt:** Grafmen.com (\`d:\\www\\grafmen\\aero\`)
- **Status publikacji:** Praca lokalna (zgodnie z regułą Local-Only Work Rule, bez pusha i bez publikacji Vercel).
- **Zrealizowane zadania:**
  1. **Rozszerzenie galerii projektu Katalog Drew-Art (\`/portfolio/katalog-drew-art/\`):**
     - Dodano 2 nowe rozkładówki przekazane przez użytkownika:
       - \`Mockup_Brochure_21x21_3.webp\` (strony 6–7: zamiatacze i zmiotki),
       - \`Mockup_Brochure_21x21_5.webp\` (strony 16–17: szczotki do obuwia i ubrań).
     - Zoptymalizowano obrazy do WebP (jakość 90) oraz wygenerowano responsywne warianty (\`360w\`, \`480w\`, \`800w\`, \`1024w\`) w \`image-manifest.json\`.
     - Galeria powiększona z 2 do 4 pełnych rozkładówek.
  2. **Aktualizacja treści i korekty case study Katalog Drew-Art:**
     - W sekcji *Zakres* usunięto pozycję: *„Wizualizacje 3D katalogu do prezentacji w materiałach cyfrowych.”*
     - W podpisie pod 4. zdjęciem w galerii skrócono podpis do: *„Wizualizacja produktów.”* (usunięto *„w naturalnym otoczeniu”*).
     - W sekcji *Rezultat* zaktualizowano tekst na: *„Przygotowano wielostronicowy katalog produktowy w formacie kwadratowym, porządkujący asortyment zmiotek i zamiataczy.”* (zamiast mebli drewnianych).
     - Zsynchronizowano zmiany w wersji polskiej (\`src/content/portfolio/katalog-drew-art.json\`, \`content/portfolio/katalog-drew-art.json\`) oraz angielskiej (\`src/data/i18n/portfolio-en.ts\`).
  3. **Weryfikacja zdjęcia okładkowego:**
     - Zgodnie z dyspozycją użytkownika przywrócono oryginalny kadr i format okładki katalogu (\`Mockup_Brochure_21x21_1.webp\`, 1750×1750 px).
  4. **Wcześniejsze ustalenia sesji:**
     - Zamiana miejsc kart w siatce portfolio: Hiker na pozycji 03 (po lewej, duża), szkola.best na pozycji 04 (po prawej, mniejsza) – zachowano na stronie głównej i w \`/portfolio/\` (PL i EN).
     - Aktualizacja tekstów dla projektu strony WWW Drew-Art (producent szczotek i akcesoriów do sprzątania).
     - Płynny szklany panel banera cookies na wzór szkola.best.
  5. **Weryfikacja jakościowa:**
     - \`npm run build\` zakończony sukcesem (69 stron zbudowanych bez błędów).
     - Testy i zrzuty ekranu w headless Chrome potwierdziły poprawność układu i typografii.
`;

// 1. Daily Note
const dailyDir = 'H:\\ai\\2Brain\\daily';
const dailyPath = path.join(dailyDir, `${dateStr}.md`);

if (!fs.existsSync(dailyDir)) {
  fs.mkdirSync(dailyDir, { recursive: true });
}

if (!fs.existsSync(dailyPath)) {
  fs.writeFileSync(dailyPath, `# Notatka dzienna ${dateStr}\n\n`, 'utf8');
}

fs.appendFileSync(dailyPath, summaryText, 'utf8');
console.log('✅ Zapisano podsumowanie do Daily Note:', dailyPath);

// 2. Core Projects
const projectsPath = 'H:\\ai\\2Brain\\core\\projects.md';
if (fs.existsSync(projectsPath)) {
  let content = fs.readFileSync(projectsPath, 'utf8');
  const projectMarker = '## Projekt: Grafmen.com';
  const entry = `
- **Aktualizacja (${dateStr} ${timeStr})**: Dodano nowe rozkładówki do case study Katalog Drew-Art (zamiatacze, szczotki do ubrań), zaktualizowano zakres i teksty (usunięto wizualizacje 3D, doprecyzowano asortyment zamiataczy i zmiotek, przywrócono oryginalny kadr okładki). Build 69 stron OK.
`;
  const idx = content.indexOf(projectMarker);
  if (idx !== -1) {
    const pos = idx + projectMarker.length;
    content = content.slice(0, pos) + entry + content.slice(pos);
    fs.writeFileSync(projectsPath, content, 'utf8');
    console.log('✅ Zaktualizowano core/projects.md');
  }
}

// 3. Log
const logPath = 'H:\\ai\\2Brain\\log.md';
if (fs.existsSync(logPath)) {
  const logLine = `- [${dateStr} ${timeStr}] **Grafmen.com**: Aktualizacja case study Katalog Drew-Art (nowe rozkładówki WebP w galerii, korekty tekstowe w zakresie i rezultacie, przywrócenie oryginalnej okładki, zamiana kart Hiker/BEST, build 69 stron PASS).\n`;
  fs.appendFileSync(logPath, logLine, 'utf8');
  console.log('✅ Zaktualizowano log.md');
}
