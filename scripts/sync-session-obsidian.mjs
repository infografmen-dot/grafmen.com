import fs from 'node:fs';
import path from 'node:path';

const dateStr = '2026-10-05';
const timeStr = '20:10';

const summaryText = `
## [Podsumowanie Sesji] Grafmen.com: Naprawa pierwszego renderu Hero H1 (eliminacja FOUC) oraz uzupełnienie oferty o social media i banery HTML5

- **Data i godzina:** ${dateStr} ${timeStr}
- **Projekt:** Grafmen.com (\`d:\\www\\grafmen\\aero\`)
- **Status publikacji:** Praca lokalna przetestowana w 100%. Gotowe do wysyłki na GitHub.
- **Zrealizowane zadania:**
  1. **Eliminacja flashu widocznego tekstu H1 przy pierwszym renderze (Hero Entrance Wipe Reveal):**
     - Zdiagnozowano przyczynę: \`.hero-line-inner\` w domyślnym CSS miało \`opacity: 1\`, przez co przed załadowaniem GSAP i fontów (do 350ms) H1 był w pełni widoczny, po czym gwałtownie znikał przed rozpoczęciem animacji.
     - Wprowadzono stan początkowy w CSS: \`html.js:not(.hero-motion-done) .hero .hero-line-inner { opacity: 0; }\`.
     - W \`src/layouts/BaseLayout.astro\` dodano synchroniczny inline script dodający klasę \`js\` przed pierwszym paintem oraz fallback \`<noscript>\` wymuszający \`opacity: 1 !important\`.
     - W \`grafmen-motion.js\` (\`public/\` i root) zsynchronizowano dodawanie klasy \`hero-motion-done\` z zakończeniem osi czasu GSAP (\`onComplete\`), watchdogiem failsafe (2.2s), \`prefers-reduced-motion\` oraz \`pageshow\` dla pamięci podręcznej przeglądarki (bfcache).
     - Przeprowadzono testy klatka po klatce w Playwright (0ms, 50ms, 300ms, 650ms, 1800ms) – potwierdzono całkowity brak flashu, prawidłowy start wipe reveal, wzorcowe działanie na mobile oraz fallbacki.
  2. **Korekta i uzupełnienie komunikacji usług (social media, banery HTML5):**
     - **Homepage Hero (PL i EN):** dopisano grafiki reklamowe i social media, sformatowano akapit w dokładnie dwa wiersze na desktopie.
     - **Sekcja Współpraca / Collaboration (PL i EN):** doprecyzowano zakres od grafik social media po banery HTML5, druk, animacje i wideo.
     - **Podstrona Branding (PL i EN):** zaktualizowano kafel 02 (grafika reklamowa, social media i druk) oraz nagłówek kafla 03 (motion, wideo i banery HTML5).
  3. **Weryfikacja jakościowa:**
     - Zbudowano 69 podstron statycznych (\`npm run build\`) bez żadnych błędów.
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
- **Aktualizacja (${dateStr} ${timeStr})**: Naprawiono pierwszy render animacji Hero H1 (eliminacja FOUC/flashu tekstu przed startem GSAP wipe reveal za pomocą stanu początkowego w CSS i inline JS tagu, pełny fallback No-JS i reduced-motion, testy klatka po klatce Playwright PASS). Uzupełniono treści o grafiki social media i banery HTML5 (PL i EN w 2 wierszach). Build 69 stron OK.
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
  const logLine = `- [${dateStr} ${timeStr}] **Grafmen.com**: Naprawa renderu animacji Hero H1 (brak FOUC przed GSAP wipe reveal, fallback No-JS/reduced-motion), uzupełnienie oferty o social media i banery HTML5 w PL i EN, weryfikacja Playwright, build 69 stron PASS.\n`;
  fs.appendFileSync(logPath, logLine, 'utf8');
  console.log('✅ Zaktualizowano log.md');
}
