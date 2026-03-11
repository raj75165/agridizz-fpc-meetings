@echo off
setlocal

REM ============================================================
REM  FPO ACCOUNTING SOFTWARE — Windows Setup
REM  Opens the app in the default browser.
REM ============================================================

set "SCRIPT_DIR=%~dp0"
set "INDEX=%SCRIPT_DIR%index.html"

if not exist "%INDEX%" (
    echo.
    echo  ERROR: index.html not found in %SCRIPT_DIR%
    echo  Please make sure setup.bat and index.html are in the same folder.
    echo.
    pause
    exit /b 1
)

echo Opening FPO ACCOUNTING SOFTWARE...
start "" "%INDEX%"
exit /b 0
