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
    manual_current_date TEXT,
    tv_resolution TEXT NOT NULL DEFAULT '1920x1080',
    tv_title TEXT NOT NULL DEFAULT 'Baustellen Übersicht',
    tv_subtitle TEXT NOT NULL DEFAULT 'Live vom lokalen System · Nur Anzeige',
    tv_show_page_indicator INTEGER NOT NULL DEFAULT 1,
    tv_logo_data_url TEXT,
    tv_playback_paused INTEGER NOT NULL DEFAULT 0,
    tv_pinned_page INTEGER,
    tv_pinned_until TEXT,
    layout_header_font_size INTEGER NOT NULL DEFAULT 16,
    layout_week_font_size INTEGER NOT NULL DEFAULT 12,
    layout_week_date_font_size INTEGER NOT NULL DEFAULT 11,
    layout_meta_font_size INTEGER NOT NULL DEFAULT 16,
    layout_period_font_size INTEGER NOT NULL DEFAULT 12,
    layout_site_column_min_width INTEGER NOT NULL DEFAULT 320,
    layout_timeline_lead_in INTEGER NOT NULL DEFAULT 12,
    layout_column_gap INTEGER NOT NULL DEFAULT 12,
    layout_tag_gap INTEGER NOT NULL DEFAULT 8,
    layout_status_tag_font_size INTEGER NOT NULL DEFAULT 12,
    layout_status_tag_padding_x INTEGER NOT NULL DEFAULT 8,
    layout_status_tag_padding_y INTEGER NOT NULL DEFAULT 2,
    layout_status_tag_border_radius INTEGER NOT NULL DEFAULT 6,
    layout_row_height INTEGER NOT NULL DEFAULT 0,
    layout_bold_text INTEGER NOT NULL DEFAULT 1
  );
`);

const appSettingsColumns = db.prepare('PRAGMA table_info(app_settings)').all();
const hasTvResolution = appSettingsColumns.some((column) => column.name === 'tv_resolution');
if (!hasTvResolution) {
  db.exec("ALTER TABLE app_settings ADD COLUMN tv_resolution TEXT NOT NULL DEFAULT '1920x1080';");
}
const hasTvTitle = appSettingsColumns.some((column) => column.name === 'tv_title');
if (!hasTvTitle) {
  db.exec("ALTER TABLE app_settings ADD COLUMN tv_title TEXT NOT NULL DEFAULT 'Baustellen Übersicht';");
}
const hasTvSubtitle = appSettingsColumns.some((column) => column.name === 'tv_subtitle');
if (!hasTvSubtitle) {
  db.exec("ALTER TABLE app_settings ADD COLUMN tv_subtitle TEXT NOT NULL DEFAULT 'Live vom lokalen System · Nur Anzeige';");
}
const hasTvShowPageIndicator = appSettingsColumns.some((column) => column.name === 'tv_show_page_indicator');
if (!hasTvShowPageIndicator) {
  db.exec('ALTER TABLE app_settings ADD COLUMN tv_show_page_indicator INTEGER NOT NULL DEFAULT 1;');
}
const hasTvLogoDataUrl = appSettingsColumns.some((column) => column.name === 'tv_logo_data_url');
if (!hasTvLogoDataUrl) {
  db.exec('ALTER TABLE app_settings ADD COLUMN tv_logo_data_url TEXT;');
}
const hasTvPlaybackPaused = appSettingsColumns.some((column) => column.name === 'tv_playback_paused');
if (!hasTvPlaybackPaused) db.exec('ALTER TABLE app_settings ADD COLUMN tv_playback_paused INTEGER NOT NULL DEFAULT 0;');
const hasTvPinnedPage = appSettingsColumns.some((column) => column.name === 'tv_pinned_page');
if (!hasTvPinnedPage) db.exec('ALTER TABLE app_settings ADD COLUMN tv_pinned_page INTEGER;');
const hasTvPinnedUntil = appSettingsColumns.some((column) => column.name === 'tv_pinned_until');
if (!hasTvPinnedUntil) db.exec('ALTER TABLE app_settings ADD COLUMN tv_pinned_until TEXT;');

const hasLayoutHeaderFontSize = appSettingsColumns.some((column) => column.name === 'layout_header_font_size');
if (!hasLayoutHeaderFontSize) db.exec('ALTER TABLE app_settings ADD COLUMN layout_header_font_size INTEGER NOT NULL DEFAULT 16;');
const hasLayoutWeekFontSize = appSettingsColumns.some((column) => column.name === 'layout_week_font_size');
if (!hasLayoutWeekFontSize) db.exec('ALTER TABLE app_settings ADD COLUMN layout_week_font_size INTEGER NOT NULL DEFAULT 12;');
const hasLayoutWeekDateFontSize = appSettingsColumns.some((column) => column.name === 'layout_week_date_font_size');
if (!hasLayoutWeekDateFontSize) db.exec('ALTER TABLE app_settings ADD COLUMN layout_week_date_font_size INTEGER NOT NULL DEFAULT 11;');
const hasLayoutMetaFontSize = appSettingsColumns.some((column) => column.name === 'layout_meta_font_size');
if (!hasLayoutMetaFontSize) db.exec('ALTER TABLE app_settings ADD COLUMN layout_meta_font_size INTEGER NOT NULL DEFAULT 16;');
const hasLayoutPeriodFontSize = appSettingsColumns.some((column) => column.name === 'layout_period_font_size');
if (!hasLayoutPeriodFontSize) db.exec('ALTER TABLE app_settings ADD COLUMN layout_period_font_size INTEGER NOT NULL DEFAULT 12;');
const hasLayoutSiteColumnMinWidth = appSettingsColumns.some((column) => column.name === 'layout_site_column_min_width');
if (!hasLayoutSiteColumnMinWidth) db.exec('ALTER TABLE app_settings ADD COLUMN layout_site_column_min_width INTEGER NOT NULL DEFAULT 320;');
const hasLayoutTimelineLeadIn = appSettingsColumns.some((column) => column.name === 'layout_timeline_lead_in');
if (!hasLayoutTimelineLeadIn) db.exec('ALTER TABLE app_settings ADD COLUMN layout_timeline_lead_in INTEGER NOT NULL DEFAULT 12;');
const hasLayoutColumnGap = appSettingsColumns.some((column) => column.name === 'layout_column_gap');
if (!hasLayoutColumnGap) db.exec('ALTER TABLE app_settings ADD COLUMN layout_column_gap INTEGER NOT NULL DEFAULT 12;');
const hasLayoutTagGap = appSettingsColumns.some((column) => column.name === 'layout_tag_gap');
if (!hasLayoutTagGap) db.exec('ALTER TABLE app_settings ADD COLUMN layout_tag_gap INTEGER NOT NULL DEFAULT 8;');
const hasLayoutStatusTagFontSize = appSettingsColumns.some((column) => column.name === 'layout_status_tag_font_size');
if (!hasLayoutStatusTagFontSize) db.exec('ALTER TABLE app_settings ADD COLUMN layout_status_tag_font_size INTEGER NOT NULL DEFAULT 12;');
const hasLayoutStatusTagPaddingX = appSettingsColumns.some((column) => column.name === 'layout_status_tag_padding_x');
if (!hasLayoutStatusTagPaddingX) db.exec('ALTER TABLE app_settings ADD COLUMN layout_status_tag_padding_x INTEGER NOT NULL DEFAULT 8;');
const hasLayoutStatusTagPaddingY = appSettingsColumns.some((column) => column.name === 'layout_status_tag_padding_y');
if (!hasLayoutStatusTagPaddingY) db.exec('ALTER TABLE app_settings ADD COLUMN layout_status_tag_padding_y INTEGER NOT NULL DEFAULT 2;');
const hasLayoutStatusTagBorderRadius = appSettingsColumns.some((column) => column.name === 'layout_status_tag_border_radius');
if (!hasLayoutStatusTagBorderRadius) db.exec('ALTER TABLE app_settings ADD COLUMN layout_status_tag_border_radius INTEGER NOT NULL DEFAULT 6;');
const hasLayoutRowHeight = appSettingsColumns.some((column) => column.name === 'layout_row_height');
if (!hasLayoutRowHeight) db.exec('ALTER TABLE app_settings ADD COLUMN layout_row_height INTEGER NOT NULL DEFAULT 0;');
const hasLayoutBoldText = appSettingsColumns.some((column) => column.name === 'layout_bold_text');
if (!hasLayoutBoldText) db.exec('ALTER TABLE app_settings ADD COLUMN layout_bold_text INTEGER NOT NULL DEFAULT 1;');

db.prepare(`
  INSERT INTO app_settings (
    id,
    display_months,
    tv_page_size,
    tv_page_switch_seconds,
    manual_current_date,
    tv_resolution,
    tv_title,
    tv_subtitle,
    tv_show_page_indicator,
    tv_logo_data_url,
    tv_playback_paused,
    tv_pinned_page,
    tv_pinned_until,
    layout_header_font_size,
    layout_week_font_size,
    layout_week_date_font_size,
    layout_meta_font_size,
    layout_period_font_size,
    layout_site_column_min_width,
    layout_timeline_lead_in,
    layout_column_gap,
    layout_tag_gap,
    layout_status_tag_font_size,
    layout_status_tag_padding_x,
    layout_status_tag_padding_y,
    layout_status_tag_border_radius,
    layout_row_height,
    layout_bold_text
  )
  VALUES (1, 3, 8, 60, NULL, '1920x1080', 'Baustellen Übersicht', 'Live vom lokalen System · Nur Anzeige', 1, NULL, 0, NULL, NULL, 16, 12, 11, 16, 12, 320, 12, 12, 8, 12, 8, 2, 6, 0, 1)
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
