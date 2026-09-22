import fs from 'node:fs';

const now = '2026-09-22 13:48';

// 1. DAILY NOTE
const dailyPath = 'H:\\ai\\2Brain\\daily\\2026-09-22.md';
const dailyEntry = `
### Grafmen (grafmen.com) - Potwierdzenie wdrożenia wariantów obrazów (srcset/sizes), menu 17 px i obszarów dotykowych 44 px

- **Data i godzina:** ${now}
- **Repozytorium:** https://github.com/infografmen-dot/grafmen.com
- **Commit:** \`2a57f8b\` (*feat(perf): add responsive srcset/sizes WebP variants, 17px menu and 44px touch targets*)
- **Podgląd Vercel Live:** https://grafmen-com.vercel.app/
- **Pomiary i weryfikacja w realnej przeglądarce Chrome:**
  1. **Menu desktopowe ujednolicone do 17 px:**
     - Selektor: \`header nav a\`
     - Rozmiar fontu: dokładnie **17px** (\`font-size: 17px; font-weight: 500\`).
     - Wysokość touch targetu: **49px** (\`min-height: 44px; padding: 14px 6px; display: inline-flex; align-items: center\`).
  2. **Obszary dotykowe powiększone do co najmniej 44 × 44 px:**
     - Przełącznik językowy PL / EN: dokładnie **44 × 44 px** (\`min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px\`).
     - Hamburger mobilny (\`.menu-toggle\`): **46 × 48 px** (\`min-width: 44px; min-height: 44px\`).
     - Linki w rozwiniętym menu mobilnym: **308 × 52 px** (\`min-height: 52px\`).
     - Przycisk Wycena (\`.quote\`): **135 × 52 px**.
     - Przycisk powrotu na górę (\`.back-to-top\`): **46 × 46 px**.
  3. **Warianty WebP, srcset i sizes dla portfolio:**
     - Skrypt generatora: \`scripts/generate-responsive-variants.mjs\` z biblioteką \`sharp\`.
     - Wygenerowano warianty: \`480w\`, \`800w\`, \`1200w\` w formacie WebP dla wszystkich 56 unikalnych grafik portfolio w \`public/assets/portfolio/...\`.
     - Logika szablonu \`src/pages/portfolio/[slug].astro\`: funkcja \`getSrcSet()\` weryfikuje fizyczną obecność każdego pliku wariantu na dysku (\`fs.existsSync\`), koduje bezpiecznie spacje w URL (\`encodeURI\`) i dodaje atrybuty \`srcset\` i \`sizes\`.
     - Zdjęcie główne (cover): \`fetchpriority="high"\`, \`decoding="async"\`, **brak lazy loadingu** (ochrona LCP).
     - Galeria: \`loading="lazy"\`, \`decoding="async"\`.
     - Test wyboru wariantu w Chrome na mobile (390 px): przeglądarka automatycznie pobiera wariant **800w** (32 KB) zamiast oryginału (2415 KB) – **redukcja wagi o 99%**.
  4. **Pionowe realizacje:**
     - Drew-Art, Ja i mój biznes, Katalog Uni-Trans: \`.gallery-item-vertical\` z \`max-width: 640px; margin-inline: auto;\`.
`;

if (fs.existsSync(dailyPath)) {
  fs.appendFileSync(dailyPath, dailyEntry, 'utf8');
  console.log('✅ Zaktualizowano daily note:', dailyPath);
}

// 2. PROJECTS.MD
const projectsPath = 'H:\\ai\\2Brain\\core\\projects.md';
if (fs.existsSync(projectsPath)) {
  let content = fs.readFileSync(projectsPath, 'utf8');
  const projectUpdate = `
- **Aktualizacja (${now})**: **Potwierdzenie wdrożenia wariantów obrazów (srcset/sizes), menu 17 px i obszarów dotykowych 44 px**.
  - **Ujednolicenie menu desktopowego**: \`header nav a\` ma dokładnie 17px (\`font-size: 17px\`) oraz touch target 49px wysokości (\`min-height: 44px; padding: 14px 6px\`).
  - **Powiększenie touch targets**: Przyciski językowe PL / EN mają dokładnie 44 × 44 px. Przycisk hamburgera mobilnego ma 46 × 48 px. Linki menu mobilnego mają 52px wysokości.
  - **Warianty WebP i srcset/sizes**: Wygenerowano warianty 480w, 800w, 1200w WebP dla 56 grafik. Dodano bezpieczną funkcję \`getSrcSet\` sprawdzającą istnienie plików i kodującą spacje. Okładka ma \`fetchpriority="high"\` bez lazy load, galeria ma \`loading="lazy"\`.
  - **Stan repozytorium**: Commit \`2a57f8b\` na gałęzi \`main\` wypchnięty do GitHub. Vercel live: https://grafmen-com.vercel.app/ zaktualizowany i w 100% potwierdzony.
`;
  // Wstawiamy przed nagłówkiem projektu lub na początku sekcji Grafmen
  const idx = content.indexOf('## Projekt: Grafmen.com');
  if (idx !== -1) {
    const afterHeader = idx + '## Projekt: Grafmen.com'.length;
    content = content.slice(0, afterHeader) + projectUpdate + content.slice(afterHeader);
    fs.writeFileSync(projectsPath, content, 'utf8');
    console.log('✅ Zaktualizowano core/projects.md');
  }
}

// 3. LOG.MD
const logPath = 'H:\\ai\\2Brain\\log.md';
if (fs.existsSync(logPath)) {
  const logEntry = `- [${now}] **Grafmen.com**: Potwierdzenie i wdrożenie mniejszych wariantów obrazów (WebP 480w, 800w, 1200w z srcset/sizes), ujednolicenie menu do 17 px oraz powiększenie obszarów dotykowych do min. 44 × 44 px (PL/EN 44x44px, hamburger 46x48px). Commit \`2a57f8b\` wypchnięty do origin/main, Vercel live zweryfikowany w Chrome Playwright.\n`;
  fs.appendFileSync(logPath, logEntry, 'utf8');
  console.log('✅ Zaktualizowano log.md');
}
