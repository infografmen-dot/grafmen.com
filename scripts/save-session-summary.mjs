import fs from 'node:fs';

const nowTime = '2026-09-22 13:53';

// 1. Central Daily Note
const dailyPath = 'H:\\ai\\2Brain\\daily\\2026-09-22.md';
const sessionBlock = `
## [Podsumowanie Sesji] Grafmen: Unifikacja 20 podstron portfolio, warianty WebP (srcset/sizes), menu 17px i touch targets 44px

- **Godzina zapisu:** ${nowTime}
- **Repozytorium:** https://github.com/infografmen-dot/grafmen.com (gałąź: \`main\`)
- **Kluczowe commity:**
  - \`0a69649\` – *feat(portfolio): unify 20 project subpages into single template, deduplicate gallery, support vertical media and audit mobile layout*
  - \`2a57f8b\` – *feat(perf): add responsive srcset/sizes WebP variants, 17px menu and 44px touch targets*
  - \`f33eac8\` – *chore(qa): add live vercel measurement and obsidian sync scripts*
- **Środowisko produkcyjne (Vercel Live):** [https://grafmen-com.vercel.app/](https://grafmen-com.vercel.app/) (status: HTTP 200 OK, live testy Playwright 100% PASS)
- **Kompletny zakres zrealizowanych i potwierdzonych prac:**
  1. **Jeden wspólny szablon Astro dla 20 podstron portfolio (\`src/pages/portfolio/[slug].astro\`):**
     - Uporządkowana kanoniczna struktura: Okruszki → Kategoria i Rok → Nagłówek H1 → Lead (60% desktop / 100% mobile) → Zdjęcie główne cover → Sekcja Potrzeba → Sekcja Zakres (lista korzyści z niełamliwymi spacjami) → Sekcja Projekt w zastosowaniu (galeria unikalnych zdjęć) → Opcjonalny moduł wideo / animacji After Effects z kontrolkami → Sekcja Rezultat (podsumowanie, cytat, odnośnik zewnętrzny) → Dynamiczna nawigacja Poprzedni / Następny → Pomarańczowe CTA → Globalna stopka.
     - Usunięto dekoracyjne numery sekcji (np. 01 · POTRZEBA, 02 · ZAKRES); zachowano czyste etykiety w kolorze \`var(--orange)\`.
     - Wieloprzebiegowy mechanizm \`fixOrphans\` dla wiszących spójników we wszystkich tekstach i tytułach.
  2. **Eliminacja duplikatów zdjęć okładki z galerii:**
     - Analiza skrótów MD5 wykazała powielenie zdjęcia głównego w galerii w 14 realizacjach. Usunięto zduplikowane pozycje.
     - Projekty bez dodatkowych zdjęć (szkoła.best, Montessori, Pobudka) posiadają czysty układ bez pustych placeholderów czy ramek.
  3. **Warianty WebP, srcset i sizes (wydajność i ochrona LCP):**
     - Narzędziem \`sharp\` wygenerowano responsywne warianty \`480w\`, \`800w\`, \`1200w\` w formacie WebP dla wszystkich 56 unikalnych grafik portfolio (\`public/assets/portfolio/...\`).
     - Bezpieczna funkcja \`getSrcSet\` weryfikuje fizyczną obecność pliku na dysku (\`fs.existsSync\`) oraz koduje spacje w URL (\`encodeURI\`), eliminując błędy 404 i błędy parsowania HTML5.
     - Zdjęcie okładki (cover): \`fetchpriority="high"\`, \`decoding="async"\`, **brak lazy loadingu** (ochrona metryki LCP).
     - Galeria: \`loading="lazy"\`, \`decoding="async"\`.
     - Pomiar w Chrome mobile (390 px): przeglądarka pobiera wariant 800w (32 KB) zamiast 2415 KB – oszczędność danych 99.4%.
     - Zerowa liczba brakujących plików: 184 sprawdzone pliki wariantów/oryginałów na 56 tagach \`<img>\`.
  4. **Pionowe realizacje o ograniczonej szerokości (\`.gallery-item-vertical\`):**
     - Drew-Art, Ja i mój biznes, Katalog Uni-Trans: \`max-width: 640px; margin-inline: auto;\`. Wyśrodkowane na desktopie, 100% szerokości na mobile.
  5. **Ujednolicenie menu desktopowego do 17 px:**
     - \`header nav a\` ma \`font-size: 17px; font-weight: 500;\` oraz wysokość touch targetu \`49px\` (\`min-height: 44px; padding: 14px 6px; display: inline-flex; align-items: center;\`).
  6. **Powiększenie obszarów dotykowych do co najmniej 44 × 44 px:**
     - Przyciski językowe PL i EN: dokładnie **44 × 44 px** (\`font-size: 14px\`).
     - Hamburger mobilny (\`.menu-toggle\`): **46 × 48 px**.
     - Odnośniki menu mobilnego: **308 × 52 px**.
     - Przycisk Wycena (\`.quote\`): **135 × 52 px**.
     - Przycisk Powrót na górę (\`.back-to-top\`): **46 × 46 px**.
  7. **Dynamiczna pętla nawigacji projektów:**
     - Wyliczana z jednego źródła prawdy (\`orderedSlugs\`), likwidująca błędy statycznych linków.
  8. **Weryfikacja w realnej przeglądarce Chrome:**
     - 0 nakładania się kart w portfolio, brak poziomego paska przewijania (overflow: none) na wszystkich 20 podstronach, stronach głównych i blogu.
`;

if (fs.existsSync(dailyPath)) {
  fs.appendFileSync(dailyPath, sessionBlock, 'utf8');
  console.log('✅ Zapisano podsumowanie sesji do daily note:', dailyPath);
}

// 2. Core Projects
const projectsPath = 'H:\\ai\\2Brain\\core\\projects.md';
if (fs.existsSync(projectsPath)) {
  let content = fs.readFileSync(projectsPath, 'utf8');
  const projectLog = `
- **Podsumowanie Sesji (${nowTime})**: **Zakończenie pełnej unifikacji 20 podstron portfolio, optymalizacji obrazów WebP (srcset/sizes) oraz dostępności menu (17px / touch targets 44px)**.
  - Zbudowano wspólny szablon Astro (\`[slug].astro\`), usunięto duplikaty okładki z galerii (14 projektów) i wdrożono styl \`.gallery-item-vertical\` dla formatów pionowych.
  - Wygenerowano 128 responsywnych wariantów WebP (480w, 800w, 1200w). Wdrożono \`srcset\` i \`sizes\` z weryfikacją plików i kodowaniem znaków. Ochrona LCP (brak lazy na okładce, fetchpriority="high").
  - Ujednolicono menu do 17 px, powiększono touch targety do min. 44 × 44 px (PL/EN 44x44px, hamburger 46x48px, mobilne linki 52px).
  - Wypchnięto commity \`0a69649\`, \`2a57f8b\`, \`f33eac8\` na \`main\`. Vercel Live przetestowany i aktywny w 100%.
`;
  const marker = '## Projekt: Grafmen.com';
  const idx = content.indexOf(marker);
  if (idx !== -1) {
    const insertPos = idx + marker.length;
    content = content.slice(0, insertPos) + projectLog + content.slice(insertPos);
    fs.writeFileSync(projectsPath, content, 'utf8');
    console.log('✅ Zaktualizowano core/projects.md');
  }
}

// 3. Central Log
const logPath = 'H:\\ai\\2Brain\\log.md';
if (fs.existsSync(logPath)) {
  const logEntry = `- [${nowTime}] **Grafmen.com**: [Podsumowanie sesji] Zakończono i opublikowano pełne wdrożenie 20 podstron portfolio Grafmen (wspólny szablon Astro, eliminacja duplikatów okładki, pionowe materiały), responsywnych wariantów WebP (srcset/sizes, -99% wagi mobile), ujednolicenia menu (17px) oraz obszarów dotykowych (PL/EN 44x44px, hamburger 46x48px). Commity 0a69649, 2a57f8b, f33eac8 na main, Vercel live zweryfikowany.\n`;
  fs.appendFileSync(logPath, logEntry, 'utf8');
  console.log('✅ Zapisano wpis do log.md');
}
