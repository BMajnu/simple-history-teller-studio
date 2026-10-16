@echo off
title Launch Chrome with CDP Remote Debugging (Port 9224)
cd /d "%~dp0"

echo ========================================================
echo   Enabling Chrome Remote Debugging Port 9224
echo   Restoring your tabs and active Google logins...
echo ========================================================

taskkill /F /IM chrome.exe >nul 2>nul
timeout /t 1 >nul

start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9224 --restore-last-session "https://flow.google.com/" "https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts" "http://localhost:4000"

echo.
echo Chrome has been launched with Remote Debugging on port 9224!
echo The Daemon server on 127.0.0.1:9333 will now automatically connect.
timeout /t 3
