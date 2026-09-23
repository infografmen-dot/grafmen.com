import fs from 'node:fs';

const now = '2026-09-23 11:00';
const todayDate = '2026-09-23';

// 1. DAILY NOTE: H:\ai\2Brain\daily\2026-09-23.md
const dailyDir = 'H:\\ai\\2Brain\\daily';
const dailyPath = `${dailyDir}\\${todayDate}.md`;

const dailyEntry = `
### Grafmen (grafmen.com) - Wdrożenie 1. rundy mikroanimacji i kompaktowej kapsułki cookies

- **Data i godzina:** ${now}
- **Repozytorium:** https://github.com/infografmen-dot/grafmen.com
- **Commit:** \`3f2d23a\` (*feat: mikroanimacje runda 1 - Lenis smooth scroll, reveal naglowkow i paralaksa kart portfolio*)
- **Podgląd produkcyjny:** https://grafmen-com.vercel.app/
- **Zakres zrealizowanych prac:**
  1. **Płynne przewijanie (Lenis Smooth Scroll):**
     - Dodano oficjalną bibliotekę Lenis (\`public/assets/vendor/lenis.min.js\`) oraz dedykowany moduł startowy (\`public/homepage-motion.js\`).
     - Konfiguracja: \`lerp: 0.08\`, \`duration: 1.1\`, pełna synchronizacja z GSAP ScrollTrigger przez ticker.
     - Działa wyłącznie na desktopach ze wskaźnikiem precyzyjnym (\`hover: hover and pointer: fine\`). Na mobile i przy \`prefers-reduced-motion\` zachowano w 100% natywny scroll.
  2. **Eleganckie odsłanianie nagłówków sekcji (SplitText Reveal):**
     - Dodano atrybut \`data-motion="heading-reveal"\` do nagłówków H2 w Portfolio (*Realizacje, które zatrzymują uwagę.*) oraz Opinii (*Dobra współpraca zostaje na dłużej.*).
     - Wspólny mechanizm linii z maskami (\`.gf-line-mask\`) odsłania nagłówki bez ucinania polskich znaków diakrytycznych.
  3. **Karty portfolio i paralaksa wewnętrzna:**
     - Subtelny fade-in i przesunięcie przy wejściu (\`opacity: 0 -> 1\`, \`y: 28px -> 0\`) dla kart p1–p6.
     - Wewnętrzna paralaksa (\`yPercent: -4\` do \`4\`, \`scrub: 0.8\`) na zrzucie strony Drewmax.pro (p1) i makiecie brandingu Hiker (p4).
     - Hover na karcie płynnie przesuwa strzałkę \`.arr\` o 4 px w prawo.
  4. **Kompaktowy pasek cookies w kształcie kapsułki:**
     - Wygląd inspirowany Studio Ahremark: mała, pozioma kapsułka (\`border-radius: 999px\`) w lewym dolnym rogu ekranu, bez pełnoekranowej zasłony.
     - Przycisk informacyjny i rozwijany panel ustawień cookies z zachowaniem pełnej ergonomii.
  5. **Weryfikacja w przeglądarce:**
     - 0 błędów w konsoli JS, płynne przewijanie, animacja hero (*kinetic wipe*) i wideo kostek w pełni zachowane.
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
- **Aktualizacja (${now})**: **Wdrożenie 1. rundy mikroanimacji (Lenis, reveal nagłówków, karty portfolio, paralaksa) oraz kapsułki cookies**.
  - **Lenis Smooth Scroll**: Dodano Lenis 1.x zsynchronizowany z GSAP ScrollTrigger dla płynnego przewijania na desktopie (lerp 0.08, duration 1.1). Na mobile natywny scroll bez zmian.
  - **Odsłanianie nagłówków**: Dodano \`data-motion="heading-reveal"\` (SplitText) do Portfolio i Opinii, łącząc wszystkie główne sekcje homepage w spójny system ruchu.
  - **Portfolio & Paralaksa**: Wejście kart p1-p6 z subtelnym ruchem, paralaksa pionowa (\`yPercent: -4..4\`) na makietach Drewmax i Hiker. Hover strzałki na karcie (+4px).
  - **Kapsułka cookies**: Zaimplementowano mały poziomy pasek (kapsułkę) w lewym dolnym rogu ekranu z rozwijanym panelem ustawień.
  - **Stan repozytorium**: Zmiany zatwierdzone i wypchnięte do GitHub (\`origin/main\`, commit \`3f2d23a\`).
`;
  const idx = content.indexOf('## Projekt: Grafmen.com');
  if (idx !== -1) {
    const afterHeader = idx + '## Projekt: Grafmen.com'.length;
    content = content.slice(0, afterHeader) + projectUpdate + content.slice(afterHeader);
    fs.writeFileSync(projectsPath, content, 'utf8');
    console.log('✅ Zaktualizowano core/projects.md');
  } else {
    // Jeśli nie ma dokładnego nagłówka, dopisujemy na początku
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
  const logEntry = `- [${now}] **Grafmen.com**: Wdrożenie 1. rundy mikroanimacji (Lenis smooth scroll, SplitText reveal nagłówków sekcji, wejście kart portfolio, paralaksa pionowa na makietach p1/p4) oraz wdrożenie kompaktowej kapsułki cookies. Commit \`3f2d23a\` wypchnięty do origin/main.\n`;
  fs.appendFileSync(logPath, logEntry, 'utf8');
  console.log('✅ Zaktualizowano log.md');
} else {
  console.warn('⚠️ Nie znaleziono pliku log.md pod ścieżką:', logPath);
}
