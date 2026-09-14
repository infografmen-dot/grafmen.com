> Aktualny status naprawy z 2026-09-13 opisuje repair-review.md. Poniższe oceny są historyczne. Bieżąca paczka nie ma jeszcze odbioru wizualnego.

# Design-loop — portfolio, 2026-09-10

Zakres: portfolio. Zatwierdzone hero i nagłówek zachowane; porównanie HTML potwierdziło brak zmian. Załączony design-loop.md urywa się po Interview; zastosowano uzgodniony proces i trzech niezależnych krytyków.

1. Interview: odpowiedzi z aktualnych decyzji użytkownika i handoffu; nowa kolejność sześciu realizacji.
2. Preflight: sprawdzenie FIXED i dokumentów źródłowych, zebranie autentycznych materiałów, użycie dostarczonego screenu szkoły i kadru filmu.
3. Teardown: oględziny kompozycji portfolio Ramotion; bar jakości w bar.md.
4. Loop: render w Chrome, niezależne oceny i korekty największych luk.

| Ocena | Wynik i poprawki |
|---|---|
| Brief | PASS: sześć realizacji w zadanej kolejności, zgodne materiały i docelowe linki. |
| System | Początkowo FAIL: nadmiar poziomów tekstu, potem siatka. Ujednolicono do 56/28/16 px na desktopie, wdrożono 12 kolumn/gutter 24 px i wyróżnienie 8 kolumn. Ponowna ocena: PASS. |
| Craft | Początkowo FAIL: Drewmax wyglądał jak fotografia wnętrza. Zastąpiono go autentycznym screenshotem strony z nawigacją, nagłówkiem i CTA. Ponowna ocena wszystkich sześciu kart desktop: PASS. |

Weryfikacja główna: desktop i mobilny viewport 390 px w Chrome, kolejność 1–6, szerokości kart bez kolizji, poprawne ładowanie obrazów po przewinięciu, ścieżki lokalnych plików. Krytyk systemu sprawdził focus i reduced motion. Nie wykonywano pełnego audytu WCAG ani przeglądu całej witryny.

Pozostałe ograniczenie: screenshot szkoły użytkownika ma 424 px szerokości; na desktopie jest mniej ostry niż pozostałe materiały. Nie zastępowano go wygenerowaną grafiką.

## Aktualizacja 2026-09-12 — architektura i treści

| Faza | Weryfikacja |
|---|---|
| Interview | Zastosowano najnowsze ustalenia: krótsza homepage, osobne landingi `/strony-www/` i `/modernizacja/`, finalne menu oraz co najmniej 16 pozycji na pełnym portfolio. |
| Preflight | Sprawdzono bieżący handoff, treści, meta dane, linkowanie i lokalne assety przed zmianą. |
| Implement | Dodano wspólny header/footer, podstrony usług, pełne FAQ na `/strony-www/`, skrócone FAQ na homepage, rozbudowane `/o-mnie/` oraz 20 kart na `/portfolio/`. |
| Verify | Parser HTML nie wykazał błędów, wszystkie 174 lokalne odwołania wskazują istniejące pliki, a oba skrypty przechodzą `node --check`. Wizualny render bieżącej paczki wymaga jeszcze otwarcia w zwykłym Chrome na pełnej szerokości przed wdrożeniem produkcyjnym. |
