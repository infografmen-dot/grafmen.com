# Lista Kontrolna Jakości (Quality Checklist)

Dziesięciopunktowa lista weryfikacyjna, którą agent musi sprawdzić przed uznaniem zadania za zakończone.

---

## Lista Kontrolna Przed Ukończeniem Prac:

- [ ] **1. Brak wiszących spójników (fixOrphans):**
  Czy wszystkie nowe nagłówki H1, H2, leady i podpisy figcaption przechodzą przez funkcję `fixOrphans`? Brak pojedynczych liter na końcach wierszy (`w`, `z`, `i`, `o`, `a`, `u`).

- [ ] **2. Kompilacja statyczna bez błędów:**
  Czy `npm run build` kompiluje wszystkie 69 stron bez żadnych błędów czy ostrzeżeń?

- [ ] **3. Obszary dotykowe (Touch Targets min. 44px):**
  Czy wszystkie nowe lub zmodyfikowane przyciski, linki i elementy interaktywne mają co najmniej 44 × 44 px powierzchni dotykowej?

- [ ] **4. Responsywność i brak poziomego scrolla:**
  Czy przy viewportach 390px (iPhone), 768px (tablet) i 1440px (desktop) strona nie wywołuje poziomego przewijania (`overflow-x: hidden`)?

- [ ] **5. Kompletność dwujęzyczna (i18n):**
  Czy każda zmiana treści w języku polskim została odpowiednio przetłumaczona lub zaadaptowana w `src/data/i18n/portfolio-en.ts` lub w szablonach `/en/`?

- [ ] **6. Format i warianty grafik:**
  Czy nowe zdjęcia są w formacie WebP i czy wygenerowano dla nich warianty responsywne w `image-manifest.json` (`node scripts/build-image-manifest.mjs`)?

- [ ] **7. Ochrona metryki LCP:**
  Czy zdjęcie okładkowe nie ma atrybutu `loading="lazy"` i ma `fetchpriority="high"`?

- [ ] **8. Zgodność z Design Systemem:**
  Czy elementy zachowują zaokrąglenia `border-radius: 16px`, kolorystykę (`--orange`, `#09090b`, `#f6f6f7`) i typografię `Outfit`/`Inter`?

- [ ] **9. Reguła Pracy Lokalnej (Local-Only):**
  Czy zmiany pozostały wyłącznie na środowisku lokalnym (zero pusha na GitHub, zero wdrożenia na Vercel)?

- [ ] **10. Drugi Mózg (Obsidian):**
  Czy po ważnych ustaleniach lub co 3 interakcje zaoferowano zapis podsumowania sesji do `H:\ai\2Brain`?
