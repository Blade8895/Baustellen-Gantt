# Baustellen Gantt (lokal, Raspberry Pi ready)

Modernes Full-Stack-System zur Darstellung und Verwaltung von Baustellen als Gantt-Diagramm im Dark Theme.

## Funktionen
- **User-Ansicht** (`/`): CRUD für Baustellen mit Validierung
- **RaspberryPi-/TV-Ansicht** (`/tv`): reine Anzeige als modernes Gantt-Board
- **Live-Updates** per Socket.IO (Änderungen ohne manuelles Reload)
- **Backend** mit Express + SQLite + Zod
- **Frontend** mit React + Vite + Tailwind

## Projektstruktur
```text
.
├── backend
│   ├── data/
│   ├── src/
│   │   ├── config.js
│   │   ├── db.js
│   │   ├── repository.js
│   │   ├── seed.js
│   │   ├── server.js
│   │   └── validation.js
│   └── package.json
├── frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GanttChart.jsx
│   │   │   ├── SiteForm.jsx
│   │   │   └── SiteTable.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── utils.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── scripts/baustellen-darstellung
├── systemd/baustellen-darstellung.service
├── docker-compose.yml
├── .env.example
└── package.json
```

## Schnellstart (lokal)
1. Node.js 20 installieren.
2. Projekt installieren:
   ```bash
   npm install
   ```
3. Env-Datei anlegen:
   ```bash
   cp .env.example .env
   ```
4. Beispieldaten einspielen:
   ```bash
   npm run seed
   ```
5. Stack starten:
   ```bash
   ./scripts/baustellen-darstellung start
   ```
6. Aufrufen:
   - User-Ansicht: `http://<PI-ODER-PC-IP>:5173/`
   - TV-Ansicht: `http://<PI-ODER-PC-IP>:5173/tv`

## Betriebskommandos
```bash
./scripts/baustellen-darstellung start
./scripts/baustellen-darstellung stop
./scripts/baustellen-darstellung restart
./scripts/baustellen-darstellung status
```

## Raspberry Pi Setup (empfohlen)
1. Repo nach `/opt/baustellen-gantt` kopieren.
2. `npm install` und `cp .env.example .env` ausführen.
3. optional `npm run seed`.
4. Systemd-Service installieren:
   ```bash
   sudo cp systemd/baustellen-darstellung.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable baustellen-darstellung
   sudo systemctl start baustellen-darstellung
   sudo systemctl status baustellen-darstellung
   ```
5. Für TV-Mode im Kiosk z. B. Chromium mit URL `http://localhost:5173/tv` im Autostart nutzen.

## Docker (optional)
```bash
docker compose up -d
```

## Hinweise
- Volle Offline-/LAN-Nutzung, keine Cloud-Abhängigkeiten.
- SQLite-Datenbank liegt unter `backend/data/baustellen.db`.
- Änderungen werden live an alle verbundenen Clients übertragen.
