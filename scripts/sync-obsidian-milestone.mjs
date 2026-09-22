import fs from 'node:fs';

const nowTime = '2026-09-22 14:06';

// 1. Daily note
const dailyPath = 'H:\\ai\\2Brain\\daily\\2026-09-22.md';
const entry = `
### Grafmen (grafmen.com) - Domknięcie optymalizacji obrazów i dolnego menu (Fluid Glass Menu)

- **Godzina zapisu:** ${nowTime}
- **Commity:** \`25847a0\` (wdrożenie), \`88d1832\` (skrypty QA) na gałęzi \`main\`
- **Podgląd na żywo:** https://grafmen-com.vercel.app/ (aktywny, HTTP 200)
- **Podsumowanie wprowadzonych i zweryfikowanych ulepszeń:**
  1. **Rzeczywiste wymiary obrazów w HTML:**
     - Zlikwidowano sztywne \`width="1400" height="920"\` na okładkach i galeriach.
     - Stworzono skrypt \`scripts/build-image-manifest.mjs\` generujący wspólny manifest metadanych \`src/data/image-manifest.json\`.
     - Każdy tag \`<img>\` w 20 podstronach portfolio otrzymuje fizyczne wymiary z pliku (np. Drew-Art: 1000×700, Katalog Drew-Art: 1750×1750, Drewmax: 1907×1080).
     - Rzeczywisty pomiar CLS w Chrome Playwright na mobile DPR 2: **0.0001** (brak przesunięć układu).
  2. **Precyzyjne deskryptory srcset i brak powiększania małych oryginałów:**
     - Usunięto wariant \`site-4-480w.webp\`, który miał faktycznie 476 px. Zastąpiono go wariantem 360w i oryginałem 476w.
     - Wariant powstaje tylko gdy \`origWidth >= w + 40\`.
     - Wyeliminowano zduplikowane deskryptory.
     - Skrypt \`scripts/verify-image-descriptors.mjs\` potwierdził 100% zgodności wszystkich 235 deskryptorów z fizycznymi pikselami na dysku (0 błędów).
  3. **Rzetelny opis kompresji stratnej:**
     - Zaktualizowano opis kompresji na stratną WebP o wysokiej jakości (\`quality: 84\` dla zdjęć, \`quality: 88\` dla znaków i brandingu).
  4. **Dolne pływające menu (Fluid Glass Menu):**
     - Wszystkie 6 linków ma dokładnie **17 px** i **44 px** wysokości (wymiary w Chrome: 262 × 44 px).
     - Przycisk otwierania: **44 × 44 px**, link HOME: **54 × 44 px**.
     - Pasek dolny: **48 px** wysokości (zarówno na mobile, jak i desktop).
     - Ostatni link („Kontakt”) na telefonie o wysokości 844 px (iPhone 12/13/14) w pełni mieści się w ekranie (\`bottom: 763\`).
     - Dodano guard zapobiegający kolizji z przyciskiem powrotu na górę: gdy menu jest otwarte (\`body.has-fg-open\`), \`.back-to-top\` ma \`opacity: 0\` i \`pointer-events: none\`.
     - Klawisz Escape zamyka menu i przywraca fokus, zaimplementowano pułapkę fokusu Tab / Shift+Tab.
`;

if (fs.existsSync(dailyPath)) {
  fs.appendFileSync(dailyPath, entry, 'utf8');
  console.log('✅ Zaktualizowano daily note:', dailyPath);
}

// 2. Core projects
const projectsPath = 'H:\\ai\\2Brain\\core\\projects.md';
if (fs.existsSync(projectsPath)) {
  let content = fs.readFileSync(projectsPath, 'utf8');
  const projectUpdate = `
- **Aktualizacja (${nowTime})**: **Domknięcie optymalizacji obrazów i dolnego menu (Fluid Glass Menu)**.
  - Wdrożono rzeczywiste wymiary z metadanych plików graficznych (koniec z 1400×920 dla okładek).
  - Skasowano fałszywy wariant \`site-4-480w.webp\` (zastąpiony 360w i 476w), deskryptory \`w\` w 100% odpowiadają fizycznym pikselom (235 deskryptorów, 0 błędów).
  - Dolne menu ma linki 17px, touch targety min. 44px (PL/EN 44x44px, toggle 44x44px, home 54x44px), ochronę przed kolizją z \`.back-to-top\` i brak ucinania linków.
  - Commity \`25847a0\` i \`88d1832\` wypchnięte na \`main\`. Vercel live zweryfikowany, CLS 0.0001.
`;
  const marker = '## Projekt: Grafmen.com';
  const idx = content.indexOf(marker);
  if (idx !== -1) {
    const insertPos = idx + marker.length;
    content = content.slice(0, insertPos) + projectUpdate + content.slice(insertPos);
    fs.writeFileSync(projectsPath, content, 'utf8');
    console.log('✅ Zaktualizowano core/projects.md');
  }
}

// 3. Log
const logPath = 'H:\\ai\\2Brain\\log.md';
if (fs.existsSync(logPath)) {
  const logEntry = `- [${nowTime}] **Grafmen.com**: Domknięto optymalizację obrazów (rzeczywiste wymiary w HTML z metadanych, deskryptory srcset zgodne z pikselami, manifest w src/data/, kompresja stratna WebP q84-q88) oraz dolnego menu (17px tekst, touch targety min. 44px, brak kolizji z back-to-top, CLS 0.0001). Commity 25847a0 i 88d1832 na main, Vercel live OK.\n`;
  fs.appendFileSync(logPath, logEntry, 'utf8');
  console.log('✅ Zaktualizowano log.md');
}
