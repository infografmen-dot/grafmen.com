@echo off
title Grafmen - Podglad Wersji Zbudowanej (dist)
echo ========================================================
echo   Grafmen - Podglad czystej wersji produkcyjnej (dist)
echo   Pasek Astro Dev Toolbar nie wystepuje w tym trybie.
echo   Strona otworzy sie w przegladarce: http://localhost:4321/
echo ========================================================
echo.
timeout /t 2 /nobreak >nul
start http://localhost:4321/
call npm run preview
pause
