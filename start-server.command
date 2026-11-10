#!/bin/bash
# Dobbeltklikk for å kjøre MIAN Coffee lokalt på http://localhost:8000
cd "$(dirname "$0")" || exit 1
PORT=8000
if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT er allerede i bruk, serveren kjører kanskje allerede: http://localhost:$PORT"
  open "http://localhost:$PORT"; exit 0
fi
echo "MIAN Coffee kjører på http://localhost:$PORT"
echo "La dette vinduet stå åpent. Lukk det, eller trykk Ctrl+C, for å stoppe."
(sleep 1; open "http://localhost:$PORT") &
if xcode-select -p >/dev/null 2>&1 || [ -x /opt/homebrew/bin/python3 ] || [ -x /usr/local/bin/python3 ]; then
  exec python3 -m http.server $PORT
elif command -v npx >/dev/null 2>&1; then
  exec npx --yes serve -l $PORT .
else
  echo "Fant verken Python eller Node. Installer «Command Line Tools» med: xcode-select --install"
  xcode-select --install
  read -r -p "Trykk Enter for å lukke"
fi
