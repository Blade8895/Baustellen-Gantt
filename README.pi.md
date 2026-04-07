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
Empfohlenes Autostart-Skript:
```bash
/opt/baustellen-gantt/scripts/start-baustelle.sh
```

Das Skript startet erst Backend + Frontend und öffnet Chromium erst, wenn `http://localhost:5173/tv` erreichbar ist.

## Service-Modus
```bash
sudo cp systemd/baustellen-darstellung.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now baustellen-darstellung
```
