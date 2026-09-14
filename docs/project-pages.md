# Szczegółowe strony portfolio

Wdrożona pierwsza realizacja: `/portfolio/hiker/`. Pozostałe karty nadal korzystają ze swoich dotychczasowych odsyłaczy. Nie tworzono fikcyjnych opisów dla wszystkich 18 projektów.

## Dodawanie projektu

1. Skopiuj `content/portfolio/hiker.json` do `content/portfolio/nazwa-projektu.json`. Pole `slug` musi odpowiadać nazwie pliku.
2. Uzupełnij tytuł, opis, kategorię, brief, listę dostarczonych elementów i rezultat. Podawaj wyłącznie potwierdzone informacje. Nieznany rok pozostaw pusty. Cytat jest opcjonalny i wymaga autora.
3. Dodaj obrazy do `assets/portfolio/`. W galerii podaj `src`, `alt`, `caption`, `width` i `height` zgodne z plikiem. Ścieżka zaczyna się od `assets/`.
4. Uzupełnij opcjonalny film i link do następnego projektu. Obecny generator przyjmuje tam pełne adresy HTTP/HTTPS.
5. Uruchom `node scripts/build-site.mjs`. Powstaje statyczne `portfolio/nazwa-projektu/index.html` i wersja do publikacji w `dist`.
6. Zmień odsyłacz odpowiedniej karty portfolio i dodaj docelowy URL do `sitemap.xml`. Ponownie uruchom budowę.

Układ: `templates/portfolio-project.html`. Edytuj szablon lub JSON, nie wygenerowaną stronę. Generator odrzuca nieprawidłowe ścieżki obrazów i slugi, koduje tekst jako tekst, nie pozwala nadpisać ręcznie napisanej strony bez oznaczenia generatora.

## Źródła Hiker

Opis i grafiki pochodzą z istniejącej realizacji użytkownika: https://grafmen.com/logo-hiker/. Nowe pliki pobrano z adresów grafik widocznych na tej stronie. Nie dopisano daty projektu, cytatu klienta ani wyników sprzedażowych, których nie potwierdzono.
