import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from './config.js';

const dbPath = path.resolve(process.cwd(), config.sqlitePath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

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
