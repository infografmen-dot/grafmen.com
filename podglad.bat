@echo off
if exist "%~dp0package.json" (
    cd /d "%~dp0"
) else if exist "D:\www\grafmen\aero\package.json" (
    cd /d "D:\www\grafmen\aero"
) else (
    echo [BLAD] Nie znaleziono katalogu projektu Grafmen.
    pause
    exit /b 1
)
title Grafmen - Podglad Lokalny Astro (dev)
echo ========================================================
echo   Uruchamianie lokalnego serwera Astro (dev)...
echo   Strona otworzy sie w przegladarce: http://localhost:4321/
echo ========================================================
echo.
timeout /t 2 /nobreak >nul
start http://localhost:4321/
call npm run dev
pause
