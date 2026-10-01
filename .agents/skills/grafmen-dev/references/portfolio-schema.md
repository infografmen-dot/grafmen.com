# Standard Danych Portfolio (Portfolio Schema)

Specyfikacja struktury danych dla wpisów w kolekcji portfolio serwisu Grafmen.com.

## 1. Lokalizacja plików
- Ścieżka główna: `src/content/portfolio/<slug>.json`
- Kopia synchronizacji Keystatic: `content/portfolio/<slug>.json`
- Angielskie tłumaczenia: `src/data/i18n/portfolio-en.ts` (klucz równy `<slug>`)

## 2. Format JSON (Przykładowy wpis)

```json
{
  "slug": "nazwa-projektu",
  "title": "Tytuł Projektu",
  "description": "Jedno- lub dwuzdaniowy zwięzły opis realizacji.",
  "category": "Strona WWW / Branding / Katalog",
  "year": "2025",
  "cover": "assets/portfolio/full/nazwa-projektu.webp",
  "cover_alt": "Precyzyjny opis alternatywny okładki",
  "brief_title": "Chwytliwy nagłówek sekcji Potrzeba.",
  "brief": [
    "Pierwszy akapit opisujący wyzwanie klienta.",
    "Drugi akapit opisujący cel projektu."
  ],
  "deliverables": [
    "Punkt 1 zakresu prac.",
    "Punkt 2 zakresu prac.",
    "Punkt 3 zakresu prac."
  ],
  "gallery": [
    {
      "src": "assets/portfolio/nazwa-projektu/widok-1.webp",
      "alt": "Opis rozkładówki lub ekranu",
      "caption": "Podpis pod zdjęciem w galerii.",
      "width": 1400,
      "height": 920
    }
  ],
  "result_title": "Tytuł podsumowujący efekt wdrożenia.",
  "result": [
    "Konkretny, mierzalny rezultat wykonanych prac."
  ],
  "external_url": "https://domena-klienta.pl/",
  "external_label": "Otwórz stronę domena-klienta.pl"
}
```

## 3. Zasady dotyczące grafik
- **Okładka (`cover`):** Zawsze format panoramiczny (optymalnie 1400×920 px lub 1.52 / 16:10, max-height 780px w szablonie).
- **Galeria (`gallery`):**
  - Obrazy poziome: optymalnie 1400×920 px.
  - Obrazy pionowe (`.gallery-item-vertical`): automatycznie wykrywane, gdy `height / width >= 1.25` (ograniczone na desktopie do `max-width: 640px; margin-inline: auto`).
  - Wideo (`type: "video"`): opcjonalne wideo mp4 z plakatem `.webp`, autoplay muted z kontrolkami.

## 4. Rejestracja w `orderedSlugs`
Każdy nowy slug musi zostać dopisany do tablicy `orderedSlugs` w:
- `src/pages/portfolio/index.astro`
- `src/pages/portfolio/[slug].astro`
- `src/pages/en/portfolio/index.astro`
- `src/pages/en/portfolio/[slug].astro`
- `src/data/i18n/routes.ts`
