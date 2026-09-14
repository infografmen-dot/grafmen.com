# Kontrola aktualizacji, 2026-09-13

## Zakres

Ton komunikacji, Kontakt w nagłówku i nowa strona kontaktowa, Decap CMS w ofercie pakietów 2/3, wizualne przykłady brandingu, szablon realizacji oraz pierwsza podstrona Hiker. Zachowano zakres odłożony przez użytkownika: stare odsyłacze przy pakietach. Nie uruchamiano integracji GitHub ani publikacji.

## Kontrola techniczna

| Sprawdzenie | Wynik |
|---|---|
| Budowa statyczna `node scripts/build-site.mjs` | PASS, 9 stron HTML w dist |
| Lokalne obrazy, CSS, JS, linki i kotwice | PASS |
| Jedno H1 i main na stronę, brak powtórzonych ID | PASS |
| Unikalne title/canonical, obecność description i poprawny JSON-LD | PASS |
| Canonical wszystkich 9 stron w sitemapie | PASS |
| Składnia JavaScript i skryptów budowy | PASS |
| Hero: porównanie HTML i stylów z poprzednim ZIP | Bez zmian |
| Portfolio: liczba kart | 6 homepage, 18 pełna galeria |
| Odłożone linki pakietów | Bez zmian względem poprzedniej paczki |
| Generator projektu: kodowanie tekstu zawierającego HTML | PASS, test w izolowanej kopii |
| Generator projektu: odrzucenie wyjścia poza katalog obrazów | PASS, istniejąca strona nie została nadpisana |
| Brief kontaktowy: nieważne dane, polskie znaki, znaki specjalne | PASS w teście logiki JS z podstawionym interfejsem formularza |

Test kontaktu nie uruchamiał aplikacji pocztowej ani nie wysyłał wiadomości. Nie jest testem dostarczenia e-maila ani przeglądarkowym testem formularza.

## Kontrola wizualna

Obejrzano publiczny podgląd przed zmianami: homepage i branding. Potwierdzono brak przykładów wizualnych na brandingu i brak formularza w dotychczasowej sekcji `#kontakt`. Obejrzano trzy pobrane grafiki Hiker; podpisy dopasowano do zawartości, wymiary galerii do plików.

Render nowej paczki w dostępnej przeglądarce został zablokowany przez regułę dostępu do lokalnych plików. Nie próbowano obchodzić tej blokady. Nowe podstrony nie mają jeszcze odbioru przeglądarkowego desktop/mobile. Nie przyznajemy wizualnego PASS. Do obejrzenia po ręcznym wgraniu: układ trzech obrazów brandingu, kontakt na małym ekranie, galeria Hiker, nagłówek i menu mobilne, przełącznik PL/EN, dłuższe teksty pakietów i FAQ.

## Ograniczenia funkcjonalne

- Kontakt przygotowuje e-mail w programie pocztowym użytkownika. Nie ma jeszcze endpointu wysyłkowego. Interfejs mówi o tym przed użyciem.
- Decap CMS opisano jako element oferty. Nie uruchomiono panelu ani OAuth dla Grafmen.
- EN obejmuje dotychczasowy podgląd pierwszych sekcji homepage.
- Linki pakietów nadal prowadzą do starego kontaktu, zgodnie z odroczeniem użytkownika. Docelowo wymagają przepięcia.
- Większość realizacji, pełne opinie i polityka prywatności nadal korzystają ze starego serwisu.
- Vercel pozostaje w trybie podglądu z noindex. Nie deklarujemy gotowości produkcyjnej.

## Źródła treści i materiałów

Kontakt: https://grafmen.com/kontakt-przemysl-podkarpacie-polska/
Hiker: https://grafmen.com/logo-hiker/
Decap: oficjalne źródła podane w `cms-decision.md`.
