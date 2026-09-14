# Hero — aktualna poprawka

## Wyrównanie pionowego zanikania po obu stronach

Na podstawie screenshotu 4cbe7bd0-6166-4e48-8df6-e0a45851d60b.png rozszerzono lewy relief: top 80→0 px i bottom 64→0 px. Skala obrazu pozostaje taka sama dzięki zmianie kompensacji background-size z +248 na +104 px. Lewy pas otrzymał tę samą pionową maskę 0%→8%→88%→100% oraz pozycję tła co prawy. Dzięki temu pokazuje kostki także w zaznaczonych górnym i dolnym obszarze. Zachowano opacity 0.48, szerokość i zanikanie przed tekstem. Zgodność parametrów zweryfikowana w CSS; bez nowego renderu Chrome.

## Subtelne kostki przy lewej krawędzi — na życzenie użytkownika

Dodano dekoracyjne hero::before korzystające z tego samego assets/cubes-bg.png. Pas przy lewej krawędzi ekranu ma maksymalnie 280 px (około 2–3 kolumny kostek), opacity 0.48 i dwie maski: zanikanie w prawo oraz u góry/dołu. Obraz nie jest odbity, więc zachowuje kierunek oświetlenia prawego reliefu. Tło mieści się wyłącznie w zewnętrznym marginesie i kończy co najmniej 56 px przed początkiem tekstu. Przy szerokości ekranu do 1392 px pas jest ukryty z braku miejsca. Działa w PL i EN; prawa grafika, teksty, tracking i układ portfolio bez zmian. Oceniono geometrię CSS; brak nowego renderu w przeglądarce.

Referencja: aktualna(5).png, 1672 × 941 px.

Zastąpiono wąski pas kostek czystym tłem uzyskanym z referencji. Poprawiono pozycjonowanie i maskę z czterech stron. Tło kończy się w obrębie hero i nie przykrywa menu. Pozostała zawartość strony jest bez zmian.

Sprawdzenie: wizualnie w Chrome przy szerokości 1348 px. Grafika pozostaje ukryta do 900 px zgodnie z dotychczasowym prototypem. To nadal prototyp; zgodność piksel w piksel z referencją nie została potwierdzona.

Podgląd: rozpakuj cały ZIP i otwórz index.html w Chrome.

## Asset
Edycja wbudowanym ImageGen. Prompt: Remove all foreground interface overlays, lettering, logos, menu, buttons, orange accents, lines, arrows, scroll icon and metadata. Inpaint white background while preserving existing cube geometry, positions, sizes, depths, face lighting, shadows and irregular silhouette. Keep framing and source aspect. Maintain blank left 60%, cube group spanning the right with its original variable extrusion and very pale shadows. Change only overlays; reconstruct hidden background only where necessary.

## Podgląd deweloperski (opcjonalny)
Pliki package.json i vite.config.js służą wyłącznie do podglądu przez Vite. Zwykłe otwarcie index.html nie wymaga Node ani instalacji.

## Zaakceptowane tło; korekta dolnego pasa
Użytkownik zaakceptował tło kostek. Trzy dolne elementy hero wyrównano pionowo do środka wspólnego pasa i zakotwiczono przy dolnej krawędzi hero (bottom: 0). Poprawiono konflikt specyficzności CSS, który wcześniej nadpisywał position: absolute. Mobilne ukrywanie pasa zachowane.

## Korekta odstępów i akcentów na życzenie użytkownika
Odstęp pod metryczką zwiększono z 34 do 58 px, co obniża nagłówek, opis i przyciski o 24 px. Minimalna wysokość hero wzrosła również o 24 px, zachowując przestrzeń przed dolnym pasem. Podkreślenie ma 6 px zamiast 3 px i jest podniesione (bottom: -2 px zamiast -8 px). Kwadrat po „stroną” wyrównano do linii bazowej tekstu. Sprawdzono wizualnie w Chrome.

## Dolny pas i odstęp liter — kolejna korekta
Zaznaczony pas trzech elementów obniżono o 40 px (bottom: -40 px). Finalna wartość odstępu liter h1: -0.050em. Przy font-size 92 px daje to -4.60 px; ustawienie zaakceptowane przez użytkownika. Sprawdzono wizualnie w Chrome; wartości px skalują się z responsywnym rozmiarem nagłówka.
