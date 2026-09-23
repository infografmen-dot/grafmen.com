import fs from 'node:fs';

const now = '2026-09-23 22:45';
const todayDate = '2026-09-23';

// 1. DAILY NOTE
const dailyPath = `H:\\ai\\2Brain\\daily\\${todayDate}.md`;
const dailySummary = `
---

## [[projects/grafmen/GEMINI_SYSTEM_INSTRUCTION|Grafmen.com]] – Podsumowanie sprintu mikroanimacji F3 i detali UI (20:30–22:45)

- **Godzina zamknięcia:** ${now}
- **Gałąź:** \`main\` | **Status wdrożenia Vercel:** success ✅
- **Commity:**
  - \`6b22fc9\` (*fix: remove duplicate Kontakt nav link; make swoja orange in hero*)
  - \`61b84b5\` (*feat: F3 animation global – remove homepage guard, fix clipping, add subpage selectors*)
  - \`30d11e9\` (*fix: exclude .f3-link from legacy translateX hover rules – resolve F3 animation conflicts*)
  - \`4843b72\` (*fix(motion): fix dark card hover color to white, extend F3 wave animation to portfolio, kontakt, blog and modernizacja panel*)
- **Podgląd live:** https://grafmen-com.vercel.app/

### Kompletny bilans wdrożonych usprawnień:
1. **Globalna unifikacja animacji fali liter F3:**
   - Usunięto ograniczenie do homepage (\`body.home-page\`). Ten sam sprawdzony wzorzec przewijania liter (kierunek w dół/górę, tempo, cubic-bezier i kaskada) działa spójnie na stronie głównej oraz na wszystkich podstronach (\`/strony-www/\`, \`/branding/\`, \`/portfolio/\`, \`/blog/\`, \`/kontakt/\`).
   - Usunięto przycinanie tekstu i grotów strzałek na mobile i desktopie dzięki elastycznemu układowi i prawidłowemu maskowaniu.
   - Odseparowano animowane elementy od przestarzałych reguł \`transform: translateX(4px)\` za pomocą wykluczenia \`:not(.f3-link)\`.
2. **Korekta kontrastu na ciemnych tłach:**
   - Na wyróżnionych czarnych kartach pakietów (\`.package-featured\`) litery podczas hovera przewijają się do czystej bieli (\`--f3-shadow: #ffffff\`), eliminując problem niewidocznego tekstu.
3. **Rozszerzenie zasięgu animacji:**
   - Linki zewnętrzne portfolio (Drew-Art, Drewmax.pro, szkoła.best itd.) w siatce i case studies,
   - Przycisk wysyłki briefu \`Wyślij e-mail ↗\` w sekcji \`/kontakt/\`,
   - Linki artykułów blogowych \`Czytaj artykuł →\` (\`.blog-featured-link\`, \`.blog-card-link\`),
   - Przycisk \`Zobacz modernizację stron →\` w panelu modernizacji,
   - Wszystkie linki tekstowe \`.text-link\` w sekcjach \`/branding/\` i \`/o-mnie/\`.
4. **Nawigacja i Hero:**
   - Usunięto zdublowaną pozycję „Kontakt” w menu nagłówka (pozostawiając wyłącznie dedykowany przycisk CTA po prawej stronie).
   - Wprowadzono próbny akcent typograficzny: słowo „swoją” w nagłówku Hero w kolorze pomarańczowym (\`#ff6400\`).
5. **Weryfikacja jakościowa:**
   - 100% testów automatycznych Playwright przeszło pomyślnie (detekcja strzałek, kontrast, brak zduplikowanych elementów w DOM).
   - Czyste drzewo Gita, wdrożenie live na Vercelu aktywne i zweryfikowane.

#daily #grafmen #astro #motion #css #f3-wave
`;

if (fs.existsSync(dailyPath)) {
  fs.appendFileSync(dailyPath, dailySummary, 'utf8');
  console.log('✅ Zaktualizowano daily note:', dailyPath);
} else {
  fs.writeFileSync(dailyPath, '# Notatka dzienna - ' + todayDate + '\n' + dailySummary, 'utf8');
  console.log('✅ Utworzono daily note:', dailyPath);
}

// 2. CORE PROJECTS
const projectsPath = 'H:\\ai\\2Brain\\core\\projects.md';
if (fs.existsSync(projectsPath)) {
  let content = fs.readFileSync(projectsPath, 'utf8');
  const projectUpdate = `
- **Aktualizacja (${now})**: **Wdrożenie globalnego systemu mikroanimacji fali liter F3, poprawki kontrastu i detali UI**.
  - **Globalny F3 Hover**: Objęto animacją fali liter wszystkie podstrony serwisu (portfolio, kontakt, blog, branding, o-mnie, pakiety i panel modernizacji) z usunięciem ograniczenia do homepage.
  - **Kontrast na czarnym tle**: Wyróżnione karty pakietów posiadają biały stan hover (\`--f3-shadow: #ffffff\`), likwidując czarny tekst na ciemnym tle.
  - **Obsługa strzałek i layoutu**: Bezpieczne wykrywanie strzałek (\`↗\`, \`→\`) bez duplikacji, wyeliminowanie konfliktów z regułami \`translateX\`, brak przycinania na mobile.
  - **Menu i Hero**: Usunięto zdublowaną pozycję „Kontakt” z paska nawigacyjnego, słowo „swoją” w tytule Hero wyróżnione w kolorze pomarańczowym.
  - **Wdrożenie i testy**: Commity \`6b22fc9\`, \`61b84b5\`, \`30d11e9\`, \`4843b72\` na gałęzi \`main\`. Wdrożenie produkcyjne Vercel live: HTTP 200, 100% testów Playwright PASS.
`;
  const marker = '[[projects/grafmen/GEMINI_SYSTEM_INSTRUCTION|Grafmen.com (Astro Migration & Portfolio Redesign)]]';
  const idx = content.indexOf(marker);
  if (idx !== -1) {
    const statusIdx = content.indexOf('- **Status:**', idx);
    if (statusIdx !== -1) {
      const nextLineIdx = content.indexOf('\n', statusIdx);
      content = content.slice(0, nextLineIdx + 1) + projectUpdate + content.slice(nextLineIdx + 1);
    } else {
      content = content.slice(0, idx + marker.length) + projectUpdate + content.slice(idx + marker.length);
    }
    fs.writeFileSync(projectsPath, content, 'utf8');
    console.log('✅ Zaktualizowano core/projects.md');
  } else {
    console.warn('⚠️ Nie znaleziono sekcji Grafmen.com w core/projects.md');
  }
}

// 3. LOG.MD
const logPath = 'H:\\ai\\2Brain\\log.md';
if (fs.existsSync(logPath)) {
  const logEntry = `- [${now}] **Grafmen.com**: Domknięcie sprintu mikroanimacji F3 i UI: globalne wdrożenie fali liter na wszystkich podstronach i w portfolio, biały hover na czarnym tle, obsługa strzałek, usunięcie zdublowanego kontaktu w menu, pomarańczowe 'swoją' w hero. Commity 6b22fc9, 61b84b5, 30d11e9, 4843b72 na origin/main (Vercel success).\n`;
  fs.appendFileSync(logPath, logEntry, 'utf8');
  console.log('✅ Zaktualizowano log.md');
}
