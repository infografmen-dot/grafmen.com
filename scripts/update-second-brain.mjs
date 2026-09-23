import fs from 'node:fs';

const now = '2026-09-23 15:55';
const todayDate = '2026-09-23';

// 1. DAILY NOTE: H:\ai\2Brain\daily\2026-09-23.md
const dailyDir = 'H:\\ai\\2Brain\\daily';
const dailyPath = `${dailyDir}\\${todayDate}.md`;

const dailyEntry = `
### Grafmen (grafmen.com) - Wdrożenie 2. i 3. rundy mikroanimacji oraz optymalizacji UI

- **Data i godzina:** ${now}
- **Repozytorium:** https://github.com/infografmen-dot/grafmen.com
- **Commity:**
  - \`a28ac35\` (*feat(motion): runda 2 mikroanimacji - kickery, podpisy portfolio, scroll indicator, hover kart, glow menu i animacja hamburgera*)
  - \`85dd879\` (*feat(ui): runda 3 - 3D flip glow menu, mobilny hero H1 44.5px, dolny pasek 176px, łamanie nagłówka o-mnie i mask reveal podpisów*)
- **Podgląd produkcyjny:** https://grafmen-com.vercel.app/
- **Zakres zrealizowanych prac:**
  1. **Górne menu (3D Roll/Flip Glow-Menu wg referencji 21st.dev):**
     - Odtworzono trójwymiarowy obrót tekstu (\`perspective: 600px\`) z warstwami \`.nav-flip-front\` i \`.nav-flip-back\` (\`aria-hidden="true"\`).
     - Warstwa wyjściowa obraca się w górę (\`rotateX(-90deg)\`), a z góry opuszcza się pomarańczowy napis (\`rotateX(90deg) -> 0deg\`, kolor \`#ff6400\`) z ciepłym rozświetleniem (\`0.38s cubic-bezier(0.2, 0.8, 0.2, 1)\`).
     - Aktywna podstrona w spoczynku wyróżniona czytelnym szarym tekstem (\`#6c7078\`) i kreską pod spodem (\`aria-current="page"\`). Na hover przechodzi w pomarańcz, po zjechaniu kursora płynnie wraca do szarości.
     - Pełna integracja z przełącznikiem języka PL/EN bez ucinania struktury i bez zmiany szerokości linków.
  2. **Mobilne Hero (H1 powiększony o 20%):**
     - Na telefonach (\`max-width: 600px\`) zmieniono rozmiar nagłówka H1 na \`clamp(38px, 11.4vw, 50px)\`, co przy 390 px daje dokładnie **44.46 px** (wzrost z 37.05 px).
     - Interlinia została rozluźniona z 0.94 do **1.05** (46.7 px), zapewniając pełną czytelność dolnych wydłużeń liter („j”, „y”) i podkreślenia \`.uword\`.
     - Zero przepełnienia poziomego (\`scrollWidth: 390 px\`, brak overflow).
  3. **Dolny czarny pasek menu (węższy o 20%):**
     - Szerokość zamkniętej kapsułki zmieniono z 220 px na **176 px** (\`--fg-capsule-closed-w: 176px\`).
     - Zachowano wysokość 48 px oraz obszary dotykowe \`HOME\` i \`Toggle\` (min. 44 × 44 px).
     - Odstęp od strzałki powrotu (\`.back-to-top\`): na 390 px wynosi aż **47 px**, a na najwęższym ekranie 320 px gwarantowane **12 px** (pełna ochrona przed kolizją).
  4. **„O mnie” – kontrolowane łamanie nagłówka:**
     - Dodano klasę \`.mob-block\` wokół słowa *„Współpraca,”*, dzięki czemu na telefonach nagłówek przełamuje się w dwóch wierszach (*Współpraca, / która trwa od lat.*), a na desktopie pozostaje w jednym wierszu.
  5. **Mikroanimacje – etykiety i podpisy realizacji:**
     - Pomarańczowe etykiety sekcji: maskowanie \`clip-path\` przeniesiono z szerokiego bloku na warstwę tekstu \`.kicker-inner\` (164 px), co eliminuje martwy czas animacji na pustej przestrzeni (\`0.65s\`, \`x: -18px -> 0\`, próg \`top 82%\`).
     - Podpisy realizacji: dodano wierszowe odsłanianie tytułów przez maskę \`overflow: hidden\` (\`y: 22px -> 0\`, \`0.75s\`) oraz blokowe wejście opisów i linków z niezależnym triggerem na \`.caption\`.
  6. **Menu mobilne i hover kart:**
     - Płynna metamorfoza 3 linii hamburgera w krzyżyk \`X\` (0.3s) i z powrotem z obsługą Escape i blokadą scrolla.
     - Uniesienie o 4 px z miękkim cieniem na kartach opinii, pakietów i procesu na „O mnie” z wyłączeniem na urządzeniach dotykowych (\`@media (hover: none)\`).
`;

if (!fs.existsSync(dailyDir)) {
  fs.mkdirSync(dailyDir, { recursive: true });
}

if (fs.existsSync(dailyPath)) {
  fs.appendFileSync(dailyPath, dailyEntry, 'utf8');
  console.log('✅ Zaktualizowano daily note:', dailyPath);
} else {
  fs.writeFileSync(dailyPath, `# Notatka dzienna - ${todayDate}\n${dailyEntry}`, 'utf8');
  console.log('✅ Utworzono i zapisano daily note:', dailyPath);
}

// 2. PROJECTS.MD: H:\ai\2Brain\core\projects.md
const projectsPath = 'H:\\ai\\2Brain\\core\\projects.md';
if (fs.existsSync(projectsPath)) {
  let content = fs.readFileSync(projectsPath, 'utf8');
  const projectUpdate = `
- **Aktualizacja (${now})**: **Wdrożenie 2. i 3. rundy mikroanimacji oraz optymalizacji UI (Glow 3D Roll/Flip Menu, H1 44.5px, dolny pasek 176px, łamanie nagłówka o-mnie, mask reveal etykiet i podpisów)**.
  - **Górne menu**: Odtworzono ruch 3D roll/flip z perspektywą 600px i obrotem rotateX, pomarańczowy glow oraz stabilny szary stan aktywny (#6c7078) z priorytetem hover.
  - **Mobilne Hero**: Zwiększono rozmiar H1 na telefonach o 20% do 44.5px z luźniejszą interlinią 1.05 (46.7px), 0px overflow.
  - **Dolny pasek menu**: Zwężono zamkniętą kapsułkę do 176px, gwarantując min. 12px odstępu od powrotu na górę na 320px i 47px na 390px przy touch targetach min. 44x44px.
  - **„O mnie”**: Dodano kontrolowany podział nagłówka po przecinku na mobile (.mob-block).
  - **Mikroanimacje**: Maskowanie etykiet zawężone do tekstu (.kicker-inner, 164px), odsłanianie wierszami tytułów realizacji portfolio (mask reveal y: 22px -> 0, 0.75s, próg top 82%).
  - **Stan repozytorium**: Zmiany zatwierdzone i wypchnięte do GitHub (\`origin/main\`, commity \`a28ac35\` i \`85dd879\`).
`;
  const idx = content.indexOf('## Projekt: Grafmen.com');
  if (idx !== -1) {
    const afterHeader = idx + '## Projekt: Grafmen.com'.length;
    content = content.slice(0, afterHeader) + projectUpdate + content.slice(afterHeader);
    fs.writeFileSync(projectsPath, content, 'utf8');
    console.log('✅ Zaktualizowano core/projects.md');
  } else {
    content = `# Projekty\n\n## Projekt: Grafmen.com\n${projectUpdate}\n` + content;
    fs.writeFileSync(projectsPath, content, 'utf8');
    console.log('✅ Utworzono wpis w core/projects.md');
  }
} else {
  console.warn('⚠️ Nie znaleziono pliku core/projects.md pod ścieżką:', projectsPath);
}

// 3. LOG.MD: H:\ai\2Brain\log.md
const logPath = 'H:\\ai\\2Brain\\log.md';
if (fs.existsSync(logPath)) {
  const logEntry = `- [${now}] **Grafmen.com**: Wdrożenie 2. i 3. rundy mikroanimacji oraz poprawek UI (3D flip glow menu, mobilny H1 44.5px, dolny pasek 176px, łamanie nagłówka o-mnie, mask reveal etykiet i podpisów portfolio). Commity \`a28ac35\` i \`85dd879\` na origin/main.\n`;
  fs.appendFileSync(logPath, logEntry, 'utf8');
  console.log('✅ Zaktualizowano log.md');
} else {
  console.warn('⚠️ Nie znaleziono pliku log.md pod ścieżką:', logPath);
}
