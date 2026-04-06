# Raspberry Pi Betrieb (Kurzreferenz)

## Voraussetzungen
- Raspberry Pi OS (Bullseye/Bookworm)
- Node.js 20+
- Netzwerkzugang im lokalen LAN

## Installation
```bash
cd /opt
sudo git clone <REPO_URL> baustellen-gantt
cd baustellen-gantt
npm install
cp .env.example .env
npm run seed
./scripts/baustellen-darstellung start
```

## TV-Darstellung im Vollbild (Chromium-Kiosk)
Beispiel für Autostart:
```bash
chromium-browser --kiosk --app=http://localhost:5173/tv
```

## Service-Modus
```bash
sudo cp systemd/baustellen-darstellung.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now baustellen-darstellung
```
