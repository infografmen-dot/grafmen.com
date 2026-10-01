# Instrukcja Uruchomienia Grafmen.com

## STAN WYJŚCIOWY
Stara strona jest statyczną kopią dawnej strony WordPress i już działa na Vercelu, w projekcie grafmen-old-site.
Nowa strona Astro znajduje się w projekcie grafmen-com, pod adresem grafmen-com.vercel.app.
Domeny grafmen.com oraz www.grafmen.com są obecnie przypisane do starego projektu.
Dotychczasowy kierunek przekierowania: grafmen.com → www.grafmen.com.
Przed wykonaniem przełączenia potwierdź ten stan w panelu Vercel.

## ZAKRES URUCHOMIENIA
Planowana operacja polega na przeniesieniu przypisania obu domen do nowego projektu Vercel.
Nie planuj migracji z hostingu OVH ani przywracania starego adresu 147.135.208.34. Jest to informacja historyczna, nie punkt powrotu.
DNS pozostaje bez zmian, o ile panel Vercel nie wykaże konkretnej konieczności jego aktualizacji. W takim przypadku przedstaw dokładny wymagany rekord i uzyskaj osobną zgodę przed zmianą.
Nie zmieniaj serwerów nazw ani rekordów poczty: MX, SPF, DKIM i DMARC.

## STAN DOCELOWY
https://grafmen.com/ obsługuje nowy projekt grafmen-com.
https://www.grafmen.com/ przekierowuje trwale na https://grafmen.com/, zachowując ścieżkę i parametry adresu.
Canonical, hreflang i sitemap są spójne z domeną grafmen.com.
Domena docelowa nie ma blokady noindex.
Adres roboczy grafmen-com.vercel.app zachowuje noindex.
Przekierowania starych ścieżek realizuje nowy projekt.

## NIEZALEŻNOŚĆ NOWEJ STRONY
Nie pobieraj treści, grafik ani innych zasobów ze starego projektu. Nowa strona ma działać samodzielnie.
Pozostaw stary projekt i jego repozytorium bez zmian jako możliwość powrotu. Nie usuwaj ich.

## PUNKT POWROTU
Przed przełączeniem zapisz:
- dokładny URL i identyfikator aktywnego deploymentu starego projektu;
- aktualne przypisanie obu domen i kierunek przekierowania;
- dokładny URL zaakceptowanego deploymentu nowego projektu.

Nagłówek x-vercel-id nie jest identyfikatorem deploymentu. Sam hash commita ani stały adres projektu również nie zastępują wskazania konkretnego deploymentu.
Plan powrotu ma przywracać przypisanie domen do starego projektu oraz poprzedni kierunek przekierowania. Nie może opierać się na historycznym IP OVH.

## WYKONANIE I KONTROLA
Po osobnej zgodzie użytkownika użyj dostępnej w panelu Vercel funkcji przeniesienia domen między projektami. Nie odpinaj domen z wyprzedzeniem.
Po przeniesieniu sprawdź:
- działanie HTTPS na obu domenach;
- nową stronę na grafmen.com;
- przekierowanie www oraz wybrane stare ścieżki;
- brak noindex na domenie docelowej i obecność noindex na adresie roboczym;
- formularze, blog i ładowanie zasobów.

Nie gwarantuj zerowej przerwy ani natychmiastowego przełączenia bez weryfikacji.

## ZGODA
Zapisanie tej instrukcji nie oznacza zgody na publikację, przenoszenie domen ani zmiany DNS.
