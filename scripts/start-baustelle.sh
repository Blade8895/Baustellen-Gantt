#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/baustellen-darstellung" start

echo "Warte auf Webserver unter http://localhost:5173 ..."
until curl -fsS "http://localhost:5173/tv" > /dev/null; do
  sleep 2
done

echo "Webserver verfügbar, starte Chromium im Kiosk-Modus ..."
chromium --kiosk --app=http://localhost:5173/tv \
--noerrdialogs \
--disable-infobars \
--disable-session-crashed-bubble \
--incognito \
--no-first-run \
--disable-extensions \
--disable-dev-shm-usage \
--password-store=basic
