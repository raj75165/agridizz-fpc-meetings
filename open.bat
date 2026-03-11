@echo off
:: FPO ACCOUNTING SOFTWARE — Windows Launcher
:: Double-click this file to open the app in your default browser.

set "DIR=%~dp0"
set "FILE=%DIR%index.html"

if not exist "%FILE%" (
    echo ERROR: index.html not found in "%DIR%"
    echo Make sure open.bat is in the same folder as index.html.
    pause
    exit /b 1
)

echo Opening FPO ACCOUNTING SOFTWARE...
start "" "%FILE%"
