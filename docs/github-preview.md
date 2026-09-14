# GitHub i automatyczny podgląd

Docelowe repozytorium wskazane przez użytkownika: https://github.com/infografmen-dot/grafmen.com

Status: konfiguracja przygotowana lokalnie. Próba pobrania repozytorium zakończyła się błędem HTTP 502. Repozytorium nie zostało pobrane ani zmienione. Brak potwierdzonego dostępu do zapisu przez integrację GitHub; Vercel nie jest jeszcze połączony z repozytorium. Ten dokument nie potwierdza działającego wdrożenia.

## Pierwsze połączenie

1. Zainstalować integrację GitHub w rozmowie i połączyć konto z dostępem do tego repozytorium. Następnie sprawdzić rzeczywiste możliwości zapisu.
2. Odczytać istniejącą zawartość repozytorium i dopiero wtedy przesłać aktualny projekt, zachowując ewentualne wcześniejsze pliki i historię.
3. Zaimportować repozytorium w Vercel jako osobny projekt testowy. Plik vercel.json określa komendę przygotowania strony i katalog wynikowy.
4. Sprawdzić dostęp do adresu podglądu w przeglądarce używanej do oceny. Samo wdrożenie nie potwierdza dostępności, gdy wymaga logowania lub innych uprawnień.
5. Po każdej przesłanej zmianie integracja Vercel z GitHub uruchamia nowe wdrożenie. Każdą ocenę design-loop należy powiązać z konkretną wersją kodu i renderem.

## Prosta technologia

HTML, CSS, JavaScript, lokalne obrazy i fonty. Skrypt build-site.mjs tylko kopiuje potrzebne pliki do dist; nie kompiluje frameworka i nie wymaga instalowania zależności. Vite pozostaje opcjonalnym narzędziem lokalnego podglądu.

`npm run build` przygotowuje katalog dist. Zawiera stronę i jej zasoby, bez dokumentacji, szablonów, skryptów i plików roboczych. Wpisy blogowe muszą być wcześniej wygenerowane poleceniem opisanym w docs/blog.md. Generator bloga jest narzędziem autora, nie działa w przeglądarce odbiorcy.

Konfiguracja Vercel dotyczy wersji testowej i dodaje noindex do odpowiedzi. Noindex nie zapewnia prywatności. Przed docelową publikacją trzeba usunąć tę regułę oraz zakończyć kontrolę strony i plan migracji.

Nie wskazano jeszcze produkcyjnej domeny w konfiguracji. Historia i cofanie zmian są obsługiwane przez Git oraz hosting po ich rzeczywistym połączeniu.

Dokumentacja: https://vercel.com/docs/git/vercel-for-github oraz https://vercel.com/docs/project-configuration/vercel-json
