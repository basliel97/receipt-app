@echo off
title Receipt App - Local Print Bridge
echo Starting Receipt App Local Print Bridge...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0print-bridge.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Bridge encountered an error. Press any key to exit.
    pause >nul
)
