# Grafmen.com Design System & UI Tokens

Zbiór standardów wizualnych, tokenów CSS i wytycznych UI dla serwisu Grafmen.com.

## 1. Kolorystyka (Color Palette)

| Nazwa tokenu | Wartość HEX / HSL | Zastosowanie |
| :--- | :--- | :--- |
| `--background` / ciemne | `#09090b` | Tła sekcji dark, karty mediów |
| `--white` | `#ffffff` | Główne tło jasne witryny |
| `--surface-subtle` | `#f6f6f7` | Tła kart projektów, kontenery okładek |
| `--orange` | `#ff4d15` | Główny kolor akcentowy, kickery, aktywne linki |
| `--orange-hover` | `#e04010` | Stan hover przycisków akcentowych |
| `--text-main` | `#111113` | Główny tekst czytelny, nagłówki H1/H2 |
| `--text-muted` | `#62626b` | Teksty pomocnicze, podpisy `figcaption`, leady |
| `--border-subtle` | `rgba(0, 0, 0, 0.08)` | Delikatne linie oddzielające, ramki kart |

## 2. Typografia

- **Nagłówki i Menu:** `Outfit`, sans-serif (`@fontsource/outfit`).
  - Główne menu nawigacyjne: `17px`, `font-weight: 500`.
  - H1: `clamp(32px, 5vw, 64px)`, `font-weight: 700`, `letter-spacing: -0.02em`.
  - H2: `clamp(24px, 3.5vw, 40px)`, `font-weight: 600`.
- **Treść artykułów i opisy:** `Inter`, sans-serif (`@fontsource/inter`).
  - Akapity: `16px` – `18px`, `line-height: 1.6`.
- **Obsługa sierot:** Każdy dynamiczny i statyczny tekst w szablonie przechodzi przez funkcję wiążącą spójniki twardą spacją (`&nbsp;`).

## 3. Komponenty Specjalne

### Szklany panel Cookies (Dark Glass 50%)
```css
.cookie-banner {
  position: fixed;
  left: 24px;
  bottom: 24px;
  max-width: 320px;
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  z-index: 9999;
}
```

### Zaokrąglenia (Border Radius)
- Wszystkie karty projektów i obrazy: `border-radius: 16px`.
- Przyciski pigułkowe (Pills): `border-radius: 9999px`.
- Kapsułki nawigacji mobilnej: `border-radius: 24px`.
