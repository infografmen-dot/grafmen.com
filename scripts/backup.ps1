<#
.SYNOPSIS
    Kopia zapasowa projektu Grafmen.com
.DESCRIPTION
    Uruchamia bezpieczną procedurę tworzenia kopii zapasowej (scripts/backup.mjs).
    Przyjmuje opcjonalne parametry ścieżki źródłowej i docelowej.
.PARAMETER SourceDir
    Katalog źródłowy projektu (domyślnie: bieżący katalog nadrzędny scripts).
.PARAMETER BackupDir
    Katalog bazowy kopii zapasowych (domyślnie: D:\www\grafmen\backups).
.EXAMPLE
    .\scripts\backup.ps1
.EXAMPLE
    .\scripts\backup.ps1 -BackupDir "E:\ZewnetrznyDysk\backups"
#>
param(
    [string]$SourceDir = "",
    [string]$BackupDir = "D:\www\grafmen\backups"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $SourceDir) {
    $SourceDir = (Resolve-Path (Join-Path $scriptDir "..")).Path
}

$mjsScript = Join-Path $scriptDir "backup.mjs"

if (-not (Test-Path $mjsScript)) {
    Write-Error "[BŁĄD] Nie znaleziono silnika backupu: $mjsScript"
    exit 1
}

# Uruchomienie silnika Node.js z parametrami
& node $mjsScript "$SourceDir" "$BackupDir"
exit $LASTEXITCODE
