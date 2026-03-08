@echo off
setlocal

cd /d "%~dp0"
set "PORT=5500"

echo Opening http://localhost:%PORT%/
start "" "http://localhost:%PORT%/"

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Serving "%CD%" at http://localhost:%PORT%/
  echo Press Ctrl+C to stop.
  py -m http.server %PORT%
  goto :eof
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Serving "%CD%" at http://localhost:%PORT%/
  echo Press Ctrl+C to stop.
  python -m http.server %PORT%
  goto :eof
)

echo Python was not found.
echo Install Python from https://www.python.org/downloads/ and rerun this script.
pause
exit /b 1
