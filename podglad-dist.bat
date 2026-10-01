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
title Grafmen - Podglad Wersji Produkcyjnej (dist)
echo ========================================================
echo   Grafmen - Podglad czystej wersji produkcyjnej (dist)
echo   Pasek Astro Dev Toolbar nie wystepuje w tym trybie.
echo ========================================================
echo.
echo Budowanie najnowszej wersji strony (ok. 2-3 sekundy)...
call npm run build
if errorlevel 1 (
    echo.
    echo [BLAD] Budowanie zakonczone niepowodzeniem.
    pause
    exit /b 1
)
echo.
echo Uruchamianie serwera produkcyjnego...
echo Strona otworzy sie w przegladarce: http://localhost:4321/
echo.
timeout /t 2 /nobreak >nul
start http://localhost:4321/
call npm run preview
pause

