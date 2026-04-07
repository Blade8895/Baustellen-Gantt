import dayjs from 'dayjs';
import { db } from './db.js';

const defaultSettings = {
  displayMonths: 3,
  tvPageSize: 8,
  tvPageSwitchSeconds: 60,
  manualCurrentDate: null,
  tvResolution: '1920x1080',
  tvTitle: 'Baustellen Übersicht',
  tvSubtitle: 'Live vom lokalen System · Nur Anzeige',
  tvShowPageIndicator: true,
  tvLogoDataUrl: null,
  layoutHeaderFontSize: 16,
  layoutWeekFontSize: 12,
  layoutWeekDateFontSize: 11,
  layoutMetaFontSize: 16,
  layoutPeriodFontSize: 12,
  layoutSiteColumnMinWidth: 320,
  layoutTimelineLeadIn: 12,
  layoutColumnGap: 12,
  layoutTagGap: 8,
  layoutStatusTagFontSize: 12,
  layoutStatusTagPaddingX: 8,
  layoutStatusTagPaddingY: 2,
  layoutStatusTagBorderRadius: 6,
  layoutRowHeight: 0,
  layoutBoldText: true,
};

const mapPeriodRow = (row) => ({
  id: row.id,
  startDate: row.start_date,
  endDate: row.end_date,
});

const mapSiteRow = (row, periods = []) => {
  const sortedPeriods = periods.sort((a, b) => a.startDate.localeCompare(b.startDate));
  const effectivePeriods = sortedPeriods.length > 0 ? sortedPeriods : [{ startDate: row.start_date, endDate: row.end_date }];

  return {
    id: row.id,
    name: row.name,
    customer: row.customer,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    description: row.description,
    color: row.color,
    category: row.category,
    periods: effectivePeriods,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const withComputedStatus = (site, referenceDate) => ({
  ...site,
  status: computeAutoStatus(site.periods, referenceDate),
});

const computeAutoStatus = (periods, referenceDate) => {
  if (!periods?.length) return 'geplant';

  const ref = dayjs(referenceDate).startOf('day');
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const firstStart = dayjs(sorted[0].startDate).startOf('day');
  const lastEnd = dayjs(sorted.at(-1).endDate).endOf('day');

  if (ref.isBefore(firstStart)) return 'geplant';
  if (ref.isAfter(lastEnd)) return 'fertig';

  const isActive = sorted.some((period) => {
    const start = dayjs(period.startDate).startOf('day');
    const end = dayjs(period.endDate).endOf('day');
    return (ref.isAfter(start) || ref.isSame(start)) && (ref.isBefore(end) || ref.isSame(end));
  });

  return isActive ? 'in_arbeit' : 'pausiert';
};

const getReferenceDate = () => {
  const stmt = db.prepare('SELECT manual_current_date as manualCurrentDate FROM app_settings WHERE id = 1');
  const row = stmt.get();
  return row?.manualCurrentDate || dayjs().format('YYYY-MM-DD');
};

const getPeriodsBySiteId = (siteId) => {
  const stmt = db.prepare('SELECT * FROM site_periods WHERE site_id = ? ORDER BY start_date ASC, id ASC');
  return stmt.all(siteId).map(mapPeriodRow);
};

const replacePeriods = (siteId, periods = []) => {
  db.prepare('DELETE FROM site_periods WHERE site_id = ?').run(siteId);
  const insert = db.prepare('INSERT INTO site_periods (site_id, start_date, end_date) VALUES (?, ?, ?)');
  for (const period of periods) {
    insert.run(siteId, period.startDate, period.endDate);
  }
};

export const getAllSites = () => {
  const rows = db.prepare('SELECT * FROM construction_sites ORDER BY start_date ASC, id ASC').all();
  const referenceDate = getReferenceDate();
  return rows
    .map((row) => mapSiteRow(row, getPeriodsBySiteId(row.id)))
    .map((site) => withComputedStatus(site, referenceDate));
};

export const getSiteById = (id) => {
  const row = db.prepare('SELECT * FROM construction_sites WHERE id = ?').get(id);
  if (!row) return null;
  const referenceDate = getReferenceDate();
  return withComputedStatus(mapSiteRow(row, getPeriodsBySiteId(id)), referenceDate);
};

export const createSite = (payload) => {
  const periods = payload.periods?.length
    ? payload.periods
    : [{ startDate: payload.startDate, endDate: payload.endDate }];
  const startDate = periods[0].startDate;
  const endDate = periods[periods.length - 1].endDate;

  const stmt = db.prepare(`
    INSERT INTO construction_sites (name, customer, location, start_date, end_date, status, description, color, category)
    VALUES (@name, @customer, @location, @startDate, @endDate, @status, @description, @color, @category)
  `);

  const result = stmt.run({ ...payload, startDate, endDate, status: 'geplant' });
  replacePeriods(result.lastInsertRowid, periods);
  return getSiteById(result.lastInsertRowid);
};

export const updateSite = (id, payload) => {
  const periods = payload.periods?.length
    ? payload.periods
    : [{ startDate: payload.startDate, endDate: payload.endDate }];
  const startDate = periods[0].startDate;
  const endDate = periods[periods.length - 1].endDate;

  const stmt = db.prepare(`
    UPDATE construction_sites
    SET name=@name,
        customer=@customer,
        location=@location,
        start_date=@startDate,
        end_date=@endDate,
        status=@status,
        description=@description,
        color=@color,
        category=@category
    WHERE id=@id
  `);

  stmt.run({ id, ...payload, startDate, endDate, status: 'geplant' });
  replacePeriods(id, periods);
  return getSiteById(id);
};

export const deleteSite = (id) => {
  const stmt = db.prepare('DELETE FROM construction_sites WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
};

export const getSettings = () => {
  const row = db.prepare('SELECT * FROM app_settings WHERE id = 1').get();
  if (!row) return defaultSettings;

  return {
    displayMonths: row.display_months,
    tvPageSize: row.tv_page_size,
    tvPageSwitchSeconds: row.tv_page_switch_seconds,
    manualCurrentDate: row.manual_current_date,
    tvResolution: row.tv_resolution || '1920x1080',
    tvTitle: row.tv_title || defaultSettings.tvTitle,
    tvSubtitle: row.tv_subtitle ?? defaultSettings.tvSubtitle,
    tvShowPageIndicator: typeof row.tv_show_page_indicator === 'number'
      ? row.tv_show_page_indicator === 1
      : defaultSettings.tvShowPageIndicator,
    tvLogoDataUrl: row.tv_logo_data_url || null,
    layoutHeaderFontSize: row.layout_header_font_size ?? defaultSettings.layoutHeaderFontSize,
    layoutWeekFontSize: row.layout_week_font_size ?? defaultSettings.layoutWeekFontSize,
    layoutWeekDateFontSize: row.layout_week_date_font_size ?? defaultSettings.layoutWeekDateFontSize,
    layoutMetaFontSize: row.layout_meta_font_size ?? defaultSettings.layoutMetaFontSize,
    layoutPeriodFontSize: row.layout_period_font_size ?? defaultSettings.layoutPeriodFontSize,
    layoutSiteColumnMinWidth: row.layout_site_column_min_width ?? defaultSettings.layoutSiteColumnMinWidth,
    layoutTimelineLeadIn: row.layout_timeline_lead_in ?? defaultSettings.layoutTimelineLeadIn,
    layoutColumnGap: row.layout_column_gap ?? defaultSettings.layoutColumnGap,
    layoutTagGap: row.layout_tag_gap ?? defaultSettings.layoutTagGap,
    layoutStatusTagFontSize: row.layout_status_tag_font_size ?? defaultSettings.layoutStatusTagFontSize,
    layoutStatusTagPaddingX: row.layout_status_tag_padding_x ?? defaultSettings.layoutStatusTagPaddingX,
    layoutStatusTagPaddingY: row.layout_status_tag_padding_y ?? defaultSettings.layoutStatusTagPaddingY,
    layoutStatusTagBorderRadius: row.layout_status_tag_border_radius ?? defaultSettings.layoutStatusTagBorderRadius,
    layoutRowHeight: row.layout_row_height ?? defaultSettings.layoutRowHeight,
    layoutBoldText: typeof row.layout_bold_text === 'number'
      ? row.layout_bold_text === 1
      : defaultSettings.layoutBoldText,
  };
};

export const updateSettings = (payload) => {
  const merged = { ...getSettings(), ...payload };
  const stmt = db.prepare(`
    UPDATE app_settings
    SET display_months=@displayMonths,
        tv_page_size=@tvPageSize,
        tv_page_switch_seconds=@tvPageSwitchSeconds,
        manual_current_date=@manualCurrentDate,
        tv_resolution=@tvResolution,
        tv_title=@tvTitle,
        tv_subtitle=@tvSubtitle,
        tv_show_page_indicator=@tvShowPageIndicator,
        tv_logo_data_url=@tvLogoDataUrl,
        layout_header_font_size=@layoutHeaderFontSize,
        layout_week_font_size=@layoutWeekFontSize,
        layout_week_date_font_size=@layoutWeekDateFontSize,
        layout_meta_font_size=@layoutMetaFontSize,
        layout_period_font_size=@layoutPeriodFontSize,
        layout_site_column_min_width=@layoutSiteColumnMinWidth,
        layout_timeline_lead_in=@layoutTimelineLeadIn,
        layout_column_gap=@layoutColumnGap,
        layout_tag_gap=@layoutTagGap,
        layout_status_tag_font_size=@layoutStatusTagFontSize,
        layout_status_tag_padding_x=@layoutStatusTagPaddingX,
        layout_status_tag_padding_y=@layoutStatusTagPaddingY,
        layout_status_tag_border_radius=@layoutStatusTagBorderRadius,
        layout_row_height=@layoutRowHeight,
        layout_bold_text=@layoutBoldText
    WHERE id = 1
  `);

  stmt.run({
    ...merged,
    tvShowPageIndicator: merged.tvShowPageIndicator ? 1 : 0,
    layoutBoldText: merged.layoutBoldText ? 1 : 0,
  });
  return getSettings();
};
