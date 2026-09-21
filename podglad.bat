@echo off
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
