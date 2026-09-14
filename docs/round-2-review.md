# Runda 2: zakres i kontrola zmian

## Wdrożone

- CMS tylko w ofercie stron klientów, opcjonalnie w pakietach 2/3, na życzenie. Grafmen pozostaje statycznym serwisem bez CMS.
- Pakiet 2: „Wielostronicowy serwis WWW (do 8 osobnych podstron)”. Tak samo na homepage i stronie usługi.
- Wspólny odstęp H2 od opisu: 40 px na desktopie, 32 px na telefonie. W procesie współpracy zwiększono istniejący odstęp z 28 do 56 px. Wyłączono ten margines tam, gdzie nagłówek i opis są obok siebie w osobnych kolumnach. Nie zwiększano dwukrotnie wysokości wierszy samego H2.
- FAQ o czasie: dopisano zwykle od tygodnia do trzech, z zależnością od zakresu. W /strony-www/ pytanie o WordPress jest czwarte, po cenie, terminie i responsywności. Pełne FAQ ma teraz 7 pytań.
- W nagłówku Kontakt prowadzi do /kontakt/. Przyciski zapytań w treści, w tym pakiety, również kierują lokalnie do tej podstrony.
- Klikalne logo stopki wraca do góry homepage. Na podstronach prowadzi do homepage.
- Sticky header z tłem o kryciu 92%, rozmyciem 8 px i delikatnym cieniem po przewinięciu. Zachowano rozmiar dotychczasowego nagłówka.
- Strzałka powrotu w prawym dolnym rogu pojawia się po 400 px. Przewija płynnie, respektuje ustawienie ograniczonego ruchu i przenosi fokus do logo nagłówka.
- Kontakt: „Wyślij e-mail”, z pozostawionym wyjaśnieniem, że przycisk otwiera program pocztowy. Nie dodano serwerowej wysyłki ani nieprawdziwego potwierdzenia dostarczenia.
- Branding: rozszerzone hero, wprowadzenie i 3 bloki usług. Osobny rząd przykładów JD, Hiker i Self-Invest. Nie powiązano księgi Self-Invest z usługą wideo. Film pozostaje bez nowego przykładu do czasu otrzymania materiałów.
- Portfolio: usunięte numery przed kategoriami na /portfolio/, 18 projektów i ich układ zachowane. Numeracja kategorii usług pozostaje. Homepage nadal ma 6 projektów.
- O mnie: prawa kolumna hero ma pusty kontener 4:5 na portret, bez powtórzonego CTA. Nie pobierano przypadkowego zdjęcia ani nie generowano twarzy.

## Dalsza korekta tonu

Przejrzano homepage, Strony WWW, Branding, Portfolio, O mnie, Kontakt, Modernizację i Blog. W poprzedniej paczce usunięto już „300 zł”, „ogarnie temat” i „żadnego lania wody”. Te sformułowania nie zostały przywrócone.

| Miejsce | Poprzednio | Obecnie |
|---|---|---|
| O mnie, bio | Działam solo. Piszesz do mnie, rozmawiasz ze mną, projekt prowadzę ja. Bez pośredników... | Prowadzę projekty osobiście. Od pierwszej rozmowy po przekazanie materiałów masz bezpośredni kontakt ze mną. |
| O mnie, współpraca | Piszesz do mnie, rozmawiasz ze mną, projekt prowadzę ja. | Przez cały projekt współpracujesz bezpośrednio ze mną. |
| Strony WWW, proces | Ty znasz swoją firmę. Ja przekładam ją na dobrą stronę. | Jak wygląda współpraca przy stronie WWW? |
| Blog | O projektowaniu. Z praktyki. | O projektowaniu stron i wizerunku firm. |
| Karta filmu Hiker | Krótka forma promocyjna, która przenosi markę w naturalny, outdoorowy kontekst. | Film reklamowy prezentujący markę Hiker w otoczeniu gór i przyrody. |
| Karta identyfikacji Hiker | System logo i materiałów buduje spójny obraz marki na szlaku i w kontakcie z klientem. | Logo i materiały firmowe tworzą spójną identyfikację marki. |
| FAQ WordPress | Dlaczego nie WordPress? | Czy budujesz strony na WordPressie? Odpowiedź zaczyna się od potwierdzenia dostępności. |

Hero homepage oraz autentyczne cytaty klientów zachowano. Tekstów klienta o nowych usługach nie zmieniano merytorycznie. Długie pauzy zastąpiono zdaniami lub dwukropkami zgodnie z preferencją interpunkcyjną użytkownika. W odpowiedzi o WordPressie nie powielono ogólnej obietnicy, że statyczna strona nie wymaga aktualizacji bezpieczeństwa i zawsze jest szybsza.

## Sprawdzenie

Budowa statyczna: PASS. 9 stron HTML. Poprawne lokalne odsyłacze, kotwice, obrazy, CSS i JS. Unikalne canonical, obecność metadanych i poprawny JSON-LD. Nowe elementy nagłówka, stopki i powrotu obecne raz na każdej stronie. Siedem pytań w FAQ usługi, WordPress na pozycji 4. Brak numerów kategorii na /portfolio/.

Logikę strzałki sprawdzono w izolowanym teście JS: próg 400/401 px, powrót do zera, odtworzenie pozycji po pageshow, ograniczenie ruchu i przywracanie fokusu. To test logiki, nie pełny test przeglądarkowy. Generator Hiker nadal poprawnie koduje tekst i odrzuca niedozwolone ścieżki obrazów.

Materiały oceniono na podstawie przesłanych screenów i plików. Obejrzano pobraną grafikę Self-Invest (880 × 654). Nowa paczka nie została wyrenderowana w przeglądarce: lokalny dostęp pozostaje zablokowany, a otwarcie publicznego podglądu w narzędziu WWW zwróciło błąd. Odbiór wizualny desktop/mobile po aktualizacji Vercela pozostaje otwarty. Nie deklarujemy pełnego design-loop PASS.

## Do dostarczenia

Portret Krzysztofa, przykłady animacji/wideo do poszerzonej oferty, ostateczna lista portfolio. Obecny serwis nadal jest podglądem z noindex, częściowym EN i odsyłaczami do nieprzeniesionych szczegółów realizacji oraz polityki prywatności.

Self-Invest: https://grafmen.com/portfolio_logo_self-invest/
Grafika: https://grafmen.com/wp-content/uploads/2022/10/self_invest_ksiega_znaku_2.jpg
