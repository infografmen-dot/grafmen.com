---
name: grafmen-dev
description: "Kompleksowy podręcznik inżynierii, architektury, design systemu i procedur operacyjnych dla serwisu Grafmen.com (Astro). Używaj przy wszelkich pracach programistycznych, dodawaniu i modyfikacji projektów portfolio, optymalizacji grafik WebP/srcset, edycji stylów CSS, tłumaczeniach i18n oraz testach jakościowych."
---

# Skill: Grafmen.com Developer & System Guide

Oficjalny skill operacyjny serwisu **Grafmen.com**. Zawiera zbiór reguł, standardów architektonicznych, wytycznych UI/UX oraz procedur weryfikacyjnych wypracowanych dla witryny.

---

## 1. Architektura i technologie

- **Silnik:** [Astro](https://astro.build/) w trybie czysto statycznym (`prerender = true`, wyjście `output: "static"` do folderu `dist/`).
- **Stylizacja (CSS):** Czysty **Vanilla CSS** (`public/site-pages.css`, `public/portfolio.css`, `public/cookie-banner.css`, `public/home.css`).
  - *Zasada bezwzględna:* **Nie używać TailwindCSS**, chyba że na wyraźne życzenie użytkownika.
- **Typografia:** Fonty Google `@fontsource/outfit` (nagłówki i główne menu) oraz `@fontsource/inter` (teksty ciągłe).
- **Animacje:** GSAP + Lenis (płynny scroll i mikroanimacje, `public/grafmen-motion.js`).
- **CMS i dane:** Pliki JSON w `src/content/portfolio/*.json` (kolekcja Astro) zsynchronizowane z `content/portfolio/*.json` (Keystatic).
- **Dwujęzyczność (i18n):**
  - Język domyślny: polski (`/`, `/portfolio/`, `/portfolio/[slug]/`).
  - Język angielski: `/en/`, `/en/portfolio/`, `/en/portfolio/[slug]/`.
  - Słowniki i18n w `src/data/i18n/` (w szczególności `portfolio-en.ts`).

---

## 2. Żelazna Reguła Pracy Lokalnej (Local-Only)

> [!CAUTION]
> **Domyślnie pracujesz wyłącznie lokalnie.**
> - Możesz edytować pliki, uruchamiać dev-server (`localhost:4321`), kompilować `npm run build` i wykonywać testy Playwright.
> - **Kategoryczny zakaz:** Nie wolno wysyłać zmian na GitHub (`git push`), scalać zdalnych Pull Requestów ani publikować wdrożeń na platformie Vercel bez osobnej, wyraźnej zgody użytkownika w tekście.
> - Akceptacja wyglądu czy kolejnego etapu NIE jest zgodą na publikację.

---

## 3. Standardy Design Systemu i UI

1. **Główne menu nawigacyjne:**
   - Wielkość fontu: `17px`, krój `Outfit`, `font-weight: 500`.
   - Obszary dotykowe (Touch Targets): **minimum 44 × 44 px** (przyciski PL/EN 44×44px, hamburger 46×48px, odnośniki mobilne min. 48–52px).
2. **Ochrona typograficzna (Sieroty / wiszące spójniki):**
   - Wszystkie nagłówki i akapity w szablonach Astro przechodzą przez funkcję `fixOrphans()`.
   - Spójniki jedno- i dwuliterowe (`w`, `z`, `i`, `o`, `a`, `u`, `do`, `od`, `na`, `po`) oraz zaimki (`się`) muszą być wiązane z następnym słowem twardą spacją (`&nbsp;` / `\u00A0`).
3. **Baner cookies (Prywatność):**
   - Położenie: lewy dolny róg ekranu.
   - Wygląd: zwarta, zaokrąglona karta (promień narożników 16px).
   - Styl: efekt matowego szkła (Dark Glass: półprzezroczyste białe tło ~50%, intensywny `backdrop-filter: blur(16px)`).
   - Treść: komunikat z linkiem „Dowiedz się więcej” oraz przycisk „Zamknij”.
4. **Siła estetyki (Aesthetics First):**
   - Ciemne akcenty `#09090b`, elegancka szarość `#f6f6f7`, dynamiczny pomarańcz brandowy `#ff4d15` (`var(--orange)`).
   - Zero surowych, domyślnych kontenerów – wszystkie media mają zaokrąglenia `border-radius: 16px`.

---

## 4. Standard Case Study i Dodawania Projektów

Każdy projekt w portfolio posiada wpis JSON w `src/content/portfolio/<slug>.json` oraz angielski odpowiednik w `src/data/i18n/portfolio-en.ts`.

### Struktura pól:
- `slug` – unikalny identyfikator (musi być zarejestrowany w tablicy `orderedSlugs` w szablonach portfolio).
- `title`, `description`, `category`, `year`.
- `cover` – ścieżka do okładki (zawsze format panoramiczny, optymalnie 1400×920 px lub proporcja 1.52 / 16:10, format WebP).
- `brief_title`, `brief` (tablica akapitów).
- `deliverables` (zakres prac – zwięzła lista dokonań bez zbędnych spekulacji).
- `gallery` (tablica rozkładówek: `src`, `alt`, `caption`, `width`, `height`).
- `result_title`, `result` (konkretny rezultat wdrożenia).
- `next_url`, `next_title` (lub generowane dynamicznie w szablonie).

### Kolejność i siatka portfolio:
- Na stronie głównej i `/portfolio/` projekty renderowane są według ściśle ustalonej kolejności `orderedSlugs`.
- Asymetryczna siatka kart (np. Hiker po lewej na dużej karcie `p3`, szkoła.best po prawej na karcie `p4`).

---

## 5. Image Pipeline (Obsługa grafik i wydajność)

1. **Formaty:** Wszystkie zdjęcia produkcyjne konwertowane są do zoptymalizowanego formatu **WebP** (`sharp`, jakość 85–90).
2. **Warianty responsywne i srcset:**
   - Po dodaniu lub zmianie grafik w `public/assets/portfolio/...` należy uruchomić generator manifestu:
     ```bash
     node scripts/build-image-manifest.mjs
     ```
   - Skrypt automatycznie generuje warianty: `360w`, `480w`, `800w`, `1200w` oraz aktualizuje `src/data/image-manifest.json`.
3. **Ochrona metryki LCP (Largest Contentful Paint):**
   - Zdjęcie okładkowe (`.project-cover img`) posiada atrybuty: `fetchpriority="high"`, `decoding="async"` i **nie może mieć** `loading="lazy"`.
   - Zdjęcia w galerii (`.project-gallery img`) posiadają: `loading="lazy"`, `decoding="async"`.

---

## 6. Procedura weryfikacji i kontroli jakości (QA Loop)

Przed zakończeniem każdego zadania wykonaj:
1. **Budowa statyczna:**
   ```bash
   npm run build
   ```
   *Kryterium sukcesu:* Zbudowanie 69 stron bez żadnych błędów czy ostrzeżeń kompilatora.
2. **Weryfikacja w bezgłowej przeglądarce:**
   - Uruchom dedykowany skrypt Playwright (np. `node scripts/verify-drewart-gallery.mjs`), weryfikujący renderowanie w realnym środowisku Chrome (viewport desktop 1440px oraz mobile 390px).
   - Sprawdź brak overflow poziomego (`overflow-x: hidden`).

---

## 7. Integracja z Drugim Mózgiem w Obsidianie (`H:\ai\2Brain`)

- Zawsze komunikuj się z użytkownikiem w języku polskim.
- Pojedyncza litera `t` oznacza „tak” (akceptacja / zgoda).
- Co 3 interakcje zapytaj: *„Czy zapisać podsumowanie tej sesji?”*.
- Jeśli użytkownik potwierdzi (`t` / `tak`):
  1. Zapisz podsumowanie do `H:\ai\2Brain\daily\YYYY-MM-DD.md` (z nagłówkiem projektu `## [Podsumowanie Sesji] Grafmen.com...`).
  2. Zaktualizuj stan projektu w `H:\ai\2Brain\core\projects.md`.
  3. Dopisz wpis do dziennika `H:\ai\2Brain\log.md`.
  4. Użyj gotowego skryptu lub procedury `scripts/sync-session-obsidian.mjs`.
