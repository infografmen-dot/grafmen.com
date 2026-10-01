# Procedura Tworzenia Kopii Zapasowych i Odtwarzania Witryny Grafmen.com

Niniejszy dokument opisuje standard, procedurę wykonywania kopii zapasowych oraz instrukcję odzyskiwania projektu **Grafmen.com** (`D:\www\grafmen\aero`).

---

## 1. Filozofia i Architektura Kopii

Projekt Grafmen to nowoczesna witryna statyczna oparta o framework Astro, z lokalnym panelem CMS (Keystatic) do zarządzania treściami Markdown.

Kopia zapasowa projektu składa się z **dwóch niezależnych komponentów**:
1. **`git-history.bundle`** – pełne, samowystarczalne archiwum repozytorium Git (zawierające wszystkie gałęzie, tagi, commity i całą historię). Kopia jest weryfikowana kryptograficznie za pomocą polecenia `git bundle verify`.
2. **`working-tree.tar.gz`** – archiwum bieżącego drzewa roboczego. Zabezpiecza:
   - kod źródłowy i pliki konfiguracyjne,
   - **lokalne szkice artykułów blogowych i treści CMS** (nawet jeśli nie zostały jeszcze zacommitowane ani dodane do repozytorium),
   - wszystkie lokalne zasoby multimedialne (wideo mp4/webm, grafiki webp/png/svg, fonty woff2),
   - plik blokady zależności `package-lock.json` gwarantujący 100% powtarzalność instalacji,
   - skrypty pomocnicze, dokumentację i reguły projektu.

Każda kopia otrzymuje dedykowany folder ze znacznikiem czasu:
`D:\www\grafmen\backups\grafmen-backup-YYYY-MM-DD_HH-mm-ss\`

---

## 2. Co Obejmuje Kopia, a Czego NIE Obejmuje

### Obejmuje:
* Cały kod źródłowy (`src/`, `public/`, `assets/`, pliki konfiguracyjne).
* Wszystkie opublikowane artykuły oraz lokalne szkice w `src/content/blog/`.
* Pełną historię commits i branches Git (`git-history.bundle`).
* Konfigurację Keystatic CMS (`keystatic.config.ts`).
* Pliki pomocnicze podglądu (`podglad.bat`, `podglad-dist.bat`).
* Manifest metadanych (`MANIFEST.json`), sumy kontrolne (`checksums.sha256`) i instrukcję odtworzenia (`ODTWORZENIE.md`).

### Wyłączenia (pliki pomijane celowo):
* **Odtwarzalne katalogi robocze:** `node_modules/`, `.astro/`, `dist/`, `.vercel/`, katalogi tymczasowe testów.
* **Dane poufne i sekrety:** `.env`, `.env.*`, klucze prywatne `*.pem`, `*.key`. Te pliki nie mogą trafić do zwykłego archiwum. W razie ich posiadania należy zabezpieczyć je w menedżerze haseł (np. Bitwarden/1Password).

### Elementy Zewnętrzne (do odrębnego zabezpieczenia):
Kopia repozytorium nie zawiera i nie zastępuje konfiguracji zewnętrznych usług:
1. **Hosting Vercel:** konfiguracja projektu `grafmen-com`, przypisanie domen i nagłówki bezpieczeństwa.
2. **DNS i Poczta:** rekordy domeny (A, CNAME, MX, SPF, DKIM, DMARC) u rejestratora domeny.
3. **Web3Forms:** konfiguracja powiadomień e-mail i listy mailingowej w panelu dostawcy.
4. **Buffer:** zaplanowane publikacje w mediach społecznościowych.

---

## 3. Wykonywanie Kopii Zapasowej

Do wykonywania kopii służy zautomatyzowany skrypt (PowerShell / Node.js).

### Polecenie podstawowe:
W katalogu projektu (`D:\www\grafmen\aero`):
```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1
```
lub bezpośrednio przez Node.js:
```powershell
node scripts/backup.mjs
```

### Parametry opcjonalne:
Można wskazać inną lokalizację docelową (np. podłączony dysk zewnętrzny USB):
```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1 -BackupDir "E:\Backups\Grafmen"
```

### Zabezpieczenia wbudowane w skrypt:
* **Blokada zapisu wewnątrz projektu:** skrypt blokuje utworzenie katalogu kopii wewnątrz katalogu źródłowego (zapobiega pętli i puchnięciu archiwum).
* **Kontrola wolnego miejsca:** skrypt weryfikuje obecność minimum 500 MB wolnego miejsca na dysku docelowym przed rozpoczęciem pakowania.
* **Weryfikacja integralności:** automatycznie uruchamia `git bundle verify` oraz generuje sumy SHA-256.
* **Brak destrukcji:** skrypt nigdy nie usuwa ani nie nadpisuje wcześniejszych kopii.

---

## 4. Procedura Odtworzenia Projektu z Kopii (Krok po Kroku)

W przypadku konieczności przywrócenia witryny na nowym komputerze lub w nowym katalogu:

### Krok 1: Weryfikacja sum kontrolnych SHA-256
Przejdź do folderu wybranej kopii i zweryfikuj spójność plików:
```powershell
cd D:\www\grafmen\backups\grafmen-backup-2026-09-30_20-17-11
Get-FileHash -Path git-history.bundle -Algorithm SHA256
Get-FileHash -Path working-tree.tar.gz -Algorithm SHA256
```
Porównaj wartości z plikiem `checksums.sha256`.

### Krok 2: Odtworzenie repozytorium Git z pliku bundle
Utwórz nowy katalog docelowy i sklonuj do niego historię:
```powershell
mkdir D:\www\grafmen-odtworzony
cd D:\www\grafmen-odtworzony
git clone "D:/www/grafmen/backups/grafmen-backup-2026-09-30_20-17-11/git-history.bundle" .
git checkout main
```

### Krok 3: Nałożenie bieżących plików roboczych i szkiców
Rozpakuj archiwum robocze bezpośrednio do nowego katalogu:
```powershell
tar.exe -xzf "D:/www/grafmen/backups/grafmen-backup-2026-09-30_20-17-11/working-tree.tar.gz" -C .
```

### Krok 4: Czysta instalacja zależności
Zainstaluj pakiety dokładnie wg zablokowanych wersji:
```powershell
npm ci
```

### Krok 5: Weryfikacja kompilacji produkcyjnej
Skompiluj serwis:
```powershell
npm run build
```
Powinieneś zobaczyć pomyślne zbudowanie 69 podstron w katalogu `dist/` bez błędów.

### Krok 6: Podgląd lokalny
* **Podgląd wersji produkcyjnej:** `npm run preview` (lub uruchom `podglad-dist.bat`) -> `http://localhost:4321/`
* **Podgląd deweloperski z CMS:** `npm run dev` -> `http://localhost:4321/` oraz `http://localhost:4321/keystatic/`

---

## 5. Zasady Pracy na Przyszłość i Retencja

1. **Kiedy wykonywać kopię:**
   - Przed większymi zmianami w kodzie, aktualizacją zależności (`npm update`) lub masową edycją treści.
   - Po zakończeniu i przetestowaniu większego etapu prac projektowych.
   - Raz w tygodniu w okresie aktywnej pracy, jeśli nastąpiły modyfikacje plików.
   - Po dodaniu lokalnych, nieopublikowanych wpisów blogowych lub materiałów w CMS.
2. **Weryfikacja próbna:**
   - Raz w miesiącu wykonaj testowe odtworzenie do katalogu tymczasowego, aby potwierdzić poprawność procesu odzyskiwania.
3. **Zasada 3-2-1 i drugi nośnik:**
   - Kopia na dysku `D:\` chroni przed pomyłkami programistycznymi, ale **nie chroni przed fizyczną awarią dysku**.
   - Co najmniej raz w miesiącu skopiuj najnowszy folder backupu na zewnętrzny dysk USB lub sieciowy (NAS).
4. **Zalecana retencja kopii:**
   - Zachowuj ostatnie **4 kopie tygodniowe**,
   - Zachowuj ostatnie **3 kopie miesięczne**,
   - Zachowuj bezterminowo kopie z kluczowych wydań (np. uruchomienie domeny).
   - Nie stosujemy automatycznego kasowania kopii na tym etapie – archiwizacja jest selektywna i bezpieczna.

---

## 6. Propozycja Automatyzacji: Harmonogram Zadań Windows (Task Scheduler)

Skill w AntiGravity i sam asystent nie działają w tle po zamknięciu środowiska. Aby zapewnić regularne kopie niezależnie od pamięci człowieka, zaleca się skonfigurowanie zadania w systemie Windows.

> **Ważne:** Poniższe zadanie jest **propozycją do wdrożenia**. Zgodnie z regułami bezpieczeństwa nie zostało ono automatycznie zarejestrowane w Twoim systemie operacyjnym.

### Parametry proponowanego zadania:
* **Nazwa zadania:** `Grafmen-Weekly-Backup`
* **Program / skrypt:** `powershell.exe`
* **Argumenty:** `-ExecutionPolicy Bypass -WindowStyle Hidden -Command "& 'D:\www\grafmen\aero\scripts\backup.ps1' *>> 'D:\www\grafmen\backups\backup-task.log'"`
* **Harmonogram:** W każdą niedzielę o godzinie 22:00.
* **Gdy komputer jest wyłączony w chwili wywołania:** Włączona opcja *"Uruchom zadanie tak szybko, jak to możliwe po pominięciu zaplanowanego startu"* (Run task as soon as possible after a scheduled start is missed). Dzięki temu po włączeniu komputera w poniedziałek rano kopia wykona się automatycznie w tle.
* **Logowanie wyników i błędów:** `D:\www\grafmen\backups\backup-task.log`.

### Komenda do jednorazowej rejestracji zadania (do uruchomienia przez użytkownika, gdy podejmie taką decyzję):
```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -Command `\"& 'D:\www\grafmen\aero\scripts\backup.ps1' *>> 'D:\www\grafmen\backups\backup-task.log'`\""
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 22:00
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "Grafmen-Weekly-Backup" -Action $action -Trigger $trigger -Settings $settings -Description "Cykliczny tygodniowy backup projektu Grafmen.com"
```

---

## 7. Projektowy Skill AntiGravity

W projekcie skonfigurowano dedykowany skill workspace:
[SKILL.md](file:///D:/www/grafmen/aero/.agents/skills/grafmen-backup/SKILL.md)

Pozwala on każdemu asystentowi AI pracującemu nad repozytorium Grafmen natychmiast rozpoznać i wywołać procedurę bezpiecznego backupu przed rozpoczęciem inwazyjnych prac.
