import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Fragment } from 'react';
import { clampDays, nextMonthsRange, statusBadgeClass, statusLabel } from '../utils.js';

dayjs.extend(isoWeek);

const weekTicks = (start, end) => {
  const ticks = [];
  let cursor = start.startOf('isoWeek');
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    ticks.push(cursor);
    cursor = cursor.add(1, 'week');
  }
  return ticks;
};

const weekRangeLabel = (startDate, endDate) => {
  const startWeek = dayjs(startDate).isoWeek();
  const endWeek = dayjs(endDate).isoWeek();

  if (startWeek === endWeek) {
    return `KW${startWeek}`;
  }

  return `KW${startWeek} - KW${endWeek}`;
};

const weekDateRangeLabel = (weekStart, chartEnd) => {
  const calculatedWeekEnd = weekStart.endOf('isoWeek');
  const weekEnd = calculatedWeekEnd.isAfter(chartEnd, 'day') ? chartEnd : calculatedWeekEnd;
  return `${weekStart.format('DD.MM.')} bis ${weekEnd.format('DD.MM.')}`;
};

const parseResolution = (value = '1920x1080') => {
  const [width, height] = value.split('x').map((part) => Number(part));
  if (!width || !height) return { width: 1920, height: 1080 };
  return { width, height };
};

export default function GanttChart({ sites, dense = false, displayMonths = 3, referenceDate, tvResolution = '1920x1080', tvPageSize = 8 }) {
  const { start, end } = nextMonthsRange(displayMonths, referenceDate);
  const totalDays = end.diff(start, 'day') + 1;
  const ticks = weekTicks(start, end);
  const resolution = parseResolution(tvResolution);
  const monthScale = Math.min(1, 3 / Math.max(3, displayMonths));
  const resolutionScale = Math.min(1, resolution.width / 1920, resolution.height / 1080);
  const densityScale = Math.min(1, 8 / Math.max(8, tvPageSize));
  const scaleFactor = monthScale * resolutionScale * densityScale;
  const timelineHeaderHeight = Math.max(42, Math.round(52 * scaleFactor));
  const expectedRows = Math.max(1, Math.max(tvPageSize, sites.length));
  const availableHeight = Math.max(280, resolution.height - 260);
  const adaptiveRowHeight = Math.floor((availableHeight - timelineHeaderHeight - expectedRows * 2) / expectedRows);
  const rowHeight = Math.max(34, Math.min(Math.round(64 * scaleFactor), adaptiveRowHeight));
  const periodHeight = Math.max(16, Math.round(rowHeight * 0.55));
  const timelineLeadIn = 12;
  const siteColumnMinWidth = dense ? 220 : 320;
  const siteColumnWidth = Math.max(
    siteColumnMinWidth,
    Math.min(
      Math.round((dense ? 390 : 480) * scaleFactor),
      Math.round(resolution.width * 0.48),
    ),
  );
  const visibleTickInterval = displayMonths >= 6 ? 3 : displayMonths >= 4 ? 2 : 1;

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 font-bold shadow-xl">
      <div className="mb-4 flex shrink-0 items-center justify-end">
        <span className="text-sm text-slate-400">
          {start.format('DD.MM.YYYY')} – {end.format('DD.MM.YYYY')}
        </span>
      </div>

      <div className="relative h-full overflow-hidden">
        <div
          className="grid gap-x-3 gap-y-1.5"
          style={{ gridTemplateColumns: `${siteColumnWidth}px minmax(0, 1fr)` }}
        >
          <div className="text-base uppercase tracking-wide text-slate-200">Baustelle</div>
          <div className="relative rounded bg-slate-950/50" style={{ height: timelineHeaderHeight }}>
            <div className="relative h-full" style={{ marginLeft: timelineLeadIn, width: `calc(100% - ${timelineLeadIn}px)` }}>
              {ticks.map((tick, index) => {
                const left = `${(tick.diff(start, 'day') / totalDays) * 100}%`;
                const isVisibleTick = index % visibleTickInterval === 0;
                return (
                  <div key={tick.toString()} className="absolute inset-y-0" style={{ left }}>
                    <div className="h-full border-l border-slate-700/80" />
                    {isVisibleTick && (
                      <span className="absolute top-0 ml-1 text-xs leading-tight text-slate-200">
                        <span className="block">KW{tick.isoWeek()}</span>
                        <span className="block whitespace-nowrap text-[11px]">{weekDateRangeLabel(tick, end)}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {sites.map((site) => (
            <Fragment key={site.id}>
              <div key={`${site.id}-meta`} className="rounded-lg bg-slate-950/40 p-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate">{site.name}</p>
                  <span className={`inline-flex shrink-0 rounded px-2 py-0.5 text-xs ${statusBadgeClass[site.status]}`}>
                    {statusLabel[site.status]}
                  </span>
                </div>
                <p className="text-xs font-normal text-slate-400">
                  {site.customer} · {site.location}
                </p>
              </div>
              <div key={`${site.id}-bar`} className="relative flex items-center rounded-lg bg-slate-950/30" style={{ height: rowHeight }}>
                <div className="relative h-full" style={{ marginLeft: timelineLeadIn, width: `calc(100% - ${timelineLeadIn}px)` }}>
                  {ticks.map((tick) => {
                    const left = `${(tick.diff(start, 'day') / totalDays) * 100}%`;
                    return <div key={`${site.id}-tick-${tick.toString()}`} className="absolute inset-y-0 border-l border-slate-800/70" style={{ left }} />;
                  })}

                  {(site.periods || []).map((period, index) => {
                    const { offset, length } = clampDays(period.startDate, period.endDate, start, end);
                    const left = `${(offset / totalDays) * 100}%`;
                    const width = `${(length / totalDays) * 100}%`;

                    return (
                      <div
                        key={`${site.id}-period-${index}`}
                        className="absolute flex items-center rounded-md border border-white/10 px-2 text-xs font-medium text-white shadow-sm"
                        style={{ height: periodHeight, left, width, backgroundColor: `${site.color}CC` }}
                        title={`${site.name}: ${dayjs(period.startDate).format('DD.MM.')} - ${dayjs(period.endDate).format('DD.MM.')}`}
                      >
                        <span className="truncate">{weekRangeLabel(period.startDate, period.endDate)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
