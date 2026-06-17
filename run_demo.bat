@echo off
REM Arcane Tic-Tac-Toe launcher
REM - If Python is available, starts a local HTTP server and opens the game in the default browser
REM - Otherwise opens index.html directly using the default browser

cd /d "%~dp0"
echo Launching Arcane Tic-Tac-Toe...

python --version >nul 2>&1
if %ERRORLEVEL%==0 (
  echo Found Python. Starting local HTTP server on port 8000...
  start "Arcane TTT Server" cmd /k "cd /d "%~dp0" && python -m http.server 8000"
  timeout /t 1 >nul
  start "" "http://localhost:8000/index.html"
  goto :eof
)

python3 --version >nul 2>&1
if %ERRORLEVEL%==0 (
  echo Found Python3. Starting local HTTP server on port 8000...
  start "Arcane TTT Server" cmd /k "cd /d "%~dp0" && python3 -m http.server 8000"
  timeout /t 1 >nul
  start "" "http://localhost:8000/index.html"
  goto :eof
)

REM No Python detected — open the HTML file directly
echo No Python detected; opening index.html directly.
start "" "%~dp0index.html"
exit /b 0
