@echo off
start C:\PROGRA~1\Google\Chrome\Application\chrome.exe --remote-debugging-port=9224 --user-data-dir="%USERPROFILE%\.gemini\antigravity\scratch\chrome_aistudio_profile" "https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts" "http://localhost:4000"
exit
