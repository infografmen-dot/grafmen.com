# Grafmen: animowane portfolio, 2026-09-14

Paczka zawiera kompletny aktualny podgląd w HTML, CSS i JavaScript. Nie zmienia frameworka ani nie wymaga konfiguracji połączenia z GitHubem przez asystenta.

## Wgranie

1. Rozpakuj ZIP. Wgraj jego zawartość do głównego folderu repozytorium, zastępując odpowiadające pliki. Zachowaj strukturę katalogów.
2. Vercel korzysta z dołączonego `vercel.json`: komenda `node scripts/build-site.mjs`, katalog wynikowy `dist`. Kompilacja nie wymaga instalowania zależności.
3. Po aktualizacji sprawdź podgląd pod dotychczasowym adresem. Lokalnie można otworzyć `index.html`; niektóre funkcje, np. poczta, wymagają skonfigurowanej aplikacji lub internetu.

Nie wgrywaj ZIP jako pojedynczego pliku. Nie umieszczaj całego projektu w dodatkowym podkatalogu. `dist` jest generowany i celowo nie znajduje się w ZIP. Przy zwykłym hostingu statycznym publikuj zawartość lokalnie wygenerowanego `dist`.

## Animowane portfolio

Sześć kart homepage ma gotowe ośmiosekundowe pętle MP4/WebM. Nie trzeba nic renderować ani instalować, żeby je obejrzeć lub wgrać. Otwórz `docs/motion-preview.html`, aby obejrzeć filmy osobno; `index.html` pokazuje je w istniejącej siatce. Scenariusze sekunda po sekundzie, ograniczenia materiałów i bezpłatny sposób ponownego renderowania opisano w `docs/portfolio-motion.md`. Kod źródłowy animacji znajduje się w `scripts/render-portfolio-motion.py`.

Ruch ładuje się przy wejściu karty na ekran, zatrzymuje poza ekranem i można go wyłączyć. Zachowano statyczne miniatury, wszystkie linki i dotychczasowy układ. Oryginalny film Hiker nie był dostępny w paczce: jego karta to animowany teaser z dostarczonego kadru.

## Runda 2

Wdrożono poprawki opisane w `docs/round-2-review.md`: opcjonalny CMS wyłącznie w ofercie klientów, jasny zakres 8 podstron, większe odstępy nagłówków od opisów, FAQ o terminie i WordPressie, sticky menu, strzałka do góry i klikalne logo stopki. Branding zawiera pełniejszy zakres usług oraz przykłady JD, Hiker i Self-Invest. Na „O mnie” czeka kontener 4:5 na portret. Na /portfolio/ nie ma numeracji projektów.

Przyciski zapytań prowadzą teraz do nowego kontaktu. „Wyślij e-mail” otwiera program pocztowy, co wyjaśniono przy formularzu. Nie ma serwerowego endpointu wysyłkowego.

## Dalsze materiały

Do uzupełnienia pozostają portret, przykłady nowych usług i ostateczna lista portfolio. Szablon szczegółów projektu opisuje `docs/project-pages.md`. Grafmen.com pozostaje bez CMS. Wyjaśnienie zakresu oferty zawiera `docs/cms-decision.md`.

## Status

Paczka przeszła kontrolę techniczną. Odbiór wizualny nowej wersji pozostaje do wykonania po wgraniu na Vercel. Nie deklarujemy pełnego design-loop PASS ani gotowości produkcyjnej. Hosting nadal ma noindex, a EN jest podglądem pierwszych sekcji homepage. Nie zmieniono ustawień kont ani publikacji.

Starsze raporty opisują poprzednie etapy. Aktualne ustalenia zawierają ten README i `docs/round-2-review.md`.
