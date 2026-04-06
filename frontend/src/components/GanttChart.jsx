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

export default function GanttChart({ sites, dense = false, displayMonths = 3, referenceDate }) {
  const { start, end } = nextMonthsRange(displayMonths, referenceDate);
  const totalDays = end.diff(start, 'day') + 1;
  const ticks = weekTicks(start, end);
  const scaleFactor = Math.min(1, 3 / Math.max(3, displayMonths));
  const siteColumnWidth = Math.round((dense ? 260 : 320) * scaleFactor);
  const rowHeight = Math.max(48, Math.round(64 * scaleFactor));
  const periodHeight = Math.max(24, Math.round(32 * scaleFactor));
  const timelineHeaderHeight = Math.max(28, Math.round(32 * scaleFactor));
  const visibleTickInterval = displayMonths >= 6 ? 3 : displayMonths >= 4 ? 2 : 1;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gantt-Übersicht (nächste {displayMonths} Monate)</h2>
        <span className="text-sm text-slate-400">
          {start.format('DD.MM.YYYY')} – {end.format('DD.MM.YYYY')}
        </span>
      </div>

      <div className="relative overflow-x-hidden">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `${siteColumnWidth}px minmax(0, 1fr)` }}
        >
          <div className="text-xs uppercase tracking-wide text-slate-400">Baustelle</div>
          <div className="relative rounded bg-slate-950/50" style={{ height: timelineHeaderHeight }}>
            {ticks.map((tick, index) => {
              const left = `${(tick.diff(start, 'day') / totalDays) * 100}%`;
              const isVisibleTick = index % visibleTickInterval === 0;
              return (
                <div key={tick.toString()} className="absolute inset-y-0" style={{ left }}>
                  <div className="h-full border-l border-slate-700/80" />
                  {isVisibleTick && <span className="absolute top-0 ml-1 text-[10px] text-slate-400">KW{tick.isoWeek()}</span>}
                </div>
              );
            })}
          </div>

          {sites.map((site) => (
            <Fragment key={site.id}>
              <div key={`${site.id}-meta`} className="rounded-lg bg-slate-950/40 p-3">
                <p className="font-semibold">{site.name}</p>
                <p className="text-xs text-slate-400">
                  {site.customer} · {site.location}
                </p>
                <span className={`mt-2 inline-flex rounded px-2 py-0.5 text-xs ${statusBadgeClass[site.status]}`}>
                  {statusLabel[site.status]}
                </span>
              </div>
              <div key={`${site.id}-bar`} className="relative flex items-center rounded-lg bg-slate-950/30" style={{ height: rowHeight }}>
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
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
