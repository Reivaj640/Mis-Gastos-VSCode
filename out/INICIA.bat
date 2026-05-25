@echo off
title Mis Gastos - Control de Gastos
echo ============================================
echo    Mis Gastos - Control de Gastos Mensuales
echo ============================================
echo.
echo Iniciando servidor...
cd /d "%~dp0"

:: Kill only the process using port 8888
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8888" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

start /min python -m http.server 8888
timeout /t 2 /nobreak >nul
start http://localhost:8888
echo.
echo La aplicacion se abrio en tu navegador.
echo Si no ves cambios presiona Ctrl+Shift+R
echo Cierra esta ventana para detener el servidor.
echo.
pause >nul

:: Kill only the process using port 8888
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8888" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
