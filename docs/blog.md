# Blog: listing i szablon wpisu

Publiczny blog jest pusty zgodnie z zakresem zadania. Gotowy układ wpisu można obejrzeć w `blog-preview/index.html`. Przykładowy tekst nie jest publikowany.

## Pliki

- `../content/blog/posts.json`: lista artykułów, obecnie pusta.
- `../templates/blog-post.html`: wspólny szablon pojedynczego wpisu.
- `blog-post-example.json`: przykład danych z `published: false`.
- `../scripts/build-blog.py`: generator wykorzystujący wyłącznie standardową bibliotekę Python 3.
- `../content/blog/generated-pages.json`: lista plików wygenerowanych przez skrypt, używana przy wycofywaniu publikacji.

## Dodawanie artykułu

1. Skopiuj obiekt z przykładu do tablicy w `content/blog/posts.json`.
2. Ustaw własny `slug`, tytuł, opis, kategorię, datę i treść. W `body` dostępne są bloki `paragraph`, `heading` i `list`. Tekst jest automatycznie zabezpieczany przed interpretacją jako HTML.
3. Po przygotowaniu artykułu ustaw `published: true`.
4. W katalogu projektu uruchom `python scripts/build-blog.py`.
5. Otwórz wygenerowany `blog/<slug>/index.html` i listing bloga. Następnie przekaż pełną aktualną paczkę do publikacji.

Skrypt generuje title, opis, canonical, Open Graph, autora, datę oraz JSON-LD BlogPosting. Dodaje opublikowane wpisy do sitemap.xml. Opcjonalne pole `updated` przyjmuje datę w formacie YYYY-MM-DD.

Zmiana `published` na `false`, usunięcie wpisu z listy lub zmiana jego sluga usuwa stary HTML wygenerowany przez ten skrypt. Usunięty adres trzeba również usunąć na docelowym hostingu; zwykłe dogranie nowych plików przez FTP nie usuwa starych. Skrypt nie kasuje ręcznie przygotowanych stron ani obrazów. Przy zmianie opublikowanego adresu należy osobno przygotować przekierowanie na hostingu.

`python scripts/build-blog.py --preview` dodatkowo odtwarza demonstracyjny podgląd w docs. Podgląd ma noindex, bez canonical wskazującego fikcyjny wpis i bez danych BlogPosting; nie trafia do publicznego listingu ani sitemap.xml. Katalogów docs, templates, scripts i content nie trzeba publikować na hostingu.
