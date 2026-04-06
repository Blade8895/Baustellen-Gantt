import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from './config.js';

const dbPath = path.resolve(process.cwd(), config.sqlitePath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS construction_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    customer TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    category TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS site_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    FOREIGN KEY(site_id) REFERENCES construction_sites(id) ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    display_months INTEGER NOT NULL DEFAULT 3,
    tv_page_size INTEGER NOT NULL DEFAULT 8,
    tv_page_switch_seconds INTEGER NOT NULL DEFAULT 60,
    manual_current_date TEXT
  );
`);

db.prepare(`
  INSERT INTO app_settings (id, display_months, tv_page_size, tv_page_switch_seconds, manual_current_date)
  VALUES (1, 3, 8, 60, NULL)
  ON CONFLICT(id) DO NOTHING
`).run();

const missingPeriodsStmt = db.prepare(`
  SELECT id, start_date, end_date
  FROM construction_sites
  WHERE id NOT IN (SELECT DISTINCT site_id FROM site_periods)
`);

const seedPeriods = db.prepare(`
  INSERT INTO site_periods (site_id, start_date, end_date)
  VALUES (?, ?, ?)
`);

for (const site of missingPeriodsStmt.all()) {
  seedPeriods.run(site.id, site.start_date, site.end_date);
}

const updateTimestampTrigger = `
  CREATE TRIGGER IF NOT EXISTS trg_sites_updated_at
  AFTER UPDATE ON construction_sites
  FOR EACH ROW
  BEGIN
    UPDATE construction_sites
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
  END;
`;
db.exec(updateTimestampTrigger);
