---
name: grafmen-backup
description: "Niezależna kopia zapasowa i procedura odtworzenia projektu Grafmen.com (Astro). Zabezpiecza kod roboczy, szkice CMS, zasoby, historię Git bundle, generuje manifest SHA-256 oraz umożliwia pełne odtworzenie projektu."
---

# Skill: Grafmen Backup & Recovery

Procedura tworzenia niezależnych, kompletnych i weryfikowanych kopii zapasowych serwisu `grafmen.com` (Astro).

## 1. Kiedy wykonać kopię zapasową
1. **Przed większymi zmianami:** aktualizacja zależności (`npm update`), migracja architektury, masowa edycja stylów lub skryptów.
2. **Przed i po publikacji / wdrożeniu:** przed operacjami na domenach w Vercel lub po domknięciu większego etapu prac.
3. **Cyklicznie podczas aktywnej pracy:** raz w tygodniu, jeśli w projekcie zaszły zmiany.
4. **Częściej:** po dodaniu lokalnych, nieopublikowanych artykułów blogowych lub szkiców w Keystatic CMS.
5. **Weryfikacja testowa:** próba odtworzenia na czystym katalogu raz w miesiącu.

## 2. Uruchomienie procedury tworzenia kopii
Skrypt automatycznie tworzy unikalny folder ze stemplem czasu, pakuje pełną historię Git (`git bundle`), kompresuje stan roboczy (`working-tree.tar.gz`), oblicza sumy SHA-256 oraz generuje `MANIFEST.json` i `ODTWORZENIE.md`.

### Polecenie (PowerShell / Terminal):
```powershell
node scripts/backup.mjs
```
lub za pomocą wrappera PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1
```

Domyślna lokalizacja zapisu: `D:\www\grafmen\backups\grafmen-backup-YYYY-MM-DD_HH-mm-ss\`.

## 3. Co zawiera każda kopia
* `git-history.bundle` – 100% niezależna kopia repozytorium Git (wszystkie branche, tagi, commit obiekty) weryfikowana przez `git bundle verify`.
* `working-tree.tar.gz` – pełny stan roboczy z momentu wykonania (w tym niezacommitowane zmiany, nieśledzone szkice blogowe, pliki `.md`, grafiki, fonty, wideo, `package-lock.json`).
* `checksums.sha256` – kryptograficzne sumy kontrolne SHA-256 obu archiwów.
* `MANIFEST.json` – metadane: branch, commit, lista plików brudnych, wersje Node/npm, parametry środowiska.
* `ODTWORZENIE.md` – samodzielna instrukcja przywrócenia witryny od zera.

*Wyłączenia:* odtwarzalne `node_modules/`, `.astro/`, `dist/`, `.git/` (zabezpieczone w bundle), pliki tymczasowe testów.

## 4. Przenoszenie na drugi nośnik
Kopia na tym samym dysku fizycznym chroni przed pomyłkami w kodzie, ale nie przed awarią sprzętową. Regularnie kopiuj utworzony folder `grafmen-backup-...` na:
* Zewnętrzny dysk USB / dysk sieciowy (NAS),
* Szyfrowany nośnik zewnętrzny.

## 5. Ważna uwaga o automatyzacji
Ten skill oraz system AntiGravity nie działają jako demon w tle, gdy aplikacja jest wyłączona. Automatyczne cykliczne kopie mogą być realizowane przez Harmonogram Zadań Windows (Task Scheduler) wywołujący `scripts/backup.ps1`.
