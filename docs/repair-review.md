# Naprawa po audycie, 2026-09-13

## Zakres i status

Zastosowano najnowszą instrukcję użytkownika z tej rozmowy. Starsze dokumenty nie zastępują zatwierdzonego menu, obecności bloga, liczby projektów ani decyzji o hero. Nie zmieniono plików źródłowych użytkownika.

| Element | Wynik |
| --- | --- |
| Hero i sześć realizacji homepage | Porównanie z poprzednim ZIP-em potwierdza identyczną zawartość przed sekcją opinii. CSS portfolio i skrypt zmiany języka również bez zmian. |
| Mobilne portfolio | Wszystkie karty tracą desktopowe grid-column i grid-row do 900 px. Jedna kolumna, kolejność DOM zachowana. Kontrola kodu, nie pomiar w przeglądarce. |
| Portfolio | 18 kart i 18 różnych adresów projektów; numeracja 01–18, zgodny opis. Usunięte dodatkowe CTA; kontakt w nagłówku i stopce nadal działa. |
| O mnie | Dodano brakujące bio, zasady oraz wyróżniki; zachowano historię Drewmara i łagodny tekst o mniejszych firmach. |
| Strony WWW | Przywrócono temat widoczności w AI i pełniejsze wyjaśnienia. Bez obietnic polecania przez AI, sztywnych terminów i gwarancji pozycji. |
| Opinie | Trzy krótkie fragmenty, podpisy i link do pełnego źródła. Nie są to nowe, pozyskane teraz rekomendacje. |
| Blog | Pusty listing, szablon wpisu, demonstracyjny podgląd noindex, generator i instrukcja. Przykład nie jest opublikowany. |
| Pliki graficzne | Wszystkie miniatury portfolio lokalne. Błędny adres broszury PerVita24 naprawiony na podstawie strony realizacji. |

## Design-loop

Interview: zakres, źródła i kierunek wynikają z zaakceptowanego projektu oraz instrukcji użytkownika; nie otwierano ponownie ustalonych decyzji.

Preflight: odczyt źródeł i kryteriów. Zdalna przeglądarka zwraca ERR_BLOCKED_BY_CLIENT dla localhost. Próba pobrania lokalnego Chrome zakończyła się timeoutem. Nie obchodzono blokady.

Teardown: kryteria naprawy w repair-bar.md, z odniesieniem do wcześniejszego bar.md i zaakceptowanej kompozycji.

Trzech niezależnych recenzentów wykonało przegląd kodu i treści. Wskazane błędy poprawiono: pozostała liczba „20”, rozmiar tekstu cytatów nadpisywany przez style akapitów, ukrywane na mobile okruszki oraz pozostający HTML po wycofaniu publikacji wpisu. Uproszczono także nadmiernie techniczne zdania w treści sprzedażowej.

**Odbiór wizualny: NIEZWERYFIKOWANY. Pełna pętla design-loop nie jest zakończona.** Nie wykonano screenshotów tej wersji, więc nie ma podstaw do oceny wyglądu, kadrowania i odstępów jako PASS. Dawniejsze wyniki w design-loop-review.md dotyczą poprzednich etapów.

## Kontrole funkcjonalne

- Publikacja wpisu w tymczasowej kopii tworzy HTML, pozycję listingu i wpis sitemap.
- Wycofanie wpisu usuwa jego wygenerowany HTML i adres z sitemap.
- Nieprawidłowy slug i powtórzone slugi są odrzucane.
- Treść wpisu jest escapowana; znaki HTML nie wykonują skryptów.
- Dodatkowy raport kontroli plików: qa-results.json.

## Źródła

Opinie: https://grafmen.com/o-mnie-grafik-komputerowy-freelancer/ , odczyt 2026-09-13. Fragmenty opinii Kazimierza Ogińskiego (Drewmar), Marzeny Drabińskiej (Salmax S.C.) i Joanny Brzeskiej (Unitrans Sp. z o.o.). Widoczny tekst jest oznaczony jako fragment, bez dopisanych ocen.

Broszura: https://grafmen.com/portfolio_broszura_pervita24/ . Obraz: https://grafmen.com/wp-content/uploads/2022/10/Pervita24-A4_Brochure-www_1.jpg . Poprzedni odsyłacz katalog-www.webp zwracał 404.

Zmiany redakcyjne względem pierwotnego CONTENT.md są świadome: terminy zależą od zakresu i materiałów; samodzielną edycję ustala się przed realizacją; WordPress może być opcją; przygotowanie do wyszukiwania z AI nie jest gwarancją rekomendacji. Nie przywracano niepotwierdzonych obietnic technicznych.
