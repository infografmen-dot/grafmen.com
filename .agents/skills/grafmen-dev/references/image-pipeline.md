# Standard Przygotowania Grafik (Image Pipeline)

Kompleksowy proces optymalizacji i publikacji materiałów graficznych w projekcie Grafmen.com.

## 1. Narzędzia i Wymagania

- Wszystkie obrazy w projekcie są obsługiwane w formacie **WebP**.
- Do przetwarzania wykorzystujemy bibliotekę **`sharp`** zainstalowaną lokalnie w projekcie (`import sharp from 'sharp'`).

## 2. Standard Rozdzielczości i Jakości

| Typ zasobu | Wymiary bazowe | Jakość WebP | Uwagi |
| :--- | :--- | :--- | :--- |
| Okładka projektu (`cover`) | 1400×920 px (lub proporcja ~1.52 / 16:10) | `quality: 90` | Wysoka jakość, `fetchpriority="high"`, brak lazy loadingu |
| Rozkładówka / widok WWW | 1400×920 px lub proporcja naturalna | `quality: 85–88` | `loading="lazy"`, `decoding="async"` |
| Logotyp / Znak wektorowy | Wymiary oryginalne lub SVG | `quality: 90` | Wyższy priorytet ostrości krawędzi |

## 3. Generowanie Wariantów Responsywnych (`srcset`)

W projekcie działa automatyczny skrypt:
```bash
node scripts/build-image-manifest.mjs
```

### Co robi skrypt:
1. Przeszukuje wszystkie wpisy w `src/content/portfolio/*.json`.
2. Dla każdego obrazu weryfikuje fizyczną obecność pliku w `public/`.
3. Wylicza docelowe szerokości responsywne: `360w`, `480w`, `800w`, `1200w`.
4. Generuje warianty tylko wtedy, gdy oryginał jest większy od wariantu o co najmniej 40 px (zapobiega powiększaniu małych grafik).
5. Zapisuje gotowe pliki do odpowiednich podfolderów w `public/assets/portfolio/...`.
6. Generuje i aktualizuje manifest `src/data/image-manifest.json` z poprawnie posortowanymi deskryptorami `srcset` i wymiarami `width`/`height`.

## 4. Zasada Ochrony Metryk Core Web Vitals (LCP)

- **Okładka case study:** Element `.project-cover img` to główny element LCP na podstronie. Nigdy nie dodawaj do niego `loading="lazy"`. Zawsze deklaruj atrybuty `width` i `height`, aby uniknąć przesunięć układu (CLS = 0).
