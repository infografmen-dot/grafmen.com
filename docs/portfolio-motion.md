# Grafmen: sześć animowanych kart portfolio

Wersja do oceny: 14 września 2026.

## Co zostało wykonane

Sześć gotowych pętli po 8 sekund, każda w MP4 i WebM, bez dźwięku, z nieruchomym obrazem zastępczym WebP. Animacje są już podłączone do sześciu istniejących kart na stronie głównej. Rozmiary kart, ich asymetryczne rozmieszczenie, podpisy i docelowe linki zostały zachowane.

To autorskie animacje z materiałów Grafmen, inspirowane sposobem prezentacji Ramotion. Nie są kopią ich konkretnych filmów. Ramotion pokazuje własne interfejsy, fotografie i materiały marki; do identycznego poziomu szczegółowości potrzebne byłyby również nasze projekty rozdzielone na warstwy, większe zrzuty i źródłowe ujęcia. Ta pierwsza wersja korzysta z rzeczywistych plików dostępnych w projekcie.

## Co przejmujemy z referencji

Na stronie https://www.ramotion.com/ sprawdzono asymetryczną siatkę realizacji i elementy wideo portfolio. Karty korzystają z MP4, zapętlenia, wyciszenia, odtwarzania inline i obrazu poster. Własne animacje Grafmen stosują tę samą zasadę: projekt pozostaje głównym bohaterem, ruch odbywa się wewnątrz karty, a podpis pozostaje nieruchomy. Nie kopiujemy materiałów Ramotion.

## Wspólne zasady ruchu

- 8 sekund i 30 klatek na sekundę; brak dźwięku.
- Przesunięcia zwalniają na początku i końcu: funkcja smoothstep `3x² − 2x³`.
- Pętla wraca do tego samego obrazu. Pierwsza i ostatnia klatka renderera są identyczne. Kompresja może wprowadzić minimalną różnicę pikseli.
- Brak ramek przeglądarki, kursorów udających interakcję i przypadkowych efektów.
- Kierunki opisano względem widza. Podane piksele dotyczą rozdzielczości pliku, nie CSS w przeglądarce.
- Odtwarzają się tylko widoczne karty. Nie należy wymuszać równoczesnego startu sześciu filmów.
- Nad siatką znajduje się przycisk „Wstrzymaj animacje”. Ustawienia ograniczenia ruchu i oszczędzania danych domyślnie pozostawiają obrazy statyczne. Użytkownik może świadomie włączyć animację.

## 1. Drewmax.pro: ekran i detal oferty

**Pliki:** `assets/motion/drewmax.mp4` i `.webm`. **Format:** 1280 × 720.
**Materiały:** istniejący angielski screenshot `drewmax-site-en.png`.

| Czas | Obraz i ruch |
|---|---|
| 0–1,2 s | Pełny angielski ekran. Bez ruchu, żeby odczytać markę i główny nagłówek. |
| 1,2–2,5 s | Cały ekran zmniejsza się ze 100% do 77% szerokości. Przesuwa się w lewo do x = −166 px i w dół do y = 86 px. Odsłania jasne, neutralne tło. |
| 1,2–2,5 s | Równolegle z prawej wjeżdża wycięty z tego samego screena detal hero. Jego lewa krawędź przesuwa się z x = 1330 px do x = 666 px. Karta ma około 653 px szerokości; nie dodajemy paska przeglądarki. |
| 2,5–5,8 s | Spokojne zatrzymanie kompozycji: szerszy kontekst po lewej, detal po prawej. |
| 5,8–7,4 s | Detal wyjeżdża w prawo. Pełny ekran wraca do pierwotnego rozmiaru i położenia. |
| 7,4–8 s | Pełny ekran nieruchomy, taki sam jak na początku. Ponowny start bez skoku. |

**Cel:** pokazać projekt jako dopracowany interfejs, a nie statyczny obrazek. Język angielski pozostaje zachowany.

## 2. Film Hiker: spokojny teaser krajobrazowy

**Pliki:** `assets/motion/hiker-film.mp4` i `.webm`. **Format:** 960 × 540.
**Materiał:** `film-hiker.png` z logo widocznym w oryginalnym kadrze.

| Czas | Obraz i ruch |
|---|---|
| 0–0,5 s | Szeroki kadr górskiej doliny, minimalnie powiększony do 103,5%, żeby nie odsłonić krawędzi. |
| 0,5–4 s | Powolny najazd do 107,5% obrazu. Jednocześnie przesunięcie w lewo do około 16 px i w dół do 3 px. |
| 4–7,5 s | Bardzo łagodny powrót tą samą trajektorią. Zmiana kierunku bez zatrzymania i szarpnięcia. |
| 7,5–8 s | Powrót do wyjściowego kadru i krótka pauza. |

**Cel:** oddech między bardziej graficznymi animacjami. Logo nie pulsuje osobno, nie dodajemy sztucznego ruchu człowieka, trawy czy wody.

**Ważne:** to animowany teaser z fotografii, nie fragment oryginalnego filmu i nie prawdziwa paralaksa 3D. Kliknięcie nadal prowadzi do pełnego filmu na YouTube. Po dostarczeniu oryginalnego MP4 można zastąpić ten plik ośmiosekundowym montażem prawdziwych ujęć; kod strony pozostanie bez zmian.

## 3. szkola.best: cała strona, następnie przekaz i zdjęcie

**Pliki:** `assets/motion/best.mp4` i `.webm`. **Format:** 960 × 720.
**Materiał:** ostry screenshot użytkownika, przycięty do górnych 950 px, aby usunąć dolny baner cookies i widżety.

| Czas | Obraz i ruch |
|---|---|
| 0–1,4 s | Widok całego pierwszego ekranu na jasnym tle. Widoczne menu, nagłówek, przyciski i fotografia. |
| 1,4–2,3 s | Odsłonięcie drugiej kompozycji od prawej do lewej. Granatowe tło marki i mniejszy ekran zajmujący 86% szerokości. To powierzchnia kompozycyjna, nie ramka przeglądarki. |
| 2,3–3,8 s | Pauza na pełny widok strony z oddechem dookoła. |
| 3,8–4,7 s | Odsłonięcie z dołu ku górze. Po lewej zbliżenie prawdziwego nagłówka i przycisków, po prawej większy fragment fotografii z tej samej strony. |
| 4,7–6,4 s | Fotografia przesuwa się delikatnie w lewo o 14 px. Nagłówek pozostaje nieruchomy. |
| 6,4–7,5 s | Łagodne przenikanie do pierwszej kompozycji. |
| 7,5–8 s | Krótka pauza na pełnym ekranie, zapewniająca płynną pętlę. |

**Cel:** czytelne pokazanie komunikatu i emocji fotografii. Nie przedstawiamy wycinka jako nieistniejącej wersji mobilnej.

## 4. Hiker: system identyfikacji w trzech odsłonach

**Pliki:** `assets/motion/hiker-brand.mp4` i `.webm`. **Format:** 960 × 720.
**Materiały:** istniejące wizualizacje materiałów, palety i konstrukcji znaku.

| Czas | Obraz i ruch |
|---|---|
| 0–1,4 s | Duża wizualizacja materiałów Hiker: koperty, wizytówki i elementy drukowane. |
| 1,4–2,3 s | Od prawej do lewej wchodzi plansza z paletą i typografią. Cała plansza pozostaje nieruchoma, przesuwa się tylko granica odsłonięcia. |
| 2,3–3,8 s | Zatrzymanie na kolorach i typografii. |
| 3,8–4,7 s | Od dołu w górę odsłania się plansza konstrukcji znaku na tle leśnym. |
| 4,7–6,4 s | Zatrzymanie na znaku, jego wariantach i zastosowaniu w kontekście outdoorowym. |
| 6,4–7,5 s | Przenikanie z powrotem do wizualizacji materiałów. |
| 7,5–8 s | Pierwotna kompozycja bez ruchu. |

**Cel:** w jednej karcie pokazać system identyfikacji, nie tylko pojedyncze logo. Nie dodajemy fikcyjnych materiałów ani rezultatów biznesowych.

## 5. Drew-Art: trzy niezależnie przesuwające się ekrany

**Pliki:** `assets/motion/drew-art.mp4` i `.webm`. **Format:** 1000 × 700.
**Materiał:** trzy rzeczywiste fragmenty stron wycięte z istniejącej wizualizacji Drew-Art. Ich źródłowa jakość ogranicza możliwość dużego zbliżenia.

| Czas | Obraz i ruch |
|---|---|
| 0–0,35 s | Oryginalna kompozycja projektu. |
| 0,35–0,9 s | Krótkie przenikanie do kompozycji z osobnymi warstwami. |
| 1–2,3 s | Lewy ekran przesuwa się w lewo i do góry: z (46,32) do (−80,−35), szerokość 432 → 570 px. |
| 1–2,3 s | Prawy ekran przesuwa się w prawo i w dół: z (510,61) do (595,110), szerokość 430 → 500 px. |
| 1–2,3 s | Ekran pierwszoplanowy wysuwa się do góry i lekko w lewo: z (201,399) do (145,280), szerokość 449 → 710 px. |
| 2,3–5,9 s | Stabilna, warstwowa kompozycja. Pierwszy plan wyraźniejszy, pozostałe ekrany budują kontekst. |
| 5,9–7,4 s | Wszystkie trzy ekrany wracają po swoich trajektoriach do punktów startowych. |
| 7,3–7,8 s | Przenikanie do oryginalnej wizualizacji, żeby wyrównać także istniejące cienie. |
| 7,8–8 s | Nieruchomy kadr identyczny z początkowym. |

**Cel:** przestrzenność uzyskana ruchem 2D i subtelnym cieniem. Bez wyginania strony, sztucznej perspektywy i pasków przeglądarki.

## 6. JD Ubezpieczenia: znak, kolor i detal

**Pliki:** `assets/motion/jd.mp4` i `.webm`. **Format:** 1000 × 700.
**Materiał:** istniejący znak JD. Nie zmieniamy proporcji ani konstrukcji logo.

| Czas | Obraz i ruch |
|---|---|
| 0–1,4 s | Pełny znak na oryginalnym jasnoszarym tle. |
| 1,4–2,3 s | Odsłonięcie od prawej do lewej: pełny znak po lewej, dwa pola kolorów po prawej. Zieleń u góry, żółty poniżej. |
| 2,3–3,8 s | Zatrzymanie na zestawieniu logo i kolorystyki. |
| 3,8–4,7 s | Od dołu w górę odsłania się kompozycja detalu: powiększony motyw ochrony po lewej i pełny, mniejszy znak po prawej. |
| 4,7–6,4 s | Oba elementy pozostają nieruchome, aby zachować czytelność. |
| 6,4–7,5 s | Przenikanie do pełnego znaku na pierwotnym tle. |
| 7,5–8 s | Pauza domykająca pętlę. |

**Cel:** pokazać ideę ochrony oraz rozpoznawalny kolor. Rozdzielenie znaku na animowane krzywe wymagałoby pliku wektorowego; nie udajemy go na bazie bitmapy.

## Bezpłatne wykonanie i późniejsze zmiany

Wybrana metoda: **Python + Pillow + FFmpeg**. Nie korzysta z płatnej usługi, abonamentu, tokenów ani generatora wideo. Nie dodaje znaku wodnego. Koszt to czas renderowania na komputerze.

1. Zainstaluj Python 3 i FFmpeg, jeżeli ich jeszcze nie masz. FFmpeg musi być dostępny w PATH.
2. Zainstaluj bibliotekę obrazów: `python -m pip install Pillow`.
3. W głównym katalogu projektu uruchom `python scripts/render-portfolio-motion.py`.
4. Powstaną pliki w `assets/motion/`. Możesz też renderować pojedynczy projekt, np. `python scripts/render-portfolio-motion.py drewmax`.
5. Po zmianie materiałów lub czasów ponownie uruchom skrypt. Następnie wgraj zaktualizowane pliki tak jak dotychczas. Renderowanie nie jest wykonywane przy otwieraniu strony ani podczas budowania Vercel.

Źródło: https://ffmpeg.org/about.html. FFmpeg jest wolnym oprogramowaniem. W paczce znajduje się kod renderera, nie jego binarna dystrybucja.

## Dlaczego MP4/WebM, a nie tylko CSS

CSS wystarczyłby do przesuwania dwóch zrzutów, delikatnego skalowania czy animacji wektorowego logo. W sześciu różnych kompozycjach wymagałby jednak osobnych warstw HTML, masek i dopasowania ich do rozmiarów kart. Wideo utrwala kompozycję i kolejność ruchów. Na stronie pozostaje tylko odtwarzanie.

Każda karta ma źródło WebM/VP9 oraz zapasowe MP4/H.264. Przeglądarka wybiera wspierany format; nie powinna pobierać obu wersji. Filmy nie mają ścieżki audio, mają `muted`, `loop`, `playsinline`. Źródła ładowane są dopiero przy wejściu karty w obszar widoczny. Ograniczenia autoplay mogą nadal zależeć od przeglądarki; dlatego zostawiono statyczne obrazy i możliwość świadomego włączenia ruchu.

Źródło zasad autoplay: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay.

## Podgląd i zakres odbioru

Otwórz `docs/motion-preview.html`, aby obejrzeć wszystkie pliki z kontrolkami. Na stronie głównej działają one jako dekoracyjne tła kart. Są też obrazy kontrolne klatek 0, 2, 4 i 6 s w `docs/motion/`.

Sprawdzono lokalnie wygenerowane klatki, parametry kodeków, długość, brak dźwięku, ciągłość pętli i obecność źródeł w paczce. Sprawdzono kod sterujący odtwarzaniem oraz budowanie strony. Pełny odbiór zachowania w przeglądarce na nowym wdrożeniu wymaga jeszcze wgrania tej paczki na podgląd Vercel. Bieżący publiczny adres nie jest automatycznie aktualizowany.

Grafmen pozostaje stroną statyczną bez CMS. Aktualizacja dotyczy wyłącznie animacji portfolio na homepage; zachowuje wcześniej przygotowane poprawki rundy 2.
